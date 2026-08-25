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

            <div style={{ minInlineSize: 150 }}>
              <Link href={`/product/${p.slug}`} className="hov" style={{ fontSize: "var(--t-body-s)" }}>
                {p.colorAr}
              </Link>
              <p className="micro">
                {CATEGORY_LABEL[p.category] ?? p.category} · {p.embroidery}
              </p>
            </div>

            <ProductRowEditor
              id={p.id}
              price={p.price}
              isActive={p.isActive}
              isFeatured={p.isFeatured}
              nameAr={p.nameAr}
              fabric={p.fabric}
            />
          </div>
        ))}
      </div>

      <p className="micro mt-8" style={{ maxInlineSize: "70ch", lineHeight: 1.85 }}>
        الاسم والقماش والسعر تُعدَّل هنا مباشرة. القطعة بلا سعر تظهر للزبونة
        «السعر عند الطلب». إضافة قطعة جديدة أو تغيير الصور يتم من ملف
        <span className="ltr"> scripts/catalogue.mjs </span> ثم
        <span className="ltr"> npm run assets:import </span> و
        <span className="ltr"> npm run db:seed</span>.
      </p>
    </AdminShell>
  );
}
