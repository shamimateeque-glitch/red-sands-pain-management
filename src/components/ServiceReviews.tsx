import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
  const { hash } = useLocation();

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

  // Scroll here when arriving via /treatment/<slug>#reviews. The section only
  // exists once the reviews have loaded — two chained requests behind the page
  // load — which is usually too late for the global hash handler's retry
  // window, so it re-runs the scroll itself once the content is on screen.
  useEffect(() => {
    if (hash !== "#reviews" || reviews.length === 0) return;

    const scroll = (behavior: ScrollBehavior) =>
      document.getElementById("reviews")?.scrollIntoView({ behavior, block: "start" });

    const raf = requestAnimationFrame(() => scroll("smooth"));
    // Re-align instantly after late layout shifts (images finishing, reveal
    // animations expanding), which also guarantees we land even where smooth
    // scrolling is unavailable.
    const timers = [500, 1000].map((ms) =>
      window.setTimeout(() => scroll("auto"), ms)
    );

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [hash, reviews.length]);

  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="py-12 bg-secondary/5 scroll-mt-24">
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
