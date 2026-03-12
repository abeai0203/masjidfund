import { supabase } from './supabase';
import { Project, Lead } from './types';

export async function getPublicProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('publish_status', 'Published')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching projects:", error.message);
    return [];
  }
  return data as Project[];
}

export async function getAllStates(): Promise<string[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('state')
    .eq('publish_status', 'Published');
    
  if (error || !data) {
    return [];
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
    
  if (error) {
    console.error("Error fetching project by slug:", error.message);
    return null;
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
    return [];
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
  const { data, error } = await supabase
    .from('leads')
    .insert([lead])
    .select()
    .single();
    
  if (error) {
    console.error("Error submitting lead:", error.message);
    throw error;
  }
  return data as Lead;
}
