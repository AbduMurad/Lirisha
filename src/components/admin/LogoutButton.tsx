"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="label hov text-muted"
      onClick={async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      خروج
    </button>
  );
}
