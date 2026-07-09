import consultationImage from "@/assets/consultation-new.png";
import { useEffect, useRef, useState } from "react";
import { Stethoscope, Shield, Users, FileText, Download } from "lucide-react";

const AboutSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="about" className="relative py-20 bg-secondary/10 overflow-hidden" ref={sectionRef}>
      {/* Top wave divider */}
      <div className="absolute -top-px left-0 right-0 z-10">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
          <path
            d="M0 60C360 0 720 40 1080 20C1260 10 1380 30 1440 60V0H0V60Z"
            fill="hsl(0 0% 97%)"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main content grid */}
        <div
          className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          {/* Image with maroon accent panel behind */}
          <div
            className="relative transition-all duration-1000 delay-150"
            style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateX(0)" : "translateX(-20px)" }}
          >
            <div className="relative">
              {/* Maroon accent panel behind image */}
              <div className="absolute -left-4 top-4 bottom-4 w-2 bg-primary rounded-full" />
              <div className="absolute -bottom-4 -left-4 w-full h-full rounded-xl bg-primary/10" />
              <img
                src={consultationImage}
                alt="Doctor consultation"
                className="rounded-xl shadow-2xl w-full h-auto relative z-10"
              />
              {/* Badge overlay */}
              <div className="absolute -bottom-5 left-6 z-20 bg-primary text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-semibold tracking-wide">Compassionate Care</span>
              </div>
            </div>
          </div>

          {/* Text content with accent */}
          <div
            className="transition-all duration-1000 delay-300"
            style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateX(0)" : "translateX(20px)" }}
          >
            {/* Heading with accent line */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-1 h-16 bg-primary rounded-full shrink-0 mt-1" />
              <h2 className="text-maroon">About Red Sands Pain Management</h2>
            </div>

            <div className="space-y-4 text-foreground/80 text-justify">
              <p className="text-lg leading-relaxed">
                Living with chronic pain can take a heavy toll on your physical, emotional, and psychological
                well-being. At Red Sands Pain Management, we understand the challenges you face.
              </p>
              <p className="text-lg leading-relaxed">
                Our clinic specializes in providing comprehensive pain management solutions tailored to each patient's
                unique needs. We utilize advanced, evidence-based treatments combined with compassionate care to help
                you achieve meaningful relief.
              </p>
            </div>

            {/* Referral callout card */}
            <div className="mt-6 bg-primary/5 border border-primary/15 rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-maroon font-semibold mb-1 text-base">Referral Required</h4>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  All patients should have a referral to be seen at the clinic. Your Doctor, Nurse Practitioner,
                  Chiropractor or a Physiotherapist can refer you to us.
                </p>
                <p className="text-foreground/70 text-sm leading-relaxed mt-2">
                  Referral can be faxed or emailed.
                </p>
                <a
                  href="/documents/Red-Sands-Referral-Form.pdf"
                  download="Red-Sands-Referral-Form.pdf"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" />
                  Download Form
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          {[
            { icon: Stethoscope, number: "15+", label: "Treatment Options" },
            { icon: Shield, number: "Expert", label: "Specialists" },
            { icon: Users, number: "Referral", label: "Based Care" },
            { icon: FileText, number: "Evidence", label: "Based Approach" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center bg-white border border-border/50 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <stat.icon className="h-7 w-7 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-maroon mb-1">{stat.number}</div>
              <div className="text-sm text-muted-foreground tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave divider */}
      <div className="absolute -bottom-px left-0 right-0 z-10">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
          <path
            d="M0 0C360 60 720 20 1080 40C1260 50 1380 30 1440 0V60H0V0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

export default AboutSection;
