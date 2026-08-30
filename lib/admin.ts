// Not server-only — a plain pure function, safe to share if ever needed
// client-side too. process.env.ADMIN_EMAILS is never inlined into the
// client bundle anyway (only NEXT_PUBLIC_-prefixed vars are), so this
// naturally can't leak the admin list to the browser.
export function isAdminEmail(email: string | null | undefined): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return !!email && adminEmails.includes(email.toLowerCase());
}
