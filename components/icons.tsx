// Hand-rolled inline SVG icons. No icon library — spec section 2 keeps
// dependencies to what's named, and this is five glyphs at 1.5px stroke,
// square-capped to match the sharp-corner, no-shadow aesthetic (section 3).

type IconProps = {
  className?: string;
};

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "square" as const,
  strokeLinejoin: "miter" as const,
  viewBox: "0 0 24 24",
};

export function CartIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 7h16l-1.5 11.5a1 1 0 0 1-1 .5H6.5a1 1 0 0 1-1-.5L4 7Z" />
      <path d="M8 7V6a4 4 0 0 1 8 0v1" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.2-3.6 4.2-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" />
      <circle cx="12" cy="12" r="4.2" />
      <path d="M17 6.2h.01" strokeWidth="2" />
    </svg>
  );
}
