// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // ✅ keeps session in localStorage
    autoRefreshToken: true,    // ✅ automatically refreshes tokens
    detectSessionInUrl: true,
    storageKey: "sb-auth",     // ✅ avoids clashes with other projects
  },
});

// Utility: clears broken sessions so user doesn't get stuck
export const resetAuthIfInvalid = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Supabase session error:", error.message);
      await supabase.auth.signOut();
      return null;
    }

    return data.session;
  } catch (err) {
    console.error("Unexpected Supabase error:", err);
    await supabase.auth.signOut();
    return null;
  }
};
