import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client.
 * Use this in Server Components, Server Actions, and Route Handlers.
 *
 * Uses the modern getAll/setAll pattern (v0.12+) which correctly handles
 * cache-control headers alongside cookie writes.
 *
 * IMPORTANT: Always call this function fresh — never share an instance
 * across requests.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll from a Server Component is ignored — middleware
            // handles the actual token refresh write.
          }
        },
      },
    },
  );
}
