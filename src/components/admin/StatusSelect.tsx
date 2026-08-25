"use client";

import { useTransition } from "react";
import { setOrderStatus } from "@/app/admin/actions";
import { ORDER_STATUSES, STATUS_LABEL } from "@/lib/orders";

export function StatusSelect({ id, value }: { id: string; value: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={value}
      disabled={pending}
      onChange={(e) => start(() => void setOrderStatus(id, e.target.value))}
      className="label"
      style={{
        border: "0.5px solid var(--color-line-strong)",
        background: "transparent",
        padding: "6px 8px",
        opacity: pending ? 0.5 : 1,
      }}
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
