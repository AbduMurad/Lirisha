import { Suspense } from "react";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { PageView } from "@/components/site/PageView";
import { getSettings } from "@/lib/settings";

// The whole storefront reads the store settings (WhatsApp number, announcement
// bar) on every request so the dashboard can change them without a redeploy.
// That makes every page in this segment dynamic — which also means `next build`
// never needs a reachable database.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();

  return (
    <CartProvider>
      <Suspense fallback={null}>
        <PageView />
      </Suspense>
      <Header announcement={s.announcement} />
      <main>{children}</main>
      <Footer
        whatsappNumber={s.whatsappNumber}
        instagram={s.instagram}
        facebook={s.facebook}
        city={s.city}
      />
      <CartDrawer />
    </CartProvider>
  );
}
