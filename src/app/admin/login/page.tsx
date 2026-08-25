import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-guard";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="grid place-items-center" style={{ minBlockSize: "100svh" }}>
      <div style={{ inlineSize: "min(360px, 88vw)" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--t-h2)", lineHeight: 1.3 }}>
          ليريشيا
        </p>
        <p className="micro mt-1">لوحة التحكم</p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
