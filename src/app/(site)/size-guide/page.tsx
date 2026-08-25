import { Prose } from "@/components/site/Prose";

export const metadata = { title: "دليل المقاسات" };

export default function SizeGuidePage() {
  return (
    <>
      <Prose
        eyebrow="المقاسات"
        title="دليل المقاسات"
        lead="المقاس الصحيح هو نصف الأناقة. اقرئي الجدول قبل الطلب، وإن ترددتِ بين مقاسين اختاري الأكبر — العباية تُحبّ الانسياب."
        sections={[
          {
            heading: "كيف تقيسين",
            body: [
              "الكتف: من طرف الكتف إلى طرف الكتف من الخلف.",
              "الصدر: حول أوسع نقطة، مع إبقاء شريط القياس أفقياً ومرتخياً قليلاً.",
              "الطول: من أعلى الكتف إلى المستوى الذي تريدين أن تنتهي عنده العباية — عادة أعلى الأرض بسنتيمترين مع الكعب.",
            ],
          },
        ]}
      />
      <div className="container-l" style={{ paddingBlockEnd: "var(--section-gap)", maxInlineSize: 760 }}>
        <table className="w-full" style={{ borderCollapse: "collapse", fontSize: "var(--t-body-s)" }}>
          <thead>
            <tr>
              {["المقاس", "الكتف (سم)", "الصدر (سم)", "الطول (بوصة)"].map((h) => (
                <th
                  key={h}
                  className="label"
                  style={{ textAlign: "start", padding: "12px 8px", borderBlockEnd: "0.5px solid var(--color-line-strong)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["S", "38", "96", "54"],
              ["M", "40", "104", "56"],
              ["L", "42", "112", "58"],
              ["XL", "44", "120", "60"],
            ].map((r) => (
              <tr key={r[0]}>
                {r.map((c, i) => (
                  <td
                    key={i}
                    className={i === 0 ? "ltr" : "num ltr"}
                    style={{ padding: "12px 8px", borderBlockEnd: "0.5px solid var(--color-line)" }}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="micro mt-5">الطول القياسي يُقاس على عارضة بطول 165 سم.</p>
      </div>
    </>
  );
}
