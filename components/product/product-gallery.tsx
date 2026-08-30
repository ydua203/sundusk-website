"use client";

import { useState } from "react";
import { ProductImage } from "./product-image";

/** Main frame + thumbnail strip, real photography. */
export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const count = images.length;

  return (
    <div>
      <ProductImage
        src={images[active]}
        alt={`${name} — photo ${active + 1} of ${count}`}
        priority={active === 0}
        sizes="(min-width: 1024px) 50vw, 100vw"
      />

      {count > 1 && (
        <div
          className="mt-3 grid grid-cols-6 gap-2"
          role="group"
          aria-label={`${name} photos`}
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-current={i === active}
              aria-label={`Photo ${i + 1} of ${count}`}
              onClick={() => setActive(i)}
              className={`border transition-colors ${
                i === active
                  ? "border-terra"
                  : "border-line hover:border-espresso"
              }`}
            >
              <ProductImage src={src} alt="" sizes="12vw" bordered={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
