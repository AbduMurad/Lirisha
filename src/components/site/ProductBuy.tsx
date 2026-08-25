"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";
import { track } from "@/lib/track";

export function ProductBuy({
  product,
  sizes,
  lengths,
  whatsappNumber,
  siteUrl,
}: {
  product: {
    id: string;
    slug: string;
    nameAr: string;
    colorAr: string;
    price: number | null;
    image: string;
  };
  sizes: string[];
  lengths: string[];
  whatsappNumber: string;
  siteUrl: string;
}) {
  const { add } = useCart();
  const [size, setSize] = useState(sizes[1] ?? sizes[0] ?? "");
  const [length, setLength] = useState(lengths[1] ?? lengths[0] ?? "");
  const [custom, setCustom] = useState(false);

  const ready = Boolean(size) && Boolean(length || custom);

  const enquiry = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    [
      "السلام عليكم 🤍",
      `مهتمة بـ ${product.nameAr}${product.colorAr ? ` — ${product.colorAr}` : ""}`,
      `${siteUrl}/product/${product.slug}`,
      "",
      "أرغب بتفصيل حسب مقاسي، ممكن التفاصيل؟",
    ].join("\n"),
  )}`;

  return (
    <div className="space-y-7">
      {/* size */}
      <div>
        <div className="flex items-baseline justify-between">
          <span className="micro">المقاس</span>
          <a href="/size-guide" className="micro cta-line">
            دليل المقاسات
          </a>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className="ltr"
              style={{
                minInlineSize: 52,
                minBlockSize: 44,
                border: "0.5px solid var(--color-line-strong)",
                fontSize: "var(--t-label)",
                fontWeight: 500,
                background: size === s ? "var(--color-ink)" : "transparent",
                color: size === s ? "var(--color-ivory)" : "var(--color-charcoal)",
                transition: "opacity var(--dur-fast) var(--ease)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* length — the field that matters most for an abaya */}
      <div>
        <span className="micro">الطول (بوصة)</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {lengths.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLength(l);
                setCustom(false);
              }}
              className="num ltr"
              style={{
                minInlineSize: 52,
                minBlockSize: 44,
                border: "0.5px solid var(--color-line-strong)",
                fontSize: "var(--t-label)",
                fontWeight: 500,
                background: !custom && length === l ? "var(--color-ink)" : "transparent",
                color: !custom && length === l ? "var(--color-ivory)" : "var(--color-charcoal)",
              }}
            >
              {l}
            </button>
          ))}
          <button
            onClick={() => {
              setCustom(true);
              setLength("تفصيل خاص");
            }}
            style={{
              minBlockSize: 44,
              paddingInline: 14,
              border: "0.5px solid var(--color-line-strong)",
              fontSize: "var(--t-label)",
              fontWeight: 500,
              background: custom ? "var(--color-ink)" : "transparent",
              color: custom ? "var(--color-ivory)" : "var(--color-charcoal)",
            }}
          >
            تفصيل حسب الطلب
          </button>
        </div>
        {custom && (
          <p className="micro mt-2">
            سنأخذ مقاسك بالتفصيل عبر واتساب بعد تأكيد الطلب.
          </p>
        )}
      </div>

      <button
        className="btn-solid"
        disabled={!ready}
        onClick={() =>
          add({
            productId: product.id,
            slug: product.slug,
            nameAr: product.nameAr,
            colorAr: product.colorAr,
            image: product.image,
            price: product.price,
            size,
            length,
            qty: 1,
          })
        }
      >
        أضيفي إلى الحقيبة — {formatPrice(product.price)}
      </button>

      <a
        href={enquiry}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          track("whatsapp_click", {
            productId: product.id,
            meta: { kind: "enquiry", slug: product.slug },
          })
        }
        className="cta-line label block text-center"
      >
        استفسري عبر واتساب
      </a>
    </div>
  );
}
