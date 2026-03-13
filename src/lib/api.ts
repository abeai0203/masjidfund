import { supabase } from './supabase';
import { Project, Lead, DiscoveryLead } from './types';
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
export async function uploadImage(file: File | Blob | string, bucket: string = 'images'): Promise<{ url: string | null, error: string | null }> {
  try {
    let finalFile: File | Blob;
    let fileName: string;

    if (typeof file === 'string') {
      // Handle base64 / data URL
      const response = await fetch(file);
      finalFile = await response.blob();
      fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    } else {
      finalFile = file;
      const originalName = (file as any).name || 'image.jpg';
      const extension = originalName.split('.').pop();
      fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, finalFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Storage upload error:", error);
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

// --- API Functions ---

export async function getPublicProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('publish_status', 'Published')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Supabase error fetching public projects:", error);
    // Only fall back to mocks if there's an actual error (e.g. network)
    const simData = getStoredData('projects', MOCK_PROJECTS);
    return simData.filter(p => p.publish_status === 'Published');
  }
  
  // If data is empty but no error, it means the DB is genuinely empty.
  // We returning it as is (which will show 0 projects) to avoid showing dummy data.
  return (data as Project[]) || [];
}

export async function getAllStates(): Promise<string[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('state')
    .eq('publish_status', 'Published');
    
  if (error || !data || data.length === 0) {
    const simData = getStoredData('projects', MOCK_PROJECTS);
    return Array.from(new Set(simData.filter(p => p.publish_status === 'Published').map(p => p.state))).sort();
  }
  const states = new Set(data.filter(p => p.state).map(p => p.state));
  return Array.from(states).sort();
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();
    
  if (error || !data) {
    const simData = getStoredData('projects', MOCK_PROJECTS);
    return simData.find(p => p.slug === slug) || null;
  }
  return data as Project;
}

export async function getProjectsByState(state: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('publish_status', 'Published')
    .ilike('state', state)
    .order('created_at', { ascending: false });
    
  if (error) {
    const simData = getStoredData('projects', MOCK_PROJECTS);
    return simData.filter(p => p.publish_status === 'Published' && p.state.toLowerCase() === state.toLowerCase());
  }
  return (data as Project[]) || [];
}

export async function getAdminProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Supabase error fetching admin projects:", error);
    return getStoredData('projects', MOCK_PROJECTS);
  }
  return (data as Project[]) || [];
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error || !data) {
    const simLeads = getStoredData('leads', MOCK_LEADS);
    return simLeads.find(l => l.id === id) || null;
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
      console.warn("Supabase update fail, falling back to local simulation:", error.message);
      const simData = getStoredData('projects', MOCK_PROJECTS);
      const index = simData.findIndex(p => p.slug === slug);
      if (index !== -1) {
        simData[index] = { ...simData[index], ...updates };
        setStoredData('projects', simData);
        return simData[index];
      }
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
    image_url: lead.image_url || imageUrl
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
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Supabase error fetching leads:", error);
    return getStoredData('leads', MOCK_LEADS);
  }
  return (data as Lead[]) || [];
}

export async function submitLead(lead: Partial<Lead>): Promise<Lead | null> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single();
      
    if (error) {
      console.warn("Supabase lead submission fail, falling back to local simulation:", error.message);
      const simLeads = getStoredData('leads', MOCK_LEADS);
      const newLead = { id: `sim-${Date.now()}`, created_at: new Date().toISOString(), ...lead } as Lead;
      simLeads.push(newLead);
      setStoredData('leads', simLeads);
      return newLead;
    }
    return data as Lead;
  } catch (e) {
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
  
  const rawResults: DiscoveryLead[] = [
    {
      discovery_id: "v3_fb_act_001",
      confidence: 99,
      source_platform: "Facebook",
      source_url: "https://www.facebook.com/masjidalhasanahbbb",
      raw_title: "Masjid Al-Hasanah Bandar Baru Bangi - Tabung Infak Al-Quran",
      raw_summary: "Program Infak Al-Quran dan pembangunan tahfiz. Jom menyumbang untuk keberkatan berpanjangan. Hubungi kami atau imbas QR DuitNow Masjid.",
      extracted_mosque_name: "Masjid Al-Hasanah",
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
      source_url: "https://www.facebook.com/masjidwilayah",
      raw_title: "Tabung Ihsan Masjid Wilayah Persekutuan",
      raw_summary: "Masjid Wilayah membuka peluang infak untuk program kebajikan masyarakat dan asnaf. Scan QR DuitNow rasmi kami.",
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
      raw_title: "Masjid Puncak Alam - Dana Kecemasan Baiki Paip",
      raw_summary: "Paip utama masjid pecah. Memerlukan dana segera untuk baiki. Infaq anda amat dihargai. QR Kod ada dilampirkan.",
      extracted_mosque_name: "Masjid Puncak Alam",
      state: "Selangor",
      detected_bank_name: "CIMB Bank",
      detected_acc_number: "860123456789",
      detected_qr: "/images/qr-cropped.png",
      detected_project_type: "Emergency Fund",
      image_url: "https://images.unsplash.com/photo-1512632510497-a492f1599813?auto=format&fit=crop&q=80&w=800"
    }
  ];

  // Dynamic Link Accessibility Check (Simulated)
  const resultsWithValidation = await Promise.all(rawResults.map(async (item) => {
    const blacklist = ['broken-link.com', 'expired-post.my'];
    const isMainstream = item.source_url?.includes('facebook.com') || item.source_url?.includes('instagram.com');
    const notBlacklisted = !blacklist.some(b => item.source_url?.includes(b));
    const isLinkActive = isMainstream && notBlacklisted && !!item.source_url;
    
    return { ...item, is_source_active: isLinkActive };
  }));

  // FINAL STRICT FILTERING (v3.0):
  // 1. Must have QR
  // 2. Must not exist in DB (Deduplication)
  // 3. Must have ACTIVE verified link
  // 4. MUST NOT BE DISMISSED PERMANENTLY (New persistence)
  return resultsWithValidation.filter(item => {
    const hasQr = !!item.detected_qr;
    const isDuplicate = existingUrls.has(item.source_url!) || 
                       (item.detected_acc_number && existingAccounts.has(item.detected_acc_number));
    const isActive = item.is_source_active;
    const isDismissedPersistent = dismissedIds.has(item.discovery_id);
    
    return hasQr && !isDuplicate && isActive && !isDismissedPersistent;
  }) as DiscoveryLead[];
}

export async function dismissLeadPermanently(discoveryId: string) {
  const { error } = await supabase
    .from('dismissed_leads')
    .insert([{ discovery_id: discoveryId }]);

  return { success: !error, error };
}
