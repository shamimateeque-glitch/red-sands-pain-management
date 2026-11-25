import { Heart, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const LivingDonorSection = () => {
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
    <section id="living-donor" className="py-16 bg-white" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div
          className={`max-w-4xl mx-auto transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="relative bg-primary/5 border border-primary/15 rounded-2xl p-6 md:p-8 shadow-sm">
            {/* Left accent bar */}
            <div className="absolute left-0 top-6 bottom-6 w-1 bg-primary rounded-full" />

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Heart className="h-7 w-7 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="inline-block mb-3">
                  <span className="text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary px-3 py-1 rounded-full">
                    New Partnership
                  </span>
                </div>
                <h2 className="text-maroon text-2xl md:text-3xl font-semibold mb-4">
                  Proud Member of the Living Donor Circle of Excellence
                </h2>
                <p className="text-foreground/80 text-base md:text-lg leading-relaxed text-justify">
                  Red Sands Pain Management is pleased to announce that we have joined the Living Donor Circle of
                  Excellence Program in partnership with the Kidney Foundation of Canada, the American Society of
                  Transplantation, and the Canadian Society of Transplantation. Red Sands Pain Management is dedicated to
                  supporting employees who step up to save a life as a living organ donor by reducing their financial
                  burden. To support this, Red Sands Pain Management will offer up to six weeks of paid leave to any
                  employee who chooses to be a living donor.
                </p>
                <a
                  href="https://www.livingdonorcircle.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  Learn More
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LivingDonorSection;
