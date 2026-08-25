/**
 * Price + number formatting.
 *
 * Libya is Maghreb: Western digits (0-9) are the norm, Arabic-Indic ("٠١٢٣")
 * reads as foreign. `Intl.NumberFormat('ar-LY')` silently gives European
 * separators (1.250 for one thousand two hundred fifty) and three decimals
 * for LYD, and 'ar-EG'/'ar-SA' silently flip to Arabic-Indic. So the locale
 * is pinned to `ar-u-nu-latn` everywhere on the site.
 */

const lyd = new Intl.NumberFormat("ar-u-nu-latn", {
  style: "currency",
  currency: "LYD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const plain = new Intl.NumberFormat("ar-u-nu-latn", {
  maximumFractionDigits: 0,
});

export const PRICE_ON_REQUEST_AR = "السعر عند الطلب";

export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return PRICE_ON_REQUEST_AR;
  return lyd.format(value);
}

/** Bare number + unit, for the WhatsApp message where RTL marks are noise. */
export function formatPricePlain(value: number | null | undefined): string {
  if (value === null || value === undefined) return PRICE_ON_REQUEST_AR;
  return `${plain.format(value)} د.ل`;
}

/** An order whose lines are all "price on request" has no meaningful total. */
export function formatOrderTotal(subtotal: number, hasQuoteItems = false): string {
  if (subtotal > 0) return hasQuoteItems ? `${lyd.format(subtotal)} +` : lyd.format(subtotal);
  return PRICE_ON_REQUEST_AR;
}

export function formatNumber(value: number): string {
  return plain.format(value);
}

export function formatPercent(value: number): string {
  return `${plain.format(Math.round(value * 10) / 10)}%`;
}

const dateFmt = new Intl.DateTimeFormat("ar-u-nu-latn", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const timeFmt = new Intl.DateTimeFormat("ar-u-nu-latn", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export const formatDate = (d: Date | string) => dateFmt.format(new Date(d));
export const formatDateTime = (d: Date | string) => timeFmt.format(new Date(d));
