import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import TreatmentsSection from "@/components/TreatmentsSection";
import PrivatePaySection from "@/components/PrivatePaySection";
import AboutSection from "@/components/AboutSection";
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
        <ContactSection />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
