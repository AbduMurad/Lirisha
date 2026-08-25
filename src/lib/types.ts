export type CartLine = {
  /** productId + size + length + colour is the line identity */
  key: string;
  productId: string;
  slug: string;
  nameAr: string;
  colorAr: string;
  image: string;
  price: number | null;
  size: string;
  length: string;
  qty: number;
};

export type CustomerDetails = {
  name: string;
  phone: string;
  city: string;
  note?: string;
};

export type TrackEvent =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "remove_from_cart"
  | "cart_open"
  | "checkout_start"
  | "whatsapp_click"
  | "order_created"
  | "filter_apply";

export const lineKey = (
  productId: string,
  size: string,
  length: string,
): string => `${productId}::${size}::${length}`;
