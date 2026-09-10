import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import ProductsSection from "@/components/ProductsSection";
import AddonsSection from "@/components/AddonsSection";
import BoxShowcaseSection from "@/components/BoxShowcaseSection";
import ShopSection from "@/components/ShopSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import AppreciationSection from "@/components/AppreciationSection";
import ContactSection from "@/components/ContactSection";
import CtaBannerSection from "@/components/CtaBannerSection";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Hero />
        <ProductsSection />
        <AddonsSection />
        <BoxShowcaseSection />
        <ShopSection />
        <TestimonialsSection />
        <AppreciationSection />
        <ContactSection />
        <CtaBannerSection />
      </main>
      <SiteFooter />
    </>
  );
}
