import Navbar from "@/components/marketing/navbar";
import Hero from "@/components/marketing/hero";
import Stats from "@/components/marketing/stats";
import Features from "@/components/marketing/features";
import ToolCategories from "@/components/marketing/tool-categories";
import Testimonials from "@/components/marketing/testimonials";
import FAQCTA from "@/components/marketing/faq-cta";
import Footer from "@/components/marketing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <ToolCategories />
        <Testimonials />
        <FAQCTA />
      </main>
      <Footer />
    </>
  );
}
