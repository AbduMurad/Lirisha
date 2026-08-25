"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { CartLine } from "@/lib/types";
import {
  addLine,
  clearLines,
  getServerSnapshot,
  getSnapshot,
  removeLine,
  setLineQty,
  subscribe,
} from "@/lib/cart-store";
import { track } from "@/lib/track";

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  hasQuoteItems: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (line: Omit<CartLine, "key">) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  // Locking the body is a write to an external system, which is what effects
  // are for — unlike hydrating state, which the store above handles.
  useEffect(() => {
    document.body.classList.toggle("no-scroll", isOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [isOpen]);

  const add: CartCtx["add"] = useCallback((line) => {
    addLine(line);
    track("add_to_cart", {
      productId: line.productId,
      meta: { size: line.size, length: line.length, qty: line.qty, price: line.price },
    });
    setIsOpen(true);
  }, []);

  const remove: CartCtx["remove"] = useCallback((key) => {
    const gone = removeLine(key);
    if (gone) track("remove_from_cart", { productId: gone.productId });
  }, []);

  const value = useMemo<CartCtx>(() => {
    const subtotal = lines.reduce((s, l) => s + (l.price ?? 0) * l.qty, 0);
    return {
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal,
      hasQuoteItems: lines.some((l) => l.price === null),
      isOpen,
      open: () => {
        setIsOpen(true);
        track("cart_open");
      },
      close: () => setIsOpen(false),
      add,
      remove,
      setQty: setLineQty,
      clear: clearLines,
    };
  }, [lines, isOpen, add, remove]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
