import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import TreatmentsSection from "@/components/TreatmentsSection";
import PrivatePaySection from "@/components/PrivatePaySection";
import AboutSection from "@/components/AboutSection";
import LivingDonorSection from "@/components/LivingDonorSection";
import TeamSection from "@/components/TeamSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Hero />
        <TreatmentsSection />
        <PrivatePaySection />
        <AboutSection />
        <LivingDonorSection />
        <TeamSection />
        <ContactSection />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
