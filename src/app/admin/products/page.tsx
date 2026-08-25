import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductRowEditor } from "@/components/admin/ProductRowEditor";
import { CATEGORY_LABEL } from "@/lib/catalog-shared";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  await requireAdmin();

  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { position: "asc" }],
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  return (
    <AdminShell
      title="القطع"
      right={<span className="micro">{products.length} قطعة · التعديل يُحفظ تلقائياً</span>}
    >
      <div className="space-y-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center gap-5"
            style={{ border: "0.5px solid var(--color-line)", padding: 12 }}
          >
            <div
              className="relative shrink-0"
              style={{ inlineSize: 54, aspectRatio: "5 / 7", background: "var(--color-linen)" }}
            >
              {p.images[0] && (
                <Image src={p.images[0].url} alt="" fill sizes="54px" className="object-cover" />
              )}
            </div>

            <div style={{ minInlineSize: 220, flex: 1 }}>
              <Link href={`/product/${p.slug}`} className="hov" style={{ fontSize: "var(--t-body-s)" }}>
                {p.nameAr} <span className="text-muted">— {p.colorAr}</span>
              </Link>
              <p className="micro">
                {CATEGORY_LABEL[p.category] ?? p.category} · {p.fabric} · {p.embroidery}
              </p>
            </div>

            <ProductRowEditor
              id={p.id}
              price={p.price}
              isActive={p.isActive}
              isFeatured={p.isFeatured}
            />
          </div>
        ))}
      </div>

      <p className="micro mt-8" style={{ maxInlineSize: "70ch", lineHeight: 1.85 }}>
        إضافة قطعة جديدة أو تغيير الصور يتم حالياً من ملف البيانات (prisma/seed.mjs) أو
        مباشرة عبر Prisma Studio بالأمر <span className="ltr">npm run db:studio</span>.
        محرّر كامل للقطع داخل اللوحة هو الخطوة التالية المقترحة.
      </p>
    </AdminShell>
  );
}
