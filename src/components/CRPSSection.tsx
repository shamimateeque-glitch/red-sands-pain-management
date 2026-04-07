import crpsDiagram from "@/assets/crps-diagram-new.png";

const CRPSSection = () => {
  const treatments = [
    "Botox for Migraines and Spasmodic Conditions",
    "Treatment for nerve entrapments",
    "Treatment of Post Herpetic Neuralgia",
    "Hip, Knee and Shoulder Denervations",
  ];

  return (
    <section className="py-16 bg-maroon">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image Column */}
            <div>
              <img
                src={crpsDiagram}
                alt="Complex Regional Pain Syndrome diagram showing the pain cycle"
                className="w-full rounded-lg shadow-2xl"
              />
            </div>

            {/* Content Column */}
            <div className="space-y-6">
              <h2 className="text-white">Complex Regional Pain Syndrome</h2>
              
              <p className="text-lg text-white/90 leading-relaxed">
                Specialized treatments for complex pain conditions requiring advanced interventional approaches. 
                Our clinic offers comprehensive care for patients dealing with complex regional pain syndrome and related conditions.
              </p>

              <div className="pt-4">
                <h3 className="text-2xl font-semibold mb-6 text-white">
                  Specialized Treatment Options
                </h3>
                <ul className="space-y-4">
                  {treatments.map((treatment, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-white/90"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                        <span className="text-white font-semibold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-lg leading-relaxed">{treatment}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CRPSSection;
