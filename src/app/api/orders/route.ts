import { NextResponse, type NextRequest } from "next/server";
import { randomInt } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";
import { buildOrderMessage, whatsappUrl } from "@/lib/whatsapp";
import { VISITOR_COOKIE } from "@/proxy";
import type { CartLine } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALPHABET = "ACDEFGHJKLMNPQRTUVWXY3479"; // no look-alikes

function makeRef() {
  let s = "";
  for (let i = 0; i < 4; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `LR-${s}`;
}

const Body = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        size: z.string().max(20).default(""),
        length: z.string().max(20).default(""),
        qty: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(20),
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    phone: z.string().trim().min(6).max(30),
    city: z.string().trim().min(2).max(60),
    note: z.string().trim().max(500).optional(),
  }),
});

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // Prices are re-read from the database. The client never sets a price.
  const products = await prisma.product.findMany({
    where: { id: { in: parsed.items.map((i) => i.productId) }, isActive: true },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: CartLine[] = [];
  for (const item of parsed.items) {
    const p = byId.get(item.productId);
    if (!p) continue;
    lines.push({
      key: `${p.id}::${item.size}::${item.length}`,
      productId: p.id,
      slug: p.slug,
      nameAr: p.nameAr,
      colorAr: p.colorAr,
      image: p.images[0]?.url ?? "",
      price: p.price,
      size: item.size,
      length: item.length,
      qty: item.qty,
    });
  }

  if (!lines.length) {
    return NextResponse.json({ ok: false, error: "empty_cart" }, { status: 400 });
  }

  const subtotal = lines.reduce((s, l) => s + (l.price ?? 0) * l.qty, 0);
  const hasQuoteItems = lines.some((l) => l.price === null);

  const vid = req.cookies.get(VISITOR_COOKIE)?.value ?? null;
  const visitor = vid ? await prisma.visitor.findUnique({ where: { id: vid } }) : null;

  // Collision-safe ref
  let ref = makeRef();
  for (let i = 0; i < 6; i += 1) {
    const clash = await prisma.order.findUnique({ where: { ref } });
    if (!clash) break;
    ref = makeRef();
  }

  const order = await prisma.order.create({
    data: {
      ref,
      visitorId: visitor?.id ?? null,
      customerName: parsed.customer.name,
      phone: parsed.customer.phone,
      city: parsed.customer.city,
      note: parsed.customer.note ?? null,
      subtotal,
      hasQuoteItems,
      channel: visitor?.channel ?? "direct",
      utmSource: visitor?.utmSource ?? null,
      utmMedium: visitor?.utmMedium ?? null,
      utmCampaign: visitor?.utmCampaign ?? null,
      referrer: visitor?.referrer ?? null,
      landingPath: visitor?.landingPath ?? null,
      items: {
        create: lines.map((l) => ({
          productId: l.productId,
          nameAr: l.nameAr,
          colorAr: l.colorAr,
          slug: l.slug,
          image: l.image,
          price: l.price,
          size: l.size,
          length: l.length,
          qty: l.qty,
        })),
      },
    },
  });

  if (vid) {
    await prisma.event.create({
      data: {
        visitorId: vid,
        type: "order_created",
        meta: JSON.stringify({ ref, subtotal, items: lines.length }),
      },
    });
  }

  const number = await getSetting("whatsappNumber");
  const message = buildOrderMessage({
    ref,
    lines,
    customer: parsed.customer,
    subtotal,
    hasQuoteItems,
  });

  return NextResponse.json({
    ok: true,
    ref: order.ref,
    subtotal,
    waUrl: whatsappUrl(number, message),
  });
}
