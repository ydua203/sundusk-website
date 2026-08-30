import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/admin";

// Content-Security-Policy, generated fresh per request — Next's documented
// pattern for the App Router (nextjs.org/docs/app/guides/content-security-
// policy). A random nonce lets Next's own inline hydration scripts (and
// next/script tags like checkout/page.tsx's Razorpay loader) run, while
// 'strict-dynamic' lets checkout.js load whatever it needs internally for
// the payment widget without requiring a maintained allowlist of every
// Razorpay subdomain. The explicit https://checkout.razorpay.com host is
// kept alongside as a fallback for the small number of browsers that don't
// support strict-dynamic (which then fall back to the host list, per the
// CSP spec's own graceful-degradation design).
//
// connect-src includes the Supabase project URL because auth calls
// (sign in/up) go straight from the browser to Supabase, not through a
// Next.js API route — lib/supabase/client.ts.
function buildCsp(nonce: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://checkout.razorpay.com`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    `connect-src 'self' ${supabaseUrl} https://*.razorpay.com`,
    `frame-src https://*.razorpay.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

// Required by Supabase's SSR pattern: refreshes the auth session cookie on
// every request. Also does the actual route gating for /account/* (must be
// signed in) and /admin/* + /api/admin/* (must be signed in AND in
// ADMIN_EMAILS) — spec section 9: "Admin auth: Supabase Auth session, then
// check the email against the ADMIN_EMAILS env list in middleware." — and,
// as of the security pass below, sets a fresh CSP nonce on every response.
export async function middleware(request: NextRequest) {
  // btoa(), not Buffer.from(...).toString("base64") — Node's Buffer
  // polyfill in the Edge Runtime middleware sandbox hits "EvalError: Code
  // generation from strings disallowed" (confirmed by actually running
  // this against a real `next start` server, not assumed). btoa is a
  // native Web API, available in Edge Runtime with no polyfill involved.
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  // Next reads the nonce for its own injected scripts from this request
  // header — set on the request, not just the eventual response, so it's
  // visible to the page render itself.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
  supabaseResponse.headers.set("Content-Security-Policy", csp);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // Rebuilt with requestHeaders (not the original `request`), and
          // the CSP re-applied — otherwise a request that actually
          // refreshes cookies would silently drop the nonce and ship
          // without a CSP at all.
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
          supabaseResponse.headers.set("Content-Security-Policy", csp);
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser(), not getSession() — this actually revalidates the token
  // against Supabase's auth server rather than trusting whatever's in the
  // (spoofable) cookie. Supabase's own SSR guidance is explicit about this
  // distinction for server-side code.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAccountRoute =
    pathname.startsWith("/account") &&
    pathname !== "/account/login" &&
    pathname !== "/account/register";
  // Both the admin pages (/admin/*) and their API routes (/api/admin/*)
  // are gated the same way — an API consumer just gets a 401 instead of
  // an HTML redirect, since following a redirect to a login page isn't a
  // meaningful response to a fetch() call.
  const isAdminPageRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  if (isAccountRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/account/login";
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  if ((isAdminPageRoute || isAdminApiRoute) && !isAdminEmail(user?.email)) {
    if (isAdminApiRoute) {
      const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      res.headers.set("Content-Security-Policy", csp);
      return res;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/account/login";
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Every route except static assets and image optimisation files —
    // Supabase's recommended broad matcher, so the session cookie never
    // goes stale on any page.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
