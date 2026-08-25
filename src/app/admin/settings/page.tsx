import { requireAdmin } from "@/lib/admin-guard";
import { getSettings } from "@/lib/settings";
import { AdminShell, Card } from "@/components/admin/AdminShell";
import { saveSettings } from "../actions";

export const dynamic = "force-dynamic";

const FIELDS: { key: keyof Awaited<ReturnType<typeof getSettings>>; label: string; hint: string; ltr?: boolean }[] = [
  {
    key: "whatsappNumber",
    label: "رقم الواتساب للطلبات",
    hint: "بصيغة دولية بدون + أو مسافات، مثال 218910000000",
    ltr: true,
  },
  { key: "announcement", label: "الشريط العلوي", hint: "جملة واحدة — بلا تخفيضات ولا عدّاد" },
  { key: "instagram", label: "حساب إنستغرام", hint: "بدون @", ltr: true },
  { key: "facebook", label: "رابط صفحة فيسبوك", hint: "", ltr: true },
  { key: "city", label: "المدينة", hint: "تظهر في التذييل" },
];

export default async function SettingsPage() {
  await requireAdmin();
  const s = await getSettings();

  return (
    <AdminShell title="الإعدادات">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="بيانات المتجر">
          <form action={saveSettings} className="space-y-6">
            {FIELDS.map((f) => (
              <label key={f.key} className="block">
                <span className="micro">{f.label}</span>
                <input
                  name={f.key}
                  defaultValue={s[f.key]}
                  dir={f.ltr ? "ltr" : undefined}
                  className="field mt-1"
                />
                {f.hint && <span className="micro">{f.hint}</span>}
              </label>
            ))}
            <button className="btn-solid">حفظ</button>
          </form>
        </Card>

        <Card title="ملاحظات">
          <div className="space-y-4 text-ink2" style={{ fontSize: "var(--t-body-s)", lineHeight: 1.85 }}>
            <p>
              رقم الواتساب هنا هو الوجهة التي تُفتح لها كل الطلبات. تغييره يسري فوراً على
              كل الصفحات دون إعادة نشر.
            </p>
            <p>
              كلمة مرور اللوحة تُضبط من متغيّر البيئة <span className="ltr">ADMIN_PASSWORD</span>،
              ومفتاح توقيع الجلسة من <span className="ltr">AUTH_SECRET</span>. غيّريهما قبل
              النشر على الإنترنت.
            </p>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
