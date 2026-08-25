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

        {/* Hairline pagination. Visible at rest, not hover-only: Baymard's
            testing is explicit that the existence of further images has to be
            communicated, and that "completely subtle approaches" fail. Quiet
            at rest, definite on hover.
            The active mark tracks the image actually showing — it used to be
            hardcoded to index 1, so a card at rest pointed at a frame it
            wasn't displaying. */}
        {images.length > 1 && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-2 transition-opacity duration-300"
            style={{ opacity: hover ? 1 : 0.55 }}
          >
            {images.slice(0, 5).map((im, i) => (
              <span
                key={im.id}
                className="h-px w-5 transition-colors duration-300"
                style={{ background: i === (hover && second ? 1 : 0) ? "#1A1815" : "#B7ADA0" }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Three elements, each visually distinct so the grid can be scanned
          down a column rather than read card by card — the second of Baymard's
          two list-item principles, which 64% of sites get wrong. Same fields on
          every card, in the same order, is the first. */}
      <div className="mt-3">
        <h3
          className="font-normal text-ink"
          style={{ fontFamily: "var(--font-heading)", fontSize: "var(--t-h4)", lineHeight: 1.55 }}
        >
          {product.nameAr}
        </h3>
        <p className="mt-1 flex items-baseline gap-2" style={{ fontSize: "var(--t-body-s)" }}>
          {product.colorAr && <span className="text-muted">{product.colorAr}</span>}
          {product.colorAr && <span className="text-muted2">·</span>}
          <span className="num text-ink2">{formatPrice(product.price)}</span>
        </p>
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
