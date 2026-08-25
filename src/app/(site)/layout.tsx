import { Suspense } from "react";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { BottomNav } from "@/components/site/BottomNav";
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
      {/* The bar is fixed, so the page needs the height back at the end or
          the footer's last row sits under it. */}
      <main style={{ paddingBlockEnd: "calc(56px + env(safe-area-inset-bottom, 0px))" }} className="md:!pb-0">
        {children}
      </main>
      <Footer
        whatsappNumber={s.whatsappNumber}
        instagram={s.instagram}
        facebook={s.facebook}
        city={s.city}
      />
      <CartDrawer />
      <BottomNav />
    </CartProvider>
  );
}
