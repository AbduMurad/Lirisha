"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { track } from "@/lib/track";

export function PageView({ productId }: { productId?: string }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const last = useRef<string>("");

  useEffect(() => {
    const key = `${pathname}?${params.toString()}`;
    if (last.current === key) return;
    last.current = key;
    track("page_view", { path: pathname });
    if (productId) track("product_view", { path: pathname, productId });
  }, [pathname, params, productId]);

  return null;
}
