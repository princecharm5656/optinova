
import Link from "next/link";
import Navbar from "@/components/marketing/navbar";
import Hero from "@/components/marketing/hero";
import Stats from "@/components/marketing/stats";
import Features from "@/components/marketing/features";
import ToolCategories from "@/components/marketing/tool-categories";
import Testimonials from "@/components/marketing/testimonials";
import FAQCTA from "@/components/marketing/faq-cta";
import Footer from "@/components/marketing/footer";
import WaitlistForm from "@/components/marketing/waitlist-form";

export const dynamic = "force-dynamic";

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
        <section className="py-16"></section>
          <WaitlistForm /> 
      </main>
      <Footer />
    </>
  );
}
