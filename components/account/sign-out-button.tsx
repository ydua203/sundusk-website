"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="font-body text-xs font-medium tracking-[0.08em] text-muted uppercase underline underline-offset-4 transition-colors hover:text-terra"
    >
      Sign out
    </button>
  );
}
