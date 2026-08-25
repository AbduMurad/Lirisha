"use client";

import type { CartLine } from "./types";
import { lineKey } from "./types";

/**
 * The cart is a module-level store read through `useSyncExternalStore`, not a
 * `useState` hydrated inside an effect. That keeps SSR and the first client
 * render in agreement (the server snapshot is always empty) and avoids the
 * cascading render an effect-based hydration causes.
 */

const KEY = "lir_cart_v1";
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) lines = parsed as CartLine[];
    }
  } catch {
    /* private mode / corrupt value — start empty */
  }
}

function commit(next: CartLine[]) {
  lines = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota or private mode — the cart just won't persist */
  }
  for (const l of listeners) l();
}

export function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getSnapshot(): CartLine[] {
  load();
  return lines;
}

export function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

export function addLine(line: Omit<CartLine, "key">) {
  const key = lineKey(line.productId, line.size, line.length);
  const i = lines.findIndex((l) => l.key === key);
  if (i >= 0) {
    const next = [...lines];
    next[i] = { ...next[i], qty: Math.min(next[i].qty + line.qty, 20) };
    commit(next);
  } else {
    commit([{ ...line, key }, ...lines]);
  }
}

export function removeLine(key: string): CartLine | undefined {
  const gone = lines.find((l) => l.key === key);
  commit(lines.filter((l) => l.key !== key));
  return gone;
}

export function setLineQty(key: string, qty: number) {
  commit(
    qty <= 0
      ? lines.filter((l) => l.key !== key)
      : lines.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, 20) } : l)),
  );
}

export function clearLines() {
  commit(EMPTY);
}
