import { prisma } from "./prisma";

export const DEFAULTS = {
  whatsappNumber: process.env.WHATSAPP_NUMBER ?? "218910000000",
  instagram: "lirisha.ly",
  facebook: "https://www.facebook.com/profile.php?id=61576848306449",
  announcement: "توصيل داخل ليبيا • تفصيل خاص حسب الطلب",
  city: "طرابلس، ليبيا",
} as const;

export type SettingKey = keyof typeof DEFAULTS;

export async function getSettings(): Promise<Record<SettingKey, string>> {
  const out = { ...DEFAULTS } as Record<SettingKey, string>;
  try {
    const rows = await prisma.setting.findMany();
    for (const r of rows) {
      if (r.key in out) out[r.key as SettingKey] = r.value;
    }
  } catch {
    // The header and footer are not worth a 500. If the database is briefly
    // unreachable the storefront still renders with the compiled-in defaults.
  }
  return out;
}

export async function getSetting(key: SettingKey): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? DEFAULTS[key];
}

export async function setSetting(key: SettingKey, value: string) {
  return prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
