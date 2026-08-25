import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

const NAV = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/orders", label: "الطلبات" },
  { href: "/admin/products", label: "القطع" },
  { href: "/admin/settings", label: "الإعدادات" },
];

export function AdminShell({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <>
      <header className="hair" style={{ background: "var(--color-sand)" }}>
        <div
          className="container-l flex flex-wrap items-center justify-between gap-4"
          style={{ paddingBlock: 14 }}
        >
          <div className="flex items-center gap-6">
            <Link href="/" className="hov" style={{ fontFamily: "var(--font-display)", fontSize: "var(--t-h4)" }}>
              ليريشيا
            </Link>
            <nav className="flex flex-wrap items-center gap-5">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="label hov">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="container-l" style={{ paddingBlock: 32 }}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h1 style={{ fontSize: "var(--t-h2)", lineHeight: 1.4 }}>{title}</h1>
          {right}
        </div>
        {children}
      </div>
    </>
  );
}

export function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        border: "0.5px solid var(--color-line)",
        background: "var(--color-ivory)",
        padding: 20,
      }}
    >
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h2 style={{ fontSize: "var(--t-h4)", lineHeight: 1.5 }}>{title}</h2>
        {hint && <span className="micro">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div style={{ border: "0.5px solid var(--color-line)", padding: "16px 18px" }}>
      <p className="micro">{label}</p>
      <p
        className="num"
        style={{ fontFamily: "var(--font-display)", fontSize: "var(--t-h2)", lineHeight: 1.3, color: "var(--color-ink)" }}
      >
        {value}
      </p>
      {sub && <p className="micro">{sub}</p>}
    </div>
  );
}
