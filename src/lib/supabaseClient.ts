import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mevafqibmpsdiagzuyau.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldmFmcWlibXBzZGlhZ3p1eWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MjcyMzQsImV4cCI6MjA5ODEwMzIzNH0.5NtTKhSjvSjpMvZV4S7adHPbnN5taTiizhozDWC4gOw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: true,
  },
});


