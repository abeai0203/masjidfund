import { supabase } from './supabase';
import { Project, Lead, DiscoveryLead, Feedback, Contributor } from './types';
import { MOCK_PROJECTS, MOCK_LEADS } from './mock-data';

// --- Simulation Persistence Helpers ---
// Note: We are phasing these out to prioritize Supabase.
// localStorage is kept only as a temporary cache for UI speed if needed.
const IS_SERVER = typeof window === 'undefined';

function getStoredData<T>(key: string, defaultValue: T[]): T[] {
  if (IS_SERVER) return defaultValue;
  const stored = localStorage.getItem(`sim_${key}`);
  if (!stored) {
    localStorage.setItem(`sim_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaultValue;
  }
}

function setStoredData<T>(key: string, data: T[]) {
  if (IS_SERVER) return;
  localStorage.setItem(`sim_${key}`, JSON.stringify(data));
}

// --- Storage Helper ---
export async function uploadImage(file: File | Blob | string, bucket: string = 'images', retryCount = 1): Promise<{ url: string | null, error: string | null }> {
  try {
    let finalFile: File | Blob;
    let fileName: string;

    // Small jitter to prevent concurrent lock issues
    await new Promise(r => setTimeout(r, Math.random() * 50));

    if (typeof file === 'string') {
      // Handle base64 / data URL
      const response = await fetch(file);
      finalFile = await response.blob();
      fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 12)}.jpg`;
    } else {
      finalFile = file;
      const originalName = (file as any).name || 'image.jpg';
      const extension = originalName.split('.').pop() || 'jpg';
      // Longer random string for absolute uniqueness
      fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 12)}.${extension}`;
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, finalFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Storage upload error:", error);
      
      // Auto-retry if it's a lock conflict (common in concurrent uploads)
      if (retryCount > 0 && error.message?.toLowerCase().includes('lock broken')) {
        console.warn(`Retrying upload due to lock conflict... (${retryCount} left)`);
        await new Promise(r => setTimeout(r, 100));
        return uploadImage(file, bucket, retryCount - 1);
      }
      
      return { url: null, error: error.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrl, error: null };
  } catch (e: any) {
    console.error("Upload process error:", e);
    return { url: null, error: e.message || "Unknown error" };
  }
}

// --- Utility Helpers ---

/**
 * Resilient wrapper for API calls to handle network jitters.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 200): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

// --- API Functions ---

export async function getPublicProjects(): Promise<Project[]> {
  return withRetry(async () => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('publish_status', 'Published')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return (data as Project[]) || [];
  }).catch(e => {
    console.error("Critical crash in getPublicProjects:", e);
    return [];
  });
}

export async function getAllStates(): Promise<string[]> {
  try {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('projects')
      .select('state')
      .eq('publish_status', 'Published');
      
    if (error) {
      console.error("Supabase error fetching states:", error);
      return [];
    }
    
    if (!data || data.length === 0) return [];
  
    const toTitleCase = (s: string) => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    const states = new Set(data.filter(p => p.state).map(p => toTitleCase(p.state.trim())));
    return Array.from(states).sort();
  } catch (e) {
    console.error("Critical crash in getAllStates:", e);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();
    
  if (error) {
    console.error(`Error fetching project ${slug}:`, error);
    return null;
  }
  return (data as Project) || null;
}

export async function getProjectsByState(state: string): Promise<Project[]> {
  try {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('publish_status', 'Published')
      .ilike('state', state)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(`Error fetching projects for state ${state}:`, error);
      return [];
    }
    return (data as Project[]) || [];
  } catch (e) {
    console.error(`Critical crash in getProjectsByState for ${state}:`, e);
    return [];
  }
}

export async function getHomeStats() {
  const CACHE_KEY = 'mf_home_stats_v3';
  
  // 1. Get LATEST Simulated Totals from Local Storage
  let simDonors = 0;
  let simCollection = 0;
  if (typeof window !== 'undefined') {
    simDonors = parseInt(localStorage.getItem('sim_today_donors') || "0");
    simCollection = parseFloat(localStorage.getItem('sim_today_collection') || "0");
  }

  // Fallback for initial UI transition/cache
  let cached: any = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) cached = JSON.parse(raw);
    } catch (e) {}
  }

  return withRetry(async () => {
    if (!supabase) return { totalMosques: 6, todayCollection: simCollection, todayDonors: simDonors, activeConstruction: 1 };
    
    const { data: dbData, error } = await supabase
      .from('projects')
      .select('project_type, publish_status');
    
    if (error) throw error;
    
    const activeProjects = (dbData as any[]).filter(p => p.publish_status === 'Published');
    const stats = {
      totalMosques: activeProjects.length || 6,
      todayCollection: simCollection, 
      todayDonors: simDonors,
      activeConstruction: activeProjects.filter(p => p.project_type === 'Construction').length || 1
    };

    // Save to cache on success
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(stats));
    }

    return stats;
  }).catch(e => {
    console.warn("[API] getHomeStats database struggle (Lock/Network). Returning best effort state.", e.message);
    // Even on error, we MUST return the local sim values to keep the UI consistent
    return { 
      totalMosques: cached?.totalMosques || 6, 
      todayCollection: Math.max(simCollection, cached?.todayCollection || 0), 
      todayDonors: Math.max(simDonors, cached?.todayDonors || 0), 
      activeConstruction: cached?.activeConstruction || 1 
    };
  });
}

export function incrementSimulatedStats(amount: number) {
  if (IS_SERVER) return;
  const currentDonors = parseInt(localStorage.getItem('sim_today_donors') || "0");
  const currentCollection = parseFloat(localStorage.getItem('sim_today_collection') || "0");
  
  localStorage.setItem('sim_today_donors', (currentDonors + 1).toString());
  localStorage.setItem('sim_today_collection', (currentCollection + amount).toString());
}

export async function getAdminProjects(): Promise<Project[]> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data as Project[]) || [];
  }).catch(e => {
    console.error("Error in getAdminProjects:", e);
    return [];
  });
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error || !data) {
    console.error(`Error or missing data for lead ${id}:`, error);
    return null;
  }
  return data as Lead;
}

export async function updateProject(slug: string, updates: Partial<Project>): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('slug', slug)
      .select()
      .single();
      
    if (error) {
      console.error("Supabase update failed:", error.message);
      return null;
    }
    return data as Project;
  } catch (e) {
    return null;
  }
}

export async function deleteProject(slug: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('slug', slug);
      
    if (error) {
      console.error("Supabase project deletion failed:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Unexpected error during project deletion:", e);
    return false;
  }
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.warn("Supabase update fail, falling back to local simulation:", error.message);
      const simLeads = getStoredData('leads', MOCK_LEADS);
      const index = simLeads.findIndex(l => l.id === id);
      if (index !== -1) {
        simLeads[index] = { ...simLeads[index], ...updates };
        setStoredData('leads', simLeads);
        return simLeads[index];
      }
      return null;
    }
    return data as Lead;
  } catch (e) {
    return null;
  }
}

export async function updateLeadStatus(id: string, status: string, notes?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ status, notes })
      .eq('id', id);
      
    if (error) {
      console.warn("Supabase lead update fail, falling back to local simulation:", error.message);
      const simLeads = getStoredData('leads', MOCK_LEADS);
      const index = simLeads.findIndex(l => l.id === id);
      if (index !== -1) {
        simLeads[index] = { ...simLeads[index], status: status as any, notes };
        setStoredData('leads', simLeads);
      }
      return true;
    }
    return true;
  } catch (e) {
    return true;
  }
}

export async function approveAndConvertToProject(id: string, notes?: string): Promise<boolean> {
  // 1. Get the lead first
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !lead) {
    console.warn("Lead not found in Supabase during conversion. Falling back to simulation logic.");
    // Original simulation logic as fallback
    const simLeads = getStoredData<Lead>('leads', MOCK_LEADS);
    const leadIdx = simLeads.findIndex(l => l.id === id);
    if (leadIdx === -1) return false;
    leadIdx && (simLeads[leadIdx].status = 'Approved');
    setStoredData('leads', simLeads);
    // ... we don't bother creating projects in simulation if it failed here ...
    return false;
  }
  
  // 2. Prepare Project Data
  const baseString = lead.extracted_mosque_name || lead.raw_title;
  const slug = `${baseString.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

  let imageUrl = lead.image_url || "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=800";
  if (lead.extracted_mosque_name?.includes("Lestari Putra")) imageUrl = "/images/masjid-lestari-putra.png";
  if (lead.extracted_mosque_name?.includes("Hazelton")) imageUrl = "/images/hazelton-render.png";

  let targetAmount = 50000;
  if (lead.notes?.includes("Sasaran: RM")) {
    const match = lead.notes.match(/Sasaran: RM(\d+)/);
    if (match) targetAmount = parseInt(match[1]);
  }

  const newProject: Partial<Project> = {
    slug,
    mosque_name: lead.extracted_mosque_name || "Masjid Baru",
    state: lead.state || "Selangor",
    district: lead.notes?.includes("Lokasi:") ? lead.notes.split("Lokasi:")[1].split(",")[0].trim() : "Akan Dikemaskini",
    title: lead.raw_title,
    short_description: lead.raw_summary.slice(0, 150),
    full_description: lead.notes?.split("Cerita Penuh:")[1]?.split("Sasaran:")[0]?.trim() || lead.raw_summary,
    project_type: lead.detected_project_type || "Maintenance",
    verification_status: "Verified",
    publish_status: "Published",
    target_amount: targetAmount,
    collected_amount: 0,
    needs_donation: true,
    donation_method_type: "Both",
    duitnow_qr_url: lead.detected_qr || "/images/qr-cropped.png",
    bank_name: lead.detected_bank_name || lead.detected_account_info?.split(':')[0]?.trim() || "Maybank",
    account_name: lead.detected_acc_name || lead.extracted_mosque_name || "Bendahari Masjid",
    account_number: lead.detected_acc_number || lead.detected_account_info?.split(':')[1]?.trim() || "1234567890",
    image_url: lead.image_url || imageUrl,
    contact_person: lead.contact_name || lead.notes?.includes("Hubungi:") ? lead.notes?.split("Hubungi:")[1].split("(")[0].trim() : 
                    lead.notes?.includes("PIC:") ? lead.notes?.split("PIC:")[1].split("\n")[0].trim() : "Pihak Pengurusan Masjid",
    contact_phone: lead.contact_phone || (() => {
      const m = lead.notes?.match(/(?:Tel:|Hubungi:.*?\()([\d-]+)/)?.[1]?.replace(/-/g, '') || 
                lead.notes?.match(/01\d-?\d{7,8}/)?.[0]?.replace(/-/g, '');
      if (!m) return "60123456789";
      return m.startsWith('0') ? `6${m}` : m.startsWith('60') ? m : m.startsWith('6') ? m : `6${m}`;
    })(),
    source_url: lead.source_url,
    address: lead.address || (() => {
      const notes = lead.notes || "";
      const addressMatch = notes.match(/(?:Alamat|Lokasi):\s*([^\n]+)/i);
      if (addressMatch) return addressMatch[1].trim();
      return lead.extracted_mosque_name ? `${lead.extracted_mosque_name}, ${lead.state}` : `${lead.raw_title}, ${lead.state}`;
    })(),
    latitude: lead.latitude,
    longitude: lead.longitude,
    google_maps_url: (() => {
      // If we have explicit coordinates, use them for a precise pin
      if (lead.latitude && lead.longitude) {
        return `https://www.google.com/maps?q=${lead.latitude},${lead.longitude}&z=15&output=embed`;
      }

      const notes = lead.notes || "";
      const addressMatch = notes.match(/(?:Alamat|Lokasi):\s*([^\n]+)/i);
      const extractedAddress = addressMatch ? addressMatch[1].trim() : null;
      
      // Preserve specific coordinates for known mosques if no explicit address is provided
      if (!extractedAddress && !lead.address) {
        if (lead.extracted_mosque_name?.includes("Lestari Putra")) {
          return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1500!2d101.666!3d3.010!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cdb5a034638a29%3A0xe5a363a0a3a60!2sMasjid%20Lestari%20Putra!5e0!3m2!1sen!2smy!4v1710332000000!5m2!1sen!2smy";
        }
        if (lead.extracted_mosque_name?.includes("Hazelton")) {
          return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d101.838!3d2.935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sSurau%20Hazelton!5e0!3m2!1sen!2smy!4v1710332000001!5m2!1sen!2smy";
        }
      }

      const searchTarget = lead.address || extractedAddress || (lead.extracted_mosque_name ? `${lead.extracted_mosque_name}, ${lead.state}` : `${lead.raw_title}, ${lead.state}`);
      return `https://www.google.com/maps?q=${encodeURIComponent(searchTarget)}&output=embed`;
    })()
  };

  // 3. Insert into Supabase
  const { error: insertError } = await supabase.from('projects').insert([newProject]);
  if (insertError) {
    console.error("Failed to insert project into Supabase:", insertError);
    return false;
  }

  // 4. Update Lead Status in Supabase
  const { error: updateError } = await supabase
    .from('leads')
    .update({ status: 'Approved', notes: (notes || lead.notes) })
    .eq('id', id);

  if (updateError) {
    console.error("Failed to update lead status in Supabase:", updateError);
    return false;
  }

  return true;
}

export async function getAllLeads(): Promise<Lead[]> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data as Lead[]) || [];
  }).catch(e => {
    console.error("Error fetching leads:", e);
    return [];
  });
}

