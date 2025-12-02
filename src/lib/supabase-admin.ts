import { createClient } from "@supabase/supabase-js";

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!supabaseServiceKey) {
  console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
}

// Server-side Supabase client with service role key for admin operations
export const supabaseAdmin = createClient(
  supabaseUrl || "",
  supabaseServiceKey || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      // Add fetch options for better timeout handling
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          // Set a reasonable timeout for requests
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });
      },
    },
    db: {
      schema: "public",
    },
  }
);

/**
 * Helper function to check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseServiceKey);
}
