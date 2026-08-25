/**
 * First-touch attribution.
 *
 * A visitor gets a first-party uuid cookie (`lir_vid`, 1 year) on first
 * request. Their acquisition channel is resolved once, from UTM params first
 * and the referrer second, and then never overwritten — so a customer who
 * arrives from a Facebook ad, leaves, and comes back by typing the URL still
 * counts as Facebook when they finally order on WhatsApp.
 */

export type Channel =
  | "facebook"
  | "instagram"
  | "whatsapp"
  | "tiktok"
  | "google"
  | "referral"
  | "direct";

export const CHANNELS: Channel[] = [
  "facebook",
  "instagram",
  "whatsapp",
  "tiktok",
  "google",
  "referral",
  "direct",
];

export const CHANNEL_LABEL_AR: Record<Channel, string> = {
  facebook: "فيسبوك",
  instagram: "إنستغرام",
  whatsapp: "واتساب",
  tiktok: "تيك توك",
  google: "بحث جوجل",
  referral: "مواقع أخرى",
  direct: "زيارة مباشرة",
};

/**
 * Categorical hues for the dashboard, assigned in fixed slot order and never
 * cycled. Validated against the ivory chart surface (#FBF9F5): lightness band,
 * chroma floor, adjacent-pair CVD ΔE 9.1, normal-vision ΔE 19.6 all pass.
 * Three steps sit under 3:1 contrast, so every chart that uses them ships
 * visible direct labels — see AnalyticsCharts.
 */
export const CHANNEL_COLOR: Record<Channel, string> = {
  facebook: "#2a78d6", // slot 1 · blue
  instagram: "#eb6834", // slot 2 · orange
  whatsapp: "#1baf7a", // slot 3 · aqua
  tiktok: "#eda100", // slot 4 · yellow
  google: "#e87ba4", // slot 5 · magenta
  referral: "#008300", // slot 6 · green
  direct: "#4a3aa7", // slot 7 · violet
};

/** Single-hue ordinal ramp for the funnel: monotone L, gaps ≥ 0.06, light end 2.01:1. */
export const FUNNEL_RAMP = ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab", "#104281"];

const HOST_MAP: [RegExp, Channel][] = [
  [/(^|\.)facebook\.com$|(^|\.)fb\.(com|me)$|(^|\.)m\.facebook\.com$/, "facebook"],
  [/(^|\.)instagram\.com$|(^|\.)ig\.me$/, "instagram"],
  [/(^|\.)whatsapp\.com$|(^|\.)wa\.me$/, "whatsapp"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)google\./, "google"],
  [/(^|\.)bing\.com$|(^|\.)duckduckgo\.com$|(^|\.)yahoo\./, "google"],
];

const UTM_MAP: [RegExp, Channel][] = [
  [/^(fb|facebook|meta)$/i, "facebook"],
  [/^(ig|insta|instagram)$/i, "instagram"],
  [/^(wa|whatsapp)$/i, "whatsapp"],
  [/^(tt|tiktok)$/i, "tiktok"],
  [/^(google|adwords|gads)$/i, "google"],
];

export function resolveChannel(
  utmSource: string | null | undefined,
  referrer: string | null | undefined,
  selfHost: string,
): Channel {
  if (utmSource) {
    for (const [re, ch] of UTM_MAP) if (re.test(utmSource.trim())) return ch;
  }
  if (referrer) {
    try {
      const host = new URL(referrer).hostname.toLowerCase();
      if (host === selfHost || host.endsWith(`.${selfHost}`)) return "direct";
      for (const [re, ch] of HOST_MAP) if (re.test(host)) return ch;
      return "referral";
    } catch {
      /* malformed referrer → fall through */
    }
  }
  return "direct";
}

export function resolveDevice(ua: string | null | undefined): "mobile" | "tablet" | "desktop" {
  if (!ua) return "desktop";
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod|IEMobile|Opera Mini/i.test(ua)) return "mobile";
  return "desktop";
}

export const isChannel = (v: string): v is Channel =>
  (CHANNELS as string[]).includes(v);

export const channelLabel = (v: string) =>
  isChannel(v) ? CHANNEL_LABEL_AR[v] : v;

export const channelColor = (v: string) =>
  isChannel(v) ? CHANNEL_COLOR[v] : "#8C8378";
