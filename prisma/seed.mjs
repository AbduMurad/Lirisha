/**
 * Seeds the catalogue. Content is drawn from the brand's own Facebook copy
 * (satin, hand embroidery, the burgundy/pink story, the black collection).
 * Prices are plausible LYD placeholders — edit them in the admin.
 *
 *   node prisma/seed.mjs
 */
import { createRequire } from "node:module";
import { PALETTE } from "../scripts/palette.mjs";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

const byKey = Object.fromEntries(PALETTE.map((p) => [p.key, p]));

const CARE =
  "التنظيف الجاف مفضّل. عند الغسل اليدوي: ماء بارد ومنظّف خفيف بلا مبيّض، دون فرك موضع التطريز. الكي من الداخل على حرارة منخفضة.";

/** name · fabric · silhouette, colour appended — the Totême naming convention. */
const CATALOG = [
  {
    group: "satin-embroidered",
    category: "abaya",
    base: "عباية ساتان مطرزة",
    baseEn: "Embroidered satin abaya",
    fabric: "ساتان",
    occasion: "مناسبات",
    embroidery: "تطريز يدوي",
    price: 1850,
    desc: "انسيابية الساتان مع تطريز يدوي متقن على الأكمام والصدر. قطعة تُلبس في المناسبة وتُتذكَّر بعدها.",
    details:
      "ساتان ثقيل بملمس ناعم وبطانة كريب داخلية. تطريز يدوي بالخرز والكريستال على الكم والصدر. إغلاق أمامي بأزرار مخفية. مصنوعة في طرابلس.",
    colors: ["aaji", "rimal", "shambani"],
    featured: true,
  },
  {
    group: "crepe-daily",
    category: "abaya",
    base: "عباية كريب سادة",
    baseEn: "Plain crêpe abaya",
    fabric: "كريب",
    occasion: "يومي",
    embroidery: "سادة",
    price: 720,
    desc: "قَصّة مستقيمة بلا زخرفة، من كريب لا يتجعّد. العباية التي تلبسينها كل يوم دون تفكير.",
    details:
      "كريب ثقيل مقاوم للتجعّد، مبطّن جزئياً. جيب داخلي واحد. سحّاب جانبي مخفي.",
    colors: ["aswad", "kohli", "zaytuni"],
  },
  {
    group: "burgundy-story",
    category: "abaya",
    base: "عباية برغندي بتطريز وردي",
    baseEn: "Burgundy abaya, rose embroidery",
    fabric: "ساتان",
    occasion: "مناسبات",
    embroidery: "تطريز يدوي",
    price: 2100,
    desc: "ألوان جريئة بذوق. البرغندي مع الوردي في توازن يعطي فخامة وأنوثة في آن.",
    details:
      "ساتان برغندي بتطريز وردي يدوي متدرّج على الكم. بطانة حرير صناعي. حزام قماشي منفصل.",
    colors: ["burgundy", "wardi"],
    featured: true,
  },
  {
    group: "bisht-classic",
    category: "bisht",
    base: "بشت مطرز بخيط ذهبي",
    baseEn: "Gold-thread bisht",
    fabric: "صوف",
    occasion: "مناسبات",
    embroidery: "تطريز يدوي",
    price: 3400,
    desc: "بشت بخيط ذهبي على الحافة والصدر، بوزن يعطي القطعة وقارها دون ثقل.",
    details:
      "صوف خفيف مبطّن بالساتان. تطريز «زري» يدوي بخيط ذهبي على الحافة الأمامية والكتف. يُفصّل على المقاس.",
    colors: ["bunni", "aswad", "rimal"],
    featured: true,
  },
  {
    group: "nida-work",
    category: "abaya",
    base: "عباية نيدا بأكمام واسعة",
    baseEn: "Wide-sleeve nida abaya",
    fabric: "نيدا",
    occasion: "يومي",
    embroidery: "سادة",
    price: 890,
    desc: "قماش النيدا المتين مع كم واسع ينسدل بهدوء. مريحة للعمل وطويل اليوم.",
    details: "نيدا كوري، غير شفاف، مقاوم للاتساخ. بلا بطانة. جيبان جانبيان.",
    colors: ["aswad", "tobi"],
  },
  {
    group: "chiffon-bridal",
    category: "abaya",
    base: "عباية شيفون بكريستال",
    baseEn: "Crystal chiffon abaya",
    fabric: "شيفون",
    occasion: "عروس",
    embroidery: "كريستال",
    price: null,
    desc: "طبقتان من الشيفون فوق بطانة عاجية، وكريستال يُثبَّت غرزة غرزة. تُفصَّل للعروس وحدها.",
    details:
      "شيفون حريري مزدوج على بطانة ساتان. كريستال أوروبي مثبّت يدوياً. تفصيل خاص بالكامل، تسليم من ١٤ إلى ٢١ يوماً.",
    colors: ["aaji", "labani"],
    featured: true,
  },
  {
    group: "linen-summer",
    category: "jalabiya",
    base: "جلابية كتان مطرزة",
    baseEn: "Embroidered linen jalabiya",
    fabric: "كتان",
    occasion: "يومي",
    embroidery: "مطرز",
    price: 640,
    desc: "كتان يتنفّس مع تطريز خفيف عند فتحة الرقبة. لصيف طرابلس تحديداً.",
    details: "كتان مخلوط بالقطن، غسيل آلي بارد. تطريز آلي دقيق عند الرقبة والكم.",
    colors: ["labani", "zaytuni", "fiddi"],
  },
  {
    group: "silk-evening",
    category: "abaya",
    base: "عباية حرير للسهرة",
    baseEn: "Silk evening abaya",
    fabric: "حرير",
    occasion: "مناسبات",
    embroidery: "سادة",
    price: 2650,
    desc: "حرير خالص بلمعة هادئة. لا تطريز — القماش وحده هو التفصيل.",
    details: "حرير توتي ١٩ مم، بطانة حرير. قصّة انسيابية بكم كيمونو. تنظيف جاف فقط.",
    colors: ["fiddi", "burgundy", "kohli"],
  },
  {
    group: "sheila-set",
    category: "sheila",
    base: "شيلة ساتان مطرزة",
    baseEn: "Embroidered satin sheila",
    fabric: "ساتان",
    occasion: "مناسبات",
    embroidery: "مطرز",
    price: 260,
    desc: "شيلة تُكمل العباية المطرزة، بنفس الخيط ونفس اليد.",
    details: "ساتان بمقاس ٢٠٠ × ٧٠ سم، حواف مخيطة يدوياً.",
    colors: ["rimal", "aaji", "wardi"],
    sizes: ["مقاس واحد"],
    lengths: ["قياسي"],
  },
];

