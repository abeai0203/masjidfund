import { supabase } from './supabase';
import { Project, Lead } from './types';
import { MOCK_PROJECTS } from './mock-data';

export async function getPublicProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('publish_status', 'Published')
    .order('created_at', { ascending: false });
    
  if (error || !data || data.length === 0) {
    if (error) console.error("Error fetching projects:", error.message);
    // Simulation fallback
    return MOCK_PROJECTS;
  }
  return data as Project[];
}

export async function getAllStates(): Promise<string[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('state')
    .eq('publish_status', 'Published');
    
  if (error || !data || data.length === 0) {
    // Fallback: derive states from mock data
    return Array.from(new Set(MOCK_PROJECTS.map(p => p.state))).sort();
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
    // Fallback: find in mock data
    return MOCK_PROJECTS.find(p => p.slug === slug) || null;
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
    // Fallback: filter mock data by state
    return MOCK_PROJECTS.filter(p => p.state.toLowerCase() === state.toLowerCase());
  }
  return data as Project[];
}

export async function getAdminProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching admin projects:", error.message);
    return [];
  }
  return data as Project[];
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error("Error fetching lead:", error.message);
    return null;
  }
  return data as Lead;
}

export async function getAllLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching leads:", error.message);
    return [];
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
      console.warn("Real submission failed (likely DB not ready):", error.message);
      // Simulation success for demo purposes
      return { id: 'mock-id', ...lead } as Lead;
    }
    return data as Lead;
  } catch (e) {
    console.warn("Supabase connection error:", e);
    // Simulation success for demo purposes
    return { id: 'mock-id', ...lead } as Lead;
  }
}
