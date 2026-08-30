import Image from "next/image";

/**
 * Real product photography, via next/image (spec section 13). Uses `fill`
 * inside an aspect-[4/5] container rather than fixed pixel width/height —
 * these render at different sizes across the grid, gallery, and cart line
 * item, so a fixed intrinsic size would be wrong in at least two of the
 * three places. The aspect-ratio'd container is what actually prevents
 * layout shift here, which is the rule's real purpose.
 */
export function ProductImage({
  src,
  alt,
  priority = false,
  sizes,
  bordered = true,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  /** Set false when the parent already draws its own border (e.g. a
   * gallery thumbnail button with an active-state border) — otherwise the
   * two borders sit flush against each other and read as one thick line. */
  bordered?: boolean;
}) {
  return (
    <div
      className={`relative aspect-4/5 w-full overflow-hidden bg-cream ${bordered ? "border border-line" : ""}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(min-width: 1024px) 25vw, 50vw"}
        className="object-cover"
        priority={priority}
      />
    </div>
  );
}
