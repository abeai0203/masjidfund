// src/lib/types.ts

// --- Public Enums & Types ---
export type VerificationStatus = "Verified" | "Basic Checked" | "Pending";
export type ProjectType = "Construction" | "Renovation" | "Maintenance" | "Emergency Fund";
export type DonationMethodType = "DuitNow QR" | "Bank Transfer" | "Both";

export interface Project {
  id: string;
  slug: string;
  mosque_name: string;
  state: string;
  district: string;
  title: string;
  short_description: string;
  full_description: string;
  project_type: ProjectType;
  verification_status: VerificationStatus;
  publish_status: "Published" | "Draft"; // Added for Admin
  target_amount: number;
  collected_amount: number;
  completion_percent: number;
  needs_donation: boolean;
  donation_method_type: DonationMethodType;
  duitnow_qr_url?: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  image_url?: string;
  contact_person?: string;
  contact_phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  source_url?: string;
}

// --- Admin Enums & Types ---
export type LeadStatus = "Pending" | "Approved" | "Rejected" | "Needs Manual Check";
export type LeadSourceType = "Manual Submission" | "Automated Discovery" | "User Report";

export interface Lead {
  id: string;
  raw_title: string;
  raw_summary: string;
  extracted_mosque_name?: string;
  state?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  source_type: LeadSourceType;
  source_url?: string;
  lead_score: number; // e.g. 0-100 confidence score
  status: LeadStatus;
  created_at: string;
  updated_at?: string;
  notes?: string;
  detected_qr?: string;
  detected_bank_name?: string;
  detected_acc_number?: string;
  detected_acc_name?: string;
  detected_project_type?: ProjectType;
  image_url?: string;
  contact_name?: string;
  contact_phone?: string;
  contributor_id?: string;
  contributor_lat?: number;
  contributor_lng?: number;
  is_anonymous?: boolean;
}

export interface DiscoveryLead extends Partial<Lead> {
  confidence: number;
  source_platform: string;
  discovery_id: string;
}

export interface Feedback {
  id: string;
  created_at: string;
  project_id?: string;
  project_name?: string;
  message: string;
  contact_name?: string;
  contact_phone?: string;
  attachment_url?: string;
  status: "Unread" | "Read" | "Resolved";
}

export interface Donation {
  id: string;
  donor_name: string;
  donor_phone: string;
  total_amount: number;
  mosque_count: number;
  mosque_names: string[];
  status: "Unread" | "Read";
  created_at: string;
}

export interface Contributor {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  last_lat?: number;
  last_lng?: number;
  total_submissions: number;
  created_at: string;
}
