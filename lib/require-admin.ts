import "server-only";

import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Defense in depth for /admin pages and /api/admin routes — middleware.ts
 * already gates both by pathname, but a route handler shouldn't rely
 * solely on the matcher regex in a different file never being edited
 * wrong. Returns the authenticated admin user, or null.
 */
export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isAdminEmail(user?.email) ? user : null;
}
