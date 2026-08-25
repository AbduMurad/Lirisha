"use client";

import { useState, useTransition } from "react";
import { updateProduct } from "@/app/admin/actions";

type Patch = Partial<{
  price: number | null;
  isActive: boolean;
  isFeatured: boolean;
  nameAr: string;
  fabric: string;
}>;

export function ProductRowEditor({
  id,
  price,
  isActive,
  isFeatured,
  nameAr,
  fabric,
}: {
  id: string;
  price: number | null;
  isActive: boolean;
  isFeatured: boolean;
  nameAr: string;
  fabric: string;
}) {
  const [value, setValue] = useState(price === null ? "" : String(price));
  const [name, setName] = useState(nameAr);
  const [cloth, setCloth] = useState(fabric);
  const [active, setActive] = useState(isActive);
  const [featured, setFeatured] = useState(isFeatured);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  function save(next: Patch) {
    start(async () => {
      await updateProduct(id, next);
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-4" style={{ opacity: pending ? 0.5 : 1 }}>
      <input
        aria-label="اسم القطعة"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => name.trim() && name !== nameAr && save({ nameAr: name })}
        style={{
          inlineSize: 220,
          border: "0.5px solid var(--color-line-strong)",
          background: "transparent",
          padding: "6px 8px",
          fontSize: "var(--t-body-s)",
        }}
      />

      <input
        aria-label="القماش"
        value={cloth}
        placeholder="القماش"
        onChange={(e) => setCloth(e.target.value)}
        onBlur={() => cloth !== fabric && save({ fabric: cloth })}
        style={{
          inlineSize: 110,
          border: "0.5px solid var(--color-line-strong)",
          background: "transparent",
          padding: "6px 8px",
          fontSize: "var(--t-body-s)",
        }}
      />

      <label className="flex items-center gap-2">
        <input
          className="ltr num"
          dir="ltr"
          inputMode="numeric"
          value={value}
          placeholder="عند الطلب"
          onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))}
          onBlur={() => save({ price: value === "" ? null : Number(value) })}
          style={{
            inlineSize: 96,
            border: "0.5px solid var(--color-line-strong)",
            background: "transparent",
            padding: "6px 8px",
            fontSize: "var(--t-body-s)",
            textAlign: "start",
          }}
        />
        <span className="micro">د.ل</span>
      </label>

      <label className="label flex items-center gap-2">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => {
            setActive(e.target.checked);
            save({ isActive: e.target.checked });
          }}
        />
        منشورة
      </label>

      <label className="label flex items-center gap-2">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => {
            setFeatured(e.target.checked);
            save({ isFeatured: e.target.checked });
          }}
        />
        مميّزة
      </label>

      {saved && <span className="micro" style={{ color: "var(--color-success)" }}>تم الحفظ</span>}
    </div>
  );
}