const SIZES = ["S", "M", "L", "XL"];
const LENGTHS = ["54", "56", "58", "60"];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();

  let pos = 0;
  for (const item of CATALOG) {
    for (const colorKey of item.colors) {
      const c = byKey[colorKey];
      if (!c) continue;
      const slug = `${item.group}-${colorKey}`;
      pos += 1;

      await prisma.product.create({
        data: {
          slug,
          nameAr: item.base,
          nameEn: item.baseEn,
          colorAr: c.nameAr,
          colorEn: colorKey,
          colorHex: c.hex,
          groupKey: item.group,
          descAr: item.desc,
          detailsAr: item.details,
          careAr: CARE,
          price: item.price,
          category: item.category,
          fabric: item.fabric,
          occasion: item.occasion,
          embroidery: item.embroidery,
          sizes: JSON.stringify(item.sizes ?? SIZES),
          lengths: JSON.stringify(item.lengths ?? LENGTHS),
          isFeatured: Boolean(item.featured) && item.colors[0] === colorKey,
          isNew: pos <= 6,
          position: pos,
          images: {
            create: [1, 2, 3].map((n) => ({
              url: `/images/products/${colorKey}-${n}.jpg`,
              width: 1200,
              height: 1680,
              alt: `${item.base} — ${c.nameAr}`,
              kind: n === 1 ? "front" : n === 2 ? "back" : "detail",
              position: n - 1,
            })),
          },
        },
      });
    }
  }

  for (const [key, value] of Object.entries({
    whatsappNumber: process.env.WHATSAPP_NUMBER ?? "218910000000",
    instagram: "lirisha.ly",
    announcement: "توصيل داخل ليبيا • تفصيل خاص حسب الطلب",
    city: "طرابلس، ليبيا",
  })) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  const count = await prisma.product.count();
  console.log(`seeded ${count} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
