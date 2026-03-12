import { supabase } from './supabase';
import { Project, Lead } from './types';
import { MOCK_PROJECTS, MOCK_LEADS } from './mock-data';

// --- Simulation Persistence Helpers ---
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

// --- API Functions ---

export async function getPublicProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('publish_status', 'Published')
    .order('created_at', { ascending: false });
    
  if (error || !data || data.length === 0) {
    const simData = getStoredData('projects', MOCK_PROJECTS);
    return simData.filter(p => p.publish_status === 'Published');
  }
  return data as Project[];
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
  const states = new Set(data.map(p => p.state));
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
    
  if (error || !data || data.length === 0) {
    const simData = getStoredData('projects', MOCK_PROJECTS);
    return simData.filter(p => p.publish_status === 'Published' && p.state.toLowerCase() === state.toLowerCase());
  }
  return data as Project[];
}

export async function getAdminProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error || !data || data.length === 0) {
    return getStoredData('projects', MOCK_PROJECTS);
  }
  return data as Project[];
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
    const simData = getStoredData('projects', MOCK_PROJECTS);
    const index = simData.findIndex(p => p.slug === slug);
    if (index !== -1) {
      simData[index] = { ...simData[index], ...updates };
      setStoredData('projects', simData);
      return simData[index];
    }
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
      const simData = getStoredData('projects', MOCK_PROJECTS);
      const filtered = simData.filter(p => p.slug !== slug);
      setStoredData('projects', filtered);
      return true;
    }
    return true;
  } catch (e) {
    const simData = getStoredData('projects', MOCK_PROJECTS);
    const filtered = simData.filter(p => p.slug !== slug);
    setStoredData('projects', filtered);
    return true;
  }
}

export async function updateLeadStatus(id: string, status: string, notes?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ status, notes })
      .eq('id', id);
      
    if (error) {
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
    const simLeads = getStoredData('leads', MOCK_LEADS);
    const index = simLeads.findIndex(l => l.id === id);
    if (index !== -1) {
      simLeads[index] = { ...simLeads[index], status: status as any, notes };
      setStoredData('leads', simLeads);
    }
    return true;
  }
}

export async function approveAndConvertToProject(id: string, notes?: string): Promise<boolean> {
  const simLeads = getStoredData<Lead>('leads', MOCK_LEADS);
  const leadIndex = simLeads.findIndex(l => l.id === id);
  if (leadIndex === -1) return false;

  const lead = simLeads[leadIndex];
  
  // 1. Update Lead Status
  simLeads[leadIndex] = { ...lead, status: 'Approved', notes };
  setStoredData('leads', simLeads);

  // 2. Create New Project from Lead Data
  const simProjects = getStoredData<Project>('projects', MOCK_PROJECTS);
  
  // Create a slug from mosque name or title
  const baseString = lead.extracted_mosque_name || lead.raw_title;
  const slug = `${baseString.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

  // Dedicated image handling for demo mosques
  let imageUrl = "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=800";
  if (lead.extracted_mosque_name?.includes("Lestari Putra")) {
    imageUrl = "/images/masjid-lestari-putra.png";
  } else if (lead.extracted_mosque_name?.includes("Hazelton")) {
    imageUrl = "/images/hazelton-render.png";
  }

  // Extract target amount from notes if possible (heuristic)
  let targetAmount = 50000;
  if (lead.notes?.includes("Sasaran: RM")) {
    const match = lead.notes.match(/Sasaran: RM(\d+)/);
    if (match) targetAmount = parseInt(match[1]);
  }

  const newProject: Project = {
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
    completion_percent: 0,
    needs_donation: true,
    donation_method_type: "Both",
    duitnow_qr_url: lead.detected_qr || "/images/qr-cropped.png",
    bank_name: lead.detected_bank_name || "Maybank",
    account_name: lead.detected_acc_name || lead.extracted_mosque_name || "Bendahari Masjid",
    account_number: lead.detected_acc_number || "1234567890",
    image_url: imageUrl
  };

  simProjects.unshift(newProject);
  setStoredData('projects', simProjects);

  return true;
}

export async function getAllLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error || !data || data.length === 0) {
    return getStoredData('leads', MOCK_LEADS);
  }
  return data as Lead[];
}

export async function submitLead(lead: Partial<Lead>): Promise<Lead | null> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single();
      
    if (error) {
      const simLeads = getStoredData('leads', MOCK_LEADS);
      const newLead = { id: `sim-${Date.now()}`, created_at: new Date().toISOString(), ...lead } as Lead;
      simLeads.push(newLead);
      setStoredData('leads', simLeads);
      return newLead;
    }
    return data as Lead;
  } catch (e) {
    const simLeads = getStoredData('leads', MOCK_LEADS);
    const newLead = { id: `sim-${Date.now()}`, created_at: new Date().toISOString(), ...lead } as Lead;
    simLeads.push(newLead);
    setStoredData('leads', simLeads);
    return newLead;
  }
}