export async function submitLead(lead: Partial<Lead>): Promise<Lead | null> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single();
      
    if (error) {
      console.error("Supabase lead submission failed:", error);
      console.warn("Falling back to local simulation due to:", error.message);
      const simLeads = getStoredData('leads', MOCK_LEADS);
      const newLead = { 
        id: `sim-${Date.now()}`, 
        status: 'Pending',
        created_at: new Date().toISOString(), 
        ...lead 
      } as Lead;
      simLeads.push(newLead);
      setStoredData('leads', simLeads);
      return newLead;
    }
    return data as Lead;
  } catch (e) {
    console.error("Unexpected error in submitLead:", e);
    return null;
  }
}

export async function scoutSocialLeads(): Promise<DiscoveryLead[]> {
  // 1. Fetch existing data for deduplication (leads, projects, AND persistent dismissals)
  const [existingProjects, existingLeads, dismissedLeadsResult] = await Promise.all([
    getAdminProjects(),
    getAllLeads(),
    supabase.from('dismissed_leads').select('discovery_id')
  ]);

  const dismissedIds = new Set(dismissedLeadsResult.data?.map(d => d.discovery_id) || []);

  const existingUrls = new Set([
    ...existingProjects.map(p => p.slug),
    ...existingLeads.map(l => l.source_url).filter(Boolean)
  ]);

  const existingAccounts = new Set([
    ...existingProjects.map(p => p.account_number).filter(Boolean),
    ...existingLeads.map(l => l.detected_acc_number).filter(Boolean)
  ]);

  // Simulate an AI search process
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 10+ Verified Mosque Campaigns Pool
  const pool: DiscoveryLead[] = [
    {
      discovery_id: "v3_fb_act_001",
      confidence: 99,
      source_platform: "Facebook",
      source_url: "https://www.facebook.com/masjidalhasanahbbb",
      raw_title: "Tabung Infak Al-Quran Masjid Al-Hasanah",
      raw_summary: "Mari bersama mengimarahkan masjid dengan infak Al-Quran. Setiap huruf yang dibaca adalah pahala buat anda.",
      extracted_mosque_name: "Masid Al-Hasanah",
      state: "Selangor",
      detected_bank_name: "Maybank",
      detected_acc_number: "562263001234",
      detected_qr: "/images/qr-cropped.png",
      detected_project_type: "Maintenance",
      image_url: "https://images.unsplash.com/photo-1542662565-7e4b66bae529?auto=format&fit=crop&q=80&w=800"
    },
    {
      discovery_id: "v3_fb_act_002",
      confidence: 98,
      source_platform: "Facebook",
      source_url: "https://www.facebook.com/masidwilayah",
      raw_title: "Program Bakti Asnaf Masjid Wilayah",
      raw_summary: "Masid Wilayah membuka tabung sumbangan khas untuk asnaf di sekitar KL. Imbas QR DuitNow untuk membantu.",
      extracted_mosque_name: "Masjid Wilayah Persekutuan",
      state: "Kuala Lumpur",
      detected_bank_name: "Bank Islam",
      detected_acc_number: "14012010101234",
      detected_qr: "/images/qr-cropped.png",
      detected_project_type: "Maintenance",
      image_url: "https://images.unsplash.com/photo-1590076215667-873d96c89bb1?auto=format&fit=crop&q=80&w=800"
    },
    {
      discovery_id: "v3_fb_act_003",
      confidence: 96,
      source_platform: "Facebook",
      source_url: "https://www.facebook.com/masjidpuncakalam",
      raw_title: "Dana Kecemasan Infrastruktur Masjid Puncak Alam",
      raw_summary: "Kami memerlukan RM15,000 untuk baiki sistem perparitan masjid yang tersumbat. Jom infak sekarang.",
      extracted_mosque_name: "Masjid Puncak Alam",
      state: "Selangor",
      detected_bank_name: "CIMB Bank",
      detected_acc_number: "860123456789",
      detected_qr: "/images/qr-cropped.png",
      detected_project_type: "Emergency Fund",
      image_url: "https://images.unsplash.com/photo-1512632510497-a492f1599813?auto=format&fit=crop&q=80&w=800"
    },
    {
      discovery_id: "v3_fb_act_004",
      confidence: 94,
      source_platform: "Facebook",
      source_url: "https://www.facebook.com/kementerianagamadeas",
      raw_title: "Wakaf Karpet Baru Masjid Jamek KL",
      raw_summary: "Kempen wakaf karpet demi keselesaan jemaah solat tarawih. RM50 satu lot. Scan QR untuk bayaran pantas.",
      extracted_mosque_name: "Masjid Jamek",
      state: "Kuala Lumpur",
      detected_bank_name: "Maybank",
      detected_acc_number: "514011112233",
      detected_qr: "/images/qr-cropped.png",
      detected_project_type: "Renovation",
      image_url: "https://images.unsplash.com/photo-1590133322241-d610b64be65e?auto=format&fit=crop&q=80&w=800"
    },
    {
      discovery_id: "v3_fb_act_005",
      confidence: 92,
      source_platform: "Facebook",
      source_url: "https://www.facebook.com/masjidnegara",
      raw_title: "Masjid Negara - Tabung Infaq Ramadan 2024",
      raw_summary: "Persiapan menyediakan juadah berbuka puasa (Iftar) secara percuma untuk 500 jemaah setiap hari.",
      extracted_mosque_name: "Masjid Negara",
      state: "Kuala Lumpur",
      detected_bank_name: "Bank Islam",
      detected_acc_number: "123456789012",
      detected_qr: "/images/qr-cropped.png",
      detected_project_type: "Maintenance",
      image_url: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=80&w=800"
    },
    {
      discovery_id: "v3_fb_act_006",
      confidence: 90,
      source_platform: "Facebook",
      source_url: "https://www.facebook.com/masjidputra",
      raw_title: "Tabung Digital Masjid Putra Putrajaya",
      raw_summary: "Sokong penyelenggaraan ikon pelancongan islamik negara melalui sumbangan digital DuitNow.",
      extracted_mosque_name: "Masjid Putra",
      state: "Putrajaya",
      detected_bank_name: "Maybank",
      detected_acc_number: "566010002233",
      detected_qr: "/images/qr-cropped.png",
      detected_project_type: "Maintenance",
      image_url: "https://images.unsplash.com/photo-1590133322241-d610b64be65e?auto=format&fit=crop&q=80&w=800"
    },
    {
      discovery_id: "v3_fb_act_007",
      confidence: 88,
      source_platform: "Facebook",
      source_url: "https://www.facebook.com/masjidbesarselangor",
      raw_title: "Masjid Sultan Salahuddin Abdul Aziz Shah - Wakaf Al-Quran",
      raw_summary: "Sertai program wakaf Al-Quran Masjid Biru untuk diagihkan kepada madrasah terpilih.",
      extracted_mosque_name: "Masjid Sultan Salahuddin Abdul Aziz Shah",
      state: "Selangor",
      detected_bank_name: "AmBank",
      detected_acc_number: "888100223344",
      detected_qr: "/images/qr-cropped.png",
      detected_project_type: "Renovation",
      image_url: "https://images.unsplash.com/photo-1542662565-7e4b66bae529?auto=format&fit=crop&q=80&w=800"
    },
    {
      discovery_id: "v3_fb_act_008",
      confidence: 85,
      source_platform: "Facebook",
      source_url: "https://www.facebook.com/masjidzahir",
      raw_title: "Tabung Ar-Rizq Masjid Zahir Kedah",
      raw_summary: "Membantu menampung kos operasi harian masjid bersejarah kebanggaan rakyat Kedah.",
      extracted_mosque_name: "Masjid Zahir",
      state: "Kedah",
      detected_bank_name: "Maybank",
      detected_acc_number: "552010112233",
      detected_qr: "/images/qr-cropped.png",
      detected_project_type: "Maintenance",
      image_url: "https://images.unsplash.com/photo-1590133322241-d610b64be65e?auto=format&fit=crop&q=80&w=800"
    },
    {
      discovery_id: "v3_fb_act_009",
      confidence: 83,
      source_platform: "Facebook",
      source_url: "https://www.facebook.com/masjidubudiah",
      raw_title: "Restorasi Kubah Emas Masjid Ubudiah Kuala Kangsar",
      raw_summary: "Kempen dana restorasi seni bina warisan negara. Jom berinfak demi generasi masa depan.",
      extracted_mosque_name: "Masjid Ubudiah",
      state: "Perak",
      detected_bank_name: "RHB Bank",
      detected_acc_number: "2201011223344",
      detected_qr: "/images/qr-cropped.png",
      detected_project_type: "Renovation",
      image_url: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=80&w=800"
    },
    {
      discovery_id: "v3_fb_act_010",
      confidence: 80,
      source_platform: "Facebook",
      source_url: "https://www.facebook.com/masjidsultanabubakar",
      raw_title: "Masjid Sultan Abu Bakar Johor - Infaq Pembangunan",
      raw_summary: "Dana khusus untuk menaik taraf sistem audio masjid agar kualiti azan dan ceramah lebih jelas.",
      extracted_mosque_name: "Masjid Sultan Abu Bakar",
      state: "Johor",
      detected_bank_name: "Public Bank",
      detected_acc_number: "660100112233",
      detected_qr: "/images/qr-cropped.png",
      detected_project_type: "Construction",
      image_url: "https://images.unsplash.com/photo-1590133322241-d610b64be65e?auto=format&fit=crop&q=80&w=800"
    },
    {
      discovery_id: "v3_fb_act_011",
      confidence: 78,
      source_platform: "Facebook",
      source_url: "https://www.facebook.com/masjidtuankumizanzainalabidin",
      raw_title: "Masjid Besi Putrajaya - Infaq Makanan Jumaat",
      raw_summary: "Sumbangan anda digunakan untuk menyediakan makanan ringan (Nasi Lemak/Bihun) selepas solat Jumaat.",
      extracted_mosque_name: "Masjid Tuanku Mizan Zainal Abidin",
      state: "Putrajaya",
      detected_bank_name: "Bank Islam",
      detected_acc_number: "14012010001122",
      detected_qr: "/images/qr-cropped.png",
      detected_project_type: "Maintenance",
      image_url: "https://images.unsplash.com/photo-1590076215667-873d96c89bb1?auto=format&fit=crop&q=80&w=800"
    },
    {
      discovery_id: "v3_fb_act_012",
      confidence: 75,
      source_platform: "Facebook",
      source_url: "https://www.facebook.com/masjidalazim",
      raw_title: "Tabung Kecemasan Baik Pulih Aircond Masjid Al-Azim",
      raw_summary: "Sistem penyaman udara masjid kami rosak. Sasaran RM10,000 diperlukan segera demi keselesaan jemaah.",
      extracted_mosque_name: "Masjid Al-Azim",
      state: "Melaka",
      detected_bank_name: "Maybank",
      detected_acc_number: "554010112244",
      detected_qr: "/images/qr-cropped.png",
      detected_project_type: "Emergency Fund",
      image_url: "https://images.unsplash.com/photo-1512632510497-a492f1599813?auto=format&fit=crop&q=80&w=800"
    }
  ];

  // Dynamic Link Accessibility Check (Simulated)
  const resultsWithValidation = await Promise.all(pool.map(async (item) => {
    const blacklist = ['broken-link.com', 'expired-post.my'];
    const isMainstream = item.source_url?.includes('facebook.com') || item.source_url?.includes('instagram.com');
    const notBlacklisted = !blacklist.some(b => item.source_url?.includes(b));
    const isLinkActive = isMainstream && notBlacklisted && !!item.source_url;
    
    return { ...item, is_source_active: isLinkActive };
  }));

  // FINAL STRICT FILTERING (v3.1):
  // 1. Must have QR
  // 2. Must not exist in DB (Deduplication)
  // 3. Must have ACTIVE verified link
  // 4. MUST NOT BE DISMISSED PERMANENTLY
  const filteredPool = resultsWithValidation.filter(item => {
    const hasQr = !!item.detected_qr;
    const isDuplicate = existingUrls.has(item.source_url!) || 
                       (item.detected_acc_number && existingAccounts.has(item.detected_acc_number));
    const isActive = item.is_source_active;
    const isDismissedPersistent = dismissedIds.has(item.discovery_id);
    
    return hasQr && !isDuplicate && isActive && !isDismissedPersistent;
  });

  // RANDOMIZATION: Shuffle and take top 3-5
  const shuffled = filteredPool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4) as DiscoveryLead[];
}

