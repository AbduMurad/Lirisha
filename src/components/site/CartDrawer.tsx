"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";
import { track } from "@/lib/track";

type Step = "bag" | "details" | "done";

export function CartDrawer() {
  const { lines, isOpen, close, subtotal, hasQuoteItems, setQty, remove, clear, count } =
    useCart();
  const [step, setStep] = useState<Step>("bag");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ref, setRef] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", city: "", note: "" });

  const canSubmit =
    form.name.trim().length >= 2 &&
    form.phone.replace(/\D/g, "").length >= 8 &&
    form.city.trim().length >= 2;

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({
            productId: l.productId,
            size: l.size,
            length: l.length,
            qty: l.qty,
          })),
          customer: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            city: form.city.trim(),
            note: form.note.trim() || undefined,
          },
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        ref?: string;
        waUrl?: string;
        error?: string;
      };
      if (!data.ok || !data.waUrl || !data.ref) {
        throw new Error(data.error ?? "failed");
      }

      // Conversion event, then hand off. sendBeacon survives the navigation.
      track("whatsapp_click", { meta: { ref: data.ref, subtotal, items: lines.length } });
      navigator.sendBeacon?.(
        "/api/orders/opened",
        new Blob([JSON.stringify({ ref: data.ref })], { type: "application/json" }),
      );

      setRef(data.ref);
      setStep("done");
      clear();
      window.open(data.waUrl, "_blank", "noopener,noreferrer");
    } catch {
      setError("تعذّر إرسال الطلب. تأكدي من الاتصال وحاولي مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  function onClose() {
    close();
    setTimeout(() => {
      setStep("bag");
      setError(null);
    }, 400);
  }

  return (
    <>
      <div className="scrim" data-open={isOpen} onClick={onClose} aria-hidden />
      <aside
        className="drawer elev"
        data-open={isOpen}
        aria-hidden={!isOpen}
        aria-label="حقيبة التسوق"
      >
        <div
          className="hair flex items-center justify-between"
          style={{ padding: "18px var(--drawer-pad)" }}
        >
          <h2 style={{ fontSize: "var(--t-h4)", fontWeight: 500 }}>
            {step === "bag" && `الحقيبة${count ? ` (${count})` : ""}`}
            {step === "details" && "بيانات التوصيل"}
            {step === "done" && "تم إنشاء الطلب"}
          </h2>
          <button onClick={onClose} className="label hov" aria-label="إغلاق">
            إغلاق
          </button>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: "var(--drawer-pad)" }}>
          {step === "bag" && (
            <>
              {!lines.length && (
                <p className="text-muted" style={{ fontSize: "var(--t-body-s)" }}>
                  حقيبتك فارغة. تصفّحي المجموعة واختاري ما يناسبك.
                </p>
              )}
              <ul className="space-y-6">
                {lines.map((l) => (
                  <li key={l.key} className="flex gap-4">
                    <Link
                      href={`/product/${l.slug}`}
                      onClick={onClose}
                      className="relative block w-[76px] shrink-0"
                      style={{ aspectRatio: "5 / 7", background: "var(--color-linen)" }}
                    >
                      {l.image && (
                        <Image src={l.image} alt={l.nameAr} fill sizes="76px" className="object-cover" />
                      )}
                    </Link>
                    <div className="flex-1">
                      <p style={{ fontSize: "var(--t-body-s)" }}>
                        {l.nameAr}
                        {l.colorAr && <span className="text-muted"> — {l.colorAr}</span>}
                      </p>
                      <p className="micro mt-1">
                        المقاس {l.size || "—"} · الطول <span className="ltr num">{l.length || "—"}</span>
                      </p>
                      <p className="label num mt-1 text-muted">{formatPrice(l.price)}</p>

                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-3" style={{ border: "0.5px solid var(--color-line)" }}>
                          <button
                            className="hov px-3 py-1"
                            onClick={() => setQty(l.key, l.qty - 1)}
                            aria-label="إنقاص"
                          >
                            −
                          </button>
                          <span className="num label">{l.qty}</span>
                          <button
                            className="hov px-3 py-1"
                            onClick={() => setQty(l.key, l.qty + 1)}
                            aria-label="زيادة"
                          >
                            +
                          </button>
                        </div>
                        <button className="micro hov" onClick={() => remove(l.key)}>
                          إزالة
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === "details" && (
            <div className="space-y-6">
              <Field
                label="الاسم"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                placeholder="الاسم الكامل"
              />
              <Field
                label="رقم الواتساب"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
                placeholder="0910000000"
                dir="ltr"
                inputMode="tel"
              />
              <Field
                label="المدينة"
                value={form.city}
                onChange={(v) => setForm({ ...form, city: v })}
                placeholder="طرابلس"
              />
              <Field
                label="ملاحظات (اختياري)"
                value={form.note}
                onChange={(v) => setForm({ ...form, note: v })}
                placeholder="مقاس خاص، لون مفضّل، موعد مناسبة…"
              />
              <p className="micro">
                لن يتم الدفع الآن. سيصلك رقم الطلب على واتساب لتأكيد التفاصيل والتوصيل.
              </p>
              {error && (
                <p style={{ color: "var(--color-error)", fontSize: "var(--t-body-s)" }}>{error}</p>
              )}
            </div>
          )}

          {step === "done" && (
            <div className="space-y-4">
              <p style={{ fontSize: "var(--t-body-s)", lineHeight: 1.85 }}>
                تم إنشاء طلبك برقم <span className="ltr num" style={{ fontWeight: 500 }}>{ref}</span>.
                فتحنا لك محادثة واتساب بكل التفاصيل — أرسلي الرسالة وسنؤكد لك خلال وقت قصير.
              </p>
              <p className="micro">
                إذا لم تفتح المحادثة تلقائياً، تأكدي من السماح بالنوافذ المنبثقة ثم أعيدي المحاولة.
              </p>
              <Link href="/shop" onClick={onClose} className="cta-line label inline-block">
                متابعة التصفح
              </Link>
            </div>
          )}
        </div>

        {step !== "done" && lines.length > 0 && (
          <div className="hair-t" style={{ padding: "var(--drawer-pad)" }}>
            <div className="mb-4 flex items-center justify-between">
              <span className="label">الإجمالي</span>
              <span className="label num">{subtotal > 0 ? formatPrice(subtotal) : "عند الطلب"}</span>
            </div>
            {hasQuoteItems && (
              <p className="micro mb-3">تحتوي حقيبتك على قطع بسعر يُحدَّد عند الطلب.</p>
            )}
            {step === "bag" ? (
              <button
                className="btn-solid"
                onClick={() => {
                  track("checkout_start", { meta: { items: lines.length, subtotal } });
                  setStep("details");
                }}
              >
                متابعة الطلب
              </button>
            ) : (
              <>
                <button className="btn-solid" disabled={!canSubmit || busy} onClick={submit}>
                  {busy ? "جارٍ الإرسال…" : "إتمام الطلب عبر واتساب"}
                </button>
                <button
                  className="micro hov mt-3 w-full text-center"
                  onClick={() => setStep("bag")}
                >
                  رجوع إلى الحقيبة
                </button>
              </>
            )}
            <p className="micro mt-3 text-center">التوصيل داخل ليبيا · الدفع عند الاستلام</p>
          </div>
        )}
      </aside>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  dir,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  inputMode?: "text" | "tel";
}) {
  return (
    <label className="block">
      <span className="micro">{label}</span>
      <input
        className="field mt-1"
        value={value}
        dir={dir}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
