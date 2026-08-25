import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ ref: z.string().min(4).max(20) });

/**
 * Fired by sendBeacon at the moment the customer is handed to WhatsApp.
 * This is the conversion event the dashboard funnel ends on.
 */
export async function POST(req: NextRequest) {
  try {
    const { ref } = Body.parse(await req.json());
    await prisma.order.updateMany({
      where: { ref, whatsappOpenedAt: null },
      data: { whatsappOpenedAt: new Date(), status: "opened" },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
