// Single source of truth for size ordering and the size-guide table (spec
// section 10 — use this data exactly, XS to XL only, never claim beyond it).

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

export const SIZE_GUIDE: {
  size: Size;
  indiaSize: number;
  bustIn: number;
  waistIn: number;
  hipsIn: number;
}[] = [
  { size: "XS", indiaSize: 34, bustIn: 34, waistIn: 26, hipsIn: 36 },
  { size: "S", indiaSize: 36, bustIn: 36, waistIn: 28, hipsIn: 38 },
  { size: "M", indiaSize: 38, bustIn: 38, waistIn: 30, hipsIn: 40 },
  { size: "L", indiaSize: 40, bustIn: 40, waistIn: 32, hipsIn: 42 },
  { size: "XL", indiaSize: 42, bustIn: 42, waistIn: 34, hipsIn: 44 },
];
