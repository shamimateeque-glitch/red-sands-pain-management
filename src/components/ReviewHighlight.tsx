import { Quote } from "lucide-react";
import type { ReviewHighlightData } from "@/hooks/useReviewHighlights";

interface ReviewHighlightProps {
  highlight?: ReviewHighlightData;
}

/**
 * Short pull-quote teaser shown on a service card when that service has a
 * published patient review. Renders nothing when there is no review, so cards
 * for services without one are untouched.
 */
const ReviewHighlight = ({ highlight }: ReviewHighlightProps) => {
  if (!highlight) return null;

  return (
    <figure className="mb-4 rounded-xl bg-primary/[0.07] border border-primary/10 px-4 py-3">
      <div className="flex gap-2.5">
        <Quote className="h-4 w-4 text-primary/50 shrink-0 mt-0.5" aria-hidden="true" />
        <blockquote className="text-sm leading-snug text-foreground/80 italic line-clamp-2">
          {highlight.line}
        </blockquote>
      </div>
      <figcaption className="mt-1.5 pl-[26px] text-xs font-semibold text-primary">
        — {highlight.name}
      </figcaption>
    </figure>
  );
};

export default ReviewHighlight;
