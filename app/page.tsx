import ContactSection from "@/components/home/contact/ContactSection";
import Hero from "@/components/home/hero/hero";
import PriceCardGrid from "@/components/home/Pricing/PricingGrid";
import ServicesSection from "@/components/home/services/ServiceSection";
import SubscribeSection from "@/components/home/subscribe/Subscribe";

export default function Home() {
  return (
    <div>
      <Hero />
      <ServicesSection />
      <PriceCardGrid />
      <ContactSection />
      <SubscribeSection />
    </div>
  );
}
