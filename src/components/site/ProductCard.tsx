"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { ProductCardData } from "@/lib/catalog-shared";

/**
 * At rest the card is a photograph, a name and a price. Everything else —
 * the second shot, the pagination hairlines — appears on hover only, and the
 * whole hover vocabulary is opacity. No quick-add: an abaya has a length and
 * a size, so the decision belongs on the product page.
 */
export function ProductCard({
  product,
  priority = false,
  sizes = "(min-width:1280px) 33vw, (min-width:768px) 45vw, 90vw",
}: {
  product: ProductCardData;
  priority?: boolean;
  sizes?: string;
}) {
  const [hover, setHover] = useState(false);
  const images = product.images;
  const first = images[0];
  const second = images[1];

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="crop-57 relative">
        {first ? (
          <>
            <Image
              src={first.url}
              alt={first.alt || product.nameAr}
              fill
              sizes={sizes}
              priority={priority}
              className="object-cover transition-opacity duration-300"
              style={{ opacity: hover && second ? 0 : 1 }}
            />
            {second && (
              <Image
                src={second.url}
                alt=""
                fill
                sizes={sizes}
                className="object-cover transition-opacity duration-300"
                style={{ opacity: hover ? 1 : 0 }}
              />
            )}
          </>
        ) : (
          <Placeholder label={product.nameAr} />
        )}

        {product.isNew && (
          <span
            className="micro absolute bg-ivory/90 px-2 py-[2px] text-ink"
            style={{ insetInlineStart: 12, insetBlockStart: 12 }}
          >
            جديد
          </span>
        )}

        {/* hairline pagination — hover only */}
        {images.length > 1 && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-2 transition-opacity duration-300"
            style={{ opacity: hover ? 1 : 0 }}
          >
            {images.slice(0, 5).map((im, i) => (
              <span
                key={im.id}
                className="h-px w-5"
                style={{ background: i === 1 ? "#1A1815" : "#8C8378" }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-2">
        <h3
          className="font-normal text-charcoal"
          style={{ fontFamily: "var(--font-heading)", fontSize: "var(--t-h4)", lineHeight: 1.7 }}
        >
          {product.nameAr}
          {product.colorAr ? <span className="text-muted"> — {product.colorAr}</span> : null}
        </h3>
        <p className="label num mt-[2px] text-muted">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

export function Placeholder({ label }: { label?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-linen">
      <span
        className="text-muted2"
        style={{ fontFamily: "var(--font-heading)", fontSize: "var(--t-body-s)" }}
      >
        {label ?? "ليريشيا"}
      </span>
    </div>
  );
}
