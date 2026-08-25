import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { quoteParagraphs, type ServiceReview } from "@/types/review";

interface ServiceReviewsProps {
  /** The treatment this section shows reviews for. */
  treatmentId: string;
}

/**
 * Published patient reviews for one service. Renders nothing at all when the
 * service has no published reviews, so pages without reviews are unchanged.
 */
const ServiceReviews = ({ treatmentId }: ServiceReviewsProps) => {
  const [reviews, setReviews] = useState<ServiceReview[]>([]);

  useEffect(() => {
    if (!treatmentId) return;

    let cancelled = false;

    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("service_reviews")
        .select("*")
        .eq("treatment_id", treatmentId)
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (!cancelled && !error && data) {
        setReviews(data as ServiceReview[]);
      }
    };

    fetchReviews();

    return () => {
      cancelled = true;
    };
  }, [treatmentId]);

  if (reviews.length === 0) return null;

  return (
    <section className="py-12 bg-secondary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-12 h-1 bg-primary rounded-full mx-auto mb-4" />
            <h2 className="text-maroon">What Our Patients Say</h2>
          </div>

          <div className="space-y-5">
            {reviews.map((review) => (
              <figure
                key={review.id}
                className="relative bg-white border border-border/40 rounded-2xl p-7 md:p-8 shadow-sm"
              >
                <Quote
                  className="absolute top-6 left-6 h-8 w-8 text-primary/15"
                  aria-hidden="true"
                />
                <blockquote className="relative pl-6 md:pl-8 space-y-3">
                  {quoteParagraphs(review.quote).map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-lg md:text-xl leading-relaxed text-foreground/85 italic"
                    >
                      {paragraph}
                    </p>
                  ))}
                </blockquote>
                <figcaption className="mt-5 pl-6 md:pl-8 text-sm font-semibold text-primary">
                  — {review.patient_name?.trim() || "Verified Patient"}
                </figcaption>
              </figure>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Individual results vary. Patient experiences are shared with consent and are
            not a guarantee of outcome.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ServiceReviews;
