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
  const rows = await prisma.setting.findMany();
  const out = { ...DEFAULTS } as Record<SettingKey, string>;
  for (const r of rows) {
    if (r.key in out) out[r.key as SettingKey] = r.value;
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
