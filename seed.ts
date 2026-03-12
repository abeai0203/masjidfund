import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load our specific local env file
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Superbase URL or Anon Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const MOCK_PROJECTS = [
  {
    mosque_name: "Masjid Jamek An-Nur",
    slug: "masjid-jamek-an-nur-selangor",
    state: "Selangor",
    district: "Petaling Jaya",
    title: "Major Roof Renovation for Masjid Jamek An-Nur",
    short_description: "Urgent roof repair needed before the monsoon season starts in November.",
    full_description: "Masjid Jamek An-Nur has serves the Petaling Jaya community for over 30 years. Recently, structural engineers have identified severe termite damage in the main prayer hall's roof trusses. We need urgent funding to replace the entire roof structure to ensure the safety of our congregation before the heavy monsoon rains begin. All donations will go directly to the contractor's escrow account managed by the mosque committee.",
    project_type: "Renovation",
    verification_status: "Verified",
    publish_status: "Published",
    target_amount: 150000,
    collected_amount: 85000,
    needs_donation: true,
    donation_method_type: "Both",
    duitnow_qr_url: "/placeholder-qr.png",
    bank_name: "Maybank Islamic",
    account_name: "AJK Masjid Jamek An-Nur",
    account_number: "5622-1234-5678",
    image_url: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=2938&auto=format&fit=crop",
  },
  {
    mosque_name: "Surau Al-Ikhlas",
    slug: "surau-al-ikhlas-construction-johor",
    state: "Johor",
    district: "Batu Pahat",
    title: "New Surau Construction in Taman Harmoni",
    short_description: "Building a new surau to accommodate the growing population of Taman Harmoni.",
    full_description: "Taman Harmoni is a newly developed residential area with over 2,000 Muslim families, but the nearest mosque is currently 15km away. The state religious council has approved this plot of land for a new Surau. We are raising funds for Phase 1 construction which includes the main prayer hall, ablution areas, and basic amenities.",
    project_type: "Construction",
    verification_status: "Basic Checked",
    publish_status: "Published",
    target_amount: 500000,
    collected_amount: 120000,
    needs_donation: true,
    donation_method_type: "Bank Transfer",
    bank_name: "Bank Islam",
    account_name: "Tabung Pembangunan Surau Al-Ikhlas",
    account_number: "0101-4021-9999",
    image_url: "https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=2835&auto=format&fit=crop",
  }
];

async function seedData() {
  console.log("Starting database seeding...");
  
  // Test connection
  const { data, error } = await supabase.from('projects').select('id').limit(1);
  
  if (error) {
     console.error("Connection failed! Error:", error.message);
     return;
  }
  
  console.log("Connection successful! Attempting to insert mock projects...");
  
  // Insert 2 mock projects to test
  const { error: insertError } = await supabase.from('projects').insert(MOCK_PROJECTS);
  
  if (insertError) {
     // If violating RLS, it means our setup is currently restricting anonymous inserts
     // (Which is correct based on our SQL, but we need to bypass it for the test script or confirm it happened)
     console.error("Insert failed (Likely due to RLS, but connection is VERIFIED). Note:", insertError.message);
  } else {
     console.log("Successfully inserted mock data!");
  }
}

seedData();
