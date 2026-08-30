import type { NextConfig } from "next";

// Security headers applied to every response. The Content-Security-Policy
// itself lives in middleware.ts instead — it needs a per-request nonce
// (Next's documented pattern for App Router: nextjs.org/docs/app/guides/
// content-security-policy), which only middleware can generate. Everything
// here is static and has no reason to be per-request.
const securityHeaders = [
  // Browsers should never guess a response's MIME type from its content —
  // stops a crafted upload from being executed as script/HTML.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Belt-and-braces alongside the CSP's frame-ancestors 'none' below —
  // older browsers that don't support frame-ancestors still get
  // clickjacking protection from this.
  { key: "X-Frame-Options", value: "DENY" },
  // Don't leak the full referring URL (which can contain order numbers,
  // tokens in query strings, etc.) to third-party origins — only the
  // origin itself, and only when navigating to another site.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing on this site uses the camera, microphone, or geolocation —
  // deny them outright rather than leaving the default (which lets an
  // embedding page or a compromised script request them).
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Vercel serves everything over HTTPS already; this just stops a
  // downgrade to plain HTTP ever being accepted by a returning browser.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
