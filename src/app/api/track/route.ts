import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveChannel, resolveDevice } from "@/lib/attribution";
import { VISITOR_COOKIE } from "@/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  type: z.enum([
    "page_view",
    "product_view",
    "add_to_cart",
    "remove_from_cart",
    "cart_open",
    "checkout_start",
    "whatsapp_click",
    "order_created",
    "filter_apply",
  ]),
  path: z.string().max(300).optional(),
  productId: z.string().max(60).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  referrer: z.string().max(500).optional(),
  utm: z
    .object({
      source: z.string().max(120).optional(),
      medium: z.string().max(120).optional(),
      campaign: z.string().max(120).optional(),
      content: z.string().max(120).optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const vid = req.cookies.get(VISITOR_COOKIE)?.value;
  if (!vid) return NextResponse.json({ ok: false }, { status: 204 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const ua = req.headers.get("user-agent");
  const selfHost = req.nextUrl.hostname;

  const existing = await prisma.visitor.findUnique({ where: { id: vid } });

  if (!existing) {
    // First touch — this is the only moment attribution is written.
    const referrer = parsed.referrer || req.headers.get("referer") || null;
    await prisma.visitor.create({
      data: {
        id: vid,
        channel: resolveChannel(parsed.utm?.source, referrer, selfHost),
        utmSource: parsed.utm?.source ?? null,
        utmMedium: parsed.utm?.medium ?? null,
        utmCampaign: parsed.utm?.campaign ?? null,
        utmContent: parsed.utm?.content ?? null,
        referrer,
        landingPath: parsed.path ?? "/",
        device: resolveDevice(ua),
        country: req.headers.get("x-vercel-ip-country") ?? null,
      },
    });
  } else {
    await prisma.visitor.update({
      where: { id: vid },
      data: { lastSeenAt: new Date() },
    });
  }

  await prisma.event.create({
    data: {
      visitorId: vid,
      type: parsed.type,
      path: parsed.path ?? null,
      productId: parsed.productId ?? null,
      meta: parsed.meta ? JSON.stringify(parsed.meta) : null,
    },
  });

  return NextResponse.json({ ok: true });
}