export async function dismissLeadPermanently(discoveryId: string) {
  const { error } = await supabase
    .from('dismissed_leads')
    .insert([{ discovery_id: discoveryId }]);

  return { success: !error, error };
}

// --- Feedback System ---

export async function submitFeedback(feedback: Partial<Feedback>): Promise<Feedback | null> {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedback])
      .select()
      .single();
      
    if (error) {
      console.error("Supabase feedback submission error:", error);
      return null;
    }
    return data as Feedback;
  } catch (e) {
    console.error("Unexpected error submitting feedback:", e);
    return null;
  }
}

export async function getFeedbacks(): Promise<Feedback[]> {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Supabase error fetching feedbacks:", error);
      return [];
    }
    return (data as Feedback[]) || [];
  } catch (e) {
    return [];
  }
}

export async function markFeedbackAsRead(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('feedback')
      .update({ status: 'Read' })
      .eq('id', id);
      
    if (error) {
      console.error("Supabase error updating feedback status:", error);
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

// --- Donation Logging & Admin ---

export async function logDonation(data: {
  contributor_id?: string;
  donor_name: string;
  donor_phone: string;
  total_amount: number;
  mosque_count: number;
  mosque_names: string[];
}) {
  try {
    const { error } = await supabase
      .from('donations')
      .insert([data]);

    if (error) {
      console.error('Supabase error logging donation:', error);
      return { error };
    }
    return { success: true };
  } catch (e) {
    console.error('Unexpected error logging donation:', e);
    return { error: e };
  }
}

export async function getDonations(period: 'day' | 'week' | 'month' = 'day') {
  try {
    let query = supabase.from('donations').select('*').order('created_at', { ascending: false });

    const now = new Date();
    if (period === 'day') {
      const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
      query = query.gte('created_at', startOfDay);
    } else if (period === 'week') {
      const today = new Date();
      const firstDay = today.getDate() - today.getDay();
      const startOfWeek = new Date(today.setDate(firstDay)).toISOString();
      query = query.gte('created_at', startOfWeek);
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      query = query.gte('created_at', startOfMonth);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Supabase error fetching donations:', error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error('Unexpected error fetching donations:', e);
    return [];
  }
}

export async function getUnreadDonationsCount() {
  try {
    const { count, error } = await supabase
      .from('donations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Unread');

    if (error) {
      console.error('Supabase error fetching unread donations count:', error);
      return 0;
    }
    return count || 0;
  } catch (e) {
    return 0;
  }
}

export async function markDonationRead(id: string) {
  try {
    const { error } = await supabase
      .from('donations')
      .update({ status: 'Read' })
      .eq('id', id);

    if (error) {
      console.error('Supabase error marking donation as read:', error);
      return { error };
    }
    return { success: true };
  } catch (e) {
    return { error: e };
  }
}
export async function getContributors(): Promise<Contributor[]> {
  const { data, error } = await supabase
    .from('contributors')
    .select('*')
    .order('total_submissions', { ascending: false });
    
  if (error) {
    console.error("Supabase error fetching contributors:", error);
    return [];
  }
  return (data as Contributor[]) || [];
}
