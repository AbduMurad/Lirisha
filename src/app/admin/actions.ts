"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-guard";
import { ORDER_STATUSES, REVENUE_STATUSES, type OrderStatus } from "@/lib/orders";
import { setSetting, DEFAULTS, type SettingKey } from "@/lib/settings";

async function guard() {
  if (!(await isAdmin())) throw new Error("unauthorized");
}

export async function setOrderStatus(id: string, status: string) {
  await guard();
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return;
  await prisma.order.update({
    where: { id },
    data: {
      status: status as OrderStatus,
      confirmedAt: REVENUE_STATUSES.has(status) ? new Date() : null,
    },
  });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function updateProduct(
  id: string,
  data: { price?: number | null; isActive?: boolean; isFeatured?: boolean; position?: number },
) {
  await guard();
  await prisma.product.update({ where: { id }, data });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function saveSettings(formData: FormData) {
  await guard();
  for (const key of Object.keys(DEFAULTS) as SettingKey[]) {
    const value = formData.get(key);
    if (typeof value === "string" && value.trim()) {
      await setSetting(key, value.trim());
    }
  }
  revalidatePath("/", "layout");
}
