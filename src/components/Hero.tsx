import { Button } from "@/components/ui/button";
import { ArrowRight, Stethoscope, Shield, Users } from "lucide-react";
import heroImage from "@/assets/hero-img.png";
import { useEffect, useState } from "react";

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-[820px] md:min-h-[650px] flex items-center overflow-hidden">
      {/* Background Image with Overlay and Parallax */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Healthcare professional with stethoscope"
          className="w-full h-full object-cover opacity-[0.65]"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/99 via-background/95 to-background/90" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl md:-mt-[115px]">
          {/* Decorative accent line */}
          <div className="h-1 bg-primary rounded-full mb-6 animate-fade-in animate-[grow-width_1s_ease-out_forwards] w-0" style={{ animationDelay: '0.1s' }} />

          <h1 className="mb-6 text-maroon animate-fade-in drop-shadow-sm">
            Expert Chronic Pain Management in Charlottetown
          </h1>
          <p className="text-xl text-secondary/90 mb-8 leading-relaxed animate-fade-in text-justify" style={{ animationDelay: '0.2s' }}>
            Red Sands Pain Management provides comprehensive, compassionate care for chronic pain conditions.
            Our specialized team offers advanced treatment options to help you regain your quality of life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button size="lg" asChild className="hover:bg-secondary hover:text-white transition-colors animate-[subtle-pulse_3s_ease-in-out_infinite]">
              <a href="#treatments" className="flex items-center gap-2">
                View Our Covered Services
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" asChild className="hover:bg-secondary hover:text-white transition-colors">
              <a href="#private-pay" className="flex items-center gap-2">
                View Our Private Pay Services
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" asChild className="hover:bg-secondary hover:text-white transition-colors">
              <a href="#contact">Contact Us</a>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-6 mt-10 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-2 text-secondary/70">
              <Stethoscope className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">15+ Treatment Options</span>
            </div>
            <div className="flex items-center gap-2 text-secondary/70">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Expert Specialists</span>
            </div>
            <div className="flex items-center gap-2 text-secondary/70">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Referral-Based Care</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider at bottom */}
      <div className="absolute -bottom-px left-0 right-0 z-10">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
          <path
            d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z"
            fill="#faf8f5"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
