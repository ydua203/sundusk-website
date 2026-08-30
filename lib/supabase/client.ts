import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components (login/register forms, sign-out
 * button). Cookie handling is automatic — don't hand-roll it here.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
