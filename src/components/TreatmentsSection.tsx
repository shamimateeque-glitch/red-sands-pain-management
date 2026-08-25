import { useEffect, useState } from "react";
import TreatmentCard from "./TreatmentCard";
import { supabase } from "@/integrations/supabase/client";
import * as Icons from "lucide-react";
import { useReviewHighlights } from "@/hooks/useReviewHighlights";

interface Treatment {
  id: string;
  title: string;
  description: string;
  icon: string;
  slug: string;
  pdf_url?: string;
  image_url?: string;
  icon_background?: string;
  icon_svg_url?: string;
}

const TreatmentsSection = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const reviewHighlights = useReviewHighlights();

  useEffect(() => {
    fetchTreatments();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('treatments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'treatments'
        },
        () => {
          fetchTreatments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTreatments = async () => {
    const { data, error } = await supabase
      .from("treatments")
      .select("id, title, description, icon, slug, pdf_url, image_url, icon_background, icon_svg_url")
      .eq("service_type", "covered")
      .order("display_order", { ascending: true })
      .order("title", { ascending: true });

    if (!error && data) {
      setTreatments(data);
    }
    setLoading(false);
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Activity;
    return <Icon className="h-6 w-6" />;
  };

  if (loading) {
    return (
      <section id="treatments" className="pt-10 pb-8 bg-gradient-to-b from-[#faf8f5] to-white">
        <div className="container mx-auto px-4 text-center">
          <p>Loading treatments...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="treatments" className="pt-10 pb-8 bg-gradient-to-b from-[#faf8f5] to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-12 h-1 bg-primary rounded-full mx-auto mb-4" />
          <h2 className="mb-4 text-maroon">Our Covered Services</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We offer a comprehensive range of advanced pain management treatments tailored to your specific condition and needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {treatments.map((treatment) => (
            <TreatmentCard 
              key={treatment.slug} 
              title={treatment.title}
              description={treatment.description}
              icon={getIcon(treatment.icon)}
              slug={treatment.slug}
              pdfUrl={treatment.pdf_url}
              imageUrl={treatment.image_url}
              iconBackground={treatment.icon_background}
              iconSvgUrl={treatment.icon_svg_url}
              reviewHighlight={reviewHighlights.get(treatment.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TreatmentsSection;
