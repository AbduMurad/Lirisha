"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { CATEGORY_LABEL } from "@/lib/catalog-shared";

const NAV = [
  { href: "/shop?category=abaya", label: CATEGORY_LABEL.abaya },
  { href: "/shop?category=bisht", label: CATEGORY_LABEL.bisht },
  { href: "/shop?category=jalabiya", label: CATEGORY_LABEL.jalabiya },
  { href: "/shop", label: "كل القطع" },
  { href: "/atelier", label: "الأتيليه" },
];

export function Header({ announcement }: { announcement: string }) {
  const { count, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      setHidden(y > 240 && y > last);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div
        className="label w-full text-center bg-sand text-charcoal"
        style={{ paddingBlock: 10 }}
      >
        {announcement}
      </div>

      <header
        className={scrolled ? "elev hair" : ""}
        style={{
          position: "sticky",
          insetBlockStart: 0,
          zIndex: 50,
          transform: hidden ? "translateY(-120%)" : "none",
          transition: "transform var(--dur) var(--ease), background var(--dur) var(--ease)",
          background: scrolled ? undefined : "var(--color-ivory)",
        }}
        onMouseEnter={() => setHidden(false)}
      >
        <div
          className="container-l flex items-center justify-between gap-6"
          style={{ blockSize: "var(--header-h)" }}
        >
          <Link href="/" className="hov shrink-0" aria-label="ليريشيا">
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--t-h4)",
                fontWeight: 500,
                letterSpacing: 0,
                color: "var(--color-ink)",
              }}
            >
              ليريشيا
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="label hov"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={open}
              className="label hov"
              aria-label="الحقيبة"
            >
              الحقيبة{count > 0 ? ` (${count})` : ""}
            </button>
            <button
              onClick={() => setMenu((v) => !v)}
              className="label hov md:hidden"
              aria-expanded={menu}
            >
              {menu ? "إغلاق" : "القائمة"}
            </button>
          </div>
        </div>

        {menu && (
          <nav className="elev hair-t md:hidden">
            <div className="container-l flex flex-col" style={{ paddingBlock: 8 }}>
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="hair label"
                  style={{ paddingBlock: 14 }}
                  onClick={() => setMenu(false)}
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
