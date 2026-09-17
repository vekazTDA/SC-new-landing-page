import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import ProductsSection from "@/components/ProductsSection";
import AddonsSection from "@/components/AddonsSection";
import BoxShowcaseSection from "@/components/BoxShowcaseSection";
import ShopSection from "@/components/ShopSection";
import SectionHandoff from "@/components/SectionHandoff";
import TestimonialsSection from "@/components/TestimonialsSection";
import AppreciationSection from "@/components/AppreciationSection";
import ContactSection from "@/components/ContactSection";
import CtaBannerSection from "@/components/CtaBannerSection";
import SiteFooter from "@/components/SiteFooter";
import { getAddons, getProducts, getShopProducts } from "@/lib/catalog";

// Legal because cacheComponents is off. ISR means a build that fell back to the static
// catalogue self-heals within the hour once Supabase comes online — no redeploy needed.
export const revalidate = 3600;

export default async function Home() {
  const [products, shopProducts, addons] = await Promise.all([
    getProducts(),
    getShopProducts(),
    getAddons(),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Hero />
        <ProductsSection products={products} />
        <AddonsSection addons={addons} />
        <BoxShowcaseSection />
        <ShopSection products={shopProducts} />
        <TestimonialsSection />
        {/* dark -> cream happens here, after the cards, not inside their section */}
        <SectionHandoff />
        <AppreciationSection />
        <ContactSection />
        <CtaBannerSection />
      </main>
      <SiteFooter />
    </>
  );
}
