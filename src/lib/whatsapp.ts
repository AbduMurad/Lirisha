import { formatPricePlain } from "./format";
import type { CartLine, CustomerDetails } from "./types";

/**
 * Builds the Arabic order message. Every order carries a short reference
 * (LR-XXXX) that also exists as a row in the database, which is what lets the
 * dashboard tie a WhatsApp conversation back to the traffic source that
 * produced it.
 */
export function buildOrderMessage(opts: {
  ref: string;
  lines: CartLine[];
  customer: CustomerDetails;
  subtotal: number;
  hasQuoteItems: boolean;
}): string {
  const { ref, lines, customer, subtotal, hasQuoteItems } = opts;

  const items = lines
    .map((l, i) => {
      const bits = [
        `${i + 1}. ${l.nameAr}${l.colorAr ? ` — ${l.colorAr}` : ""}`,
        `   المقاس: ${l.size || "—"}  •  الطول: ${l.length || "—"}  •  الكمية: ${l.qty}`,
        `   ${l.price === null ? "السعر عند الطلب" : formatPricePlain(l.price * l.qty)}`,
      ];
      return bits.join("\n");
    })
    .join("\n\n");

  const total =
    subtotal > 0
      ? `الإجمالي: ${formatPricePlain(subtotal)}${
          hasQuoteItems ? "  (+ قطع بسعر عند الطلب)" : ""
        }`
      : "الإجمالي: عند الطلب";

  return [
    "السلام عليكم 🤍",
    `حابة أطلب من ليريشيا — رقم الطلب ${ref}`,
    "",
    items,
    "",
    total,
    "",
    "بياناتي:",
    `الاسم: ${customer.name}`,
    `المدينة: ${customer.city}`,
    `الهاتف: ${customer.phone}`,
    customer.note ? `ملاحظات: ${customer.note}` : "",
    "",
    "بانتظار التأكيد وتفاصيل التوصيل، شكراً لكم.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildEnquiryMessage(productName: string, slug: string, site: string) {
  return [
    "السلام عليكم 🤍",
    `مهتمة بـ ${productName}`,
    `${site}/product/${slug}`,
    "",
    "ممكن التفاصيل والمقاسات المتوفرة؟",
  ].join("\n");
}

export function whatsappUrl(number: string, message: string): string {
  const clean = number.replace(/[^\d]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
