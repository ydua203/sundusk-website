// Shared nav data — single source of truth for the header, mobile menu, and
// footer, so the three never drift out of sync with each other or with the
// route list in spec section 9.

export type NavLink = {
  href: string;
  label: string;
};

// Primary storefront nav (header + mobile menu).
export const PRIMARY_NAV: NavLink[] = [
  { href: "/shop", label: "Shop" },
  { href: "/collections/tops", label: "Tops" },
  { href: "/collections/dresses", label: "Dresses" },
  { href: "/about", label: "About" },
];

// Policy + support links (footer).
export const FOOTER_NAV: NavLink[] = [
  { href: "/size-guide", label: "Size Guide" },
  { href: "/custom-fit", label: "Custom Fit" },
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns & Exchanges" },
  { href: "/faq", label: "FAQ" },
  { href: "/track-order", label: "Track Order" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];
