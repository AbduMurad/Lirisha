"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";

/**
 * Phone navigation, pinned to the bottom where a thumb reaches.
 *
 * It replaces the header's hamburger rather than sitting alongside it — two
 * navigation systems on one small screen means every destination has two
 * addresses and the customer has to learn which one holds what.
 *
 * Four destinations, because a fifth starts shrinking the targets below the
 * ~44px a thumb needs. The secondary pages (sizing, care, shipping) stay in
 * the footer, which is where people look for them.
 */
const ITEMS = [
  { href: "/", label: "الرئيسية" },
  { href: "/shop", label: "المجموعة" },
  { href: "/atelier", label: "الأتيليه" },
] as const;

export function BottomNav() {
  const { count, open } = useCart();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      aria-label="التنقل"
      style={{
        background: "var(--elev-bg)",
        backdropFilter: "var(--elev-blur)",
        WebkitBackdropFilter: "var(--elev-blur)",
        borderBlockStart: "var(--border-w) solid var(--color-line)",
        // Keeps the row clear of the iOS home indicator instead of hiding
        // under it.
        paddingBlockEnd: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="label grid place-items-center"
              style={{
                minBlockSize: 56,
                color: active ? "var(--color-ink)" : "var(--color-muted)",
                // The active mark is a hairline above the label, matching the
                // rest of the site's vocabulary. No pills, no filled tabs.
                boxShadow: active ? "inset 0 2px 0 0 var(--color-ink)" : "none",
              }}
            >
              {item.label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={open}
          className="label grid place-items-center"
          style={{ minBlockSize: 56, color: "var(--color-ink)" }}
          aria-label={count > 0 ? `الحقيبة، ${count} قطعة` : "الحقيبة"}
        >
          الحقيبة{count > 0 ? ` (${count})` : ""}
        </button>
      </div>
    </nav>
  );
}
