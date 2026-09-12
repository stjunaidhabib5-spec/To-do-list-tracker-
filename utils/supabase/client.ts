import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client.
 * Use this inside Client Components ('use client').
 * Reads/writes auth cookies automatically via document.cookie.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
