import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for Server Components, Route Handlers, and Server
 * Actions. Create a new one per request — never share/cache across
 * requests (Supabase's own SSR guidance).
 *
 * Uses the anon key, not the service role key — this client is subject to
 * RLS, same as a browser client would be. Server routes that need to
 * bypass RLS (checkout, the webhook, admin actions) use `db` (Drizzle,
 * via the service role connection) instead, same as every other write in
 * this app — see spec section 5.
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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render, where cookies can't
            // be written — expected and harmless as long as middleware.ts
            // is also refreshing the session (it is). See
            // https://supabase.com/docs/guides/auth/server-side/nextjs
          }
        },
      },
    },
  );
}
