import { createBrowserClient } from "@supabase/ssr";

export const ADMIN_EMAIL = "cscmdu2015@gmail.com";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // CRITICAL: Bypass standard navigator locks to prevent browser freezes when handling auth changes inside Next.js
    lock: async (name, acquireTimeout, fn) => fn(),
  },
});

/**
 * Checks if a given email is the Administrator email
 */
export const isAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};
