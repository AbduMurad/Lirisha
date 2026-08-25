export const ORDER_STATUSES = [
  "pending",
  "opened",
  "confirmed",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<string, string> = {
  pending: "بانتظار الإرسال",
  opened: "فُتح على واتساب",
  confirmed: "مؤكَّد",
  paid: "مدفوع",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغى",
};

/** Statuses that count as real revenue in the dashboard. */
export const REVENUE_STATUSES = new Set(["confirmed", "paid", "shipped", "delivered"]);
