import { Quote } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReviewHighlightData } from "@/hooks/useReviewHighlights";

interface ReviewHighlightProps {
  highlight?: ReviewHighlightData;
  /** When set, the teaser links here (the service's full review section). */
  href?: string;
}

/**
 * Short pull-quote teaser shown at the foot of a service card when that service
 * has a published patient review. Renders nothing when there is no review, so
 * cards for services without one are untouched.
 */
const ReviewHighlight = ({ highlight, href }: ReviewHighlightProps) => {
  if (!highlight) return null;

  const body = (
    <>
      <div className="flex gap-2.5">
        <Quote className="h-4 w-4 text-primary/50 shrink-0 mt-0.5" aria-hidden="true" />
        <blockquote className="text-sm leading-snug text-foreground/80 italic line-clamp-2">
          {highlight.line}
        </blockquote>
      </div>
      <div className="mt-1.5 pl-[26px] flex items-center justify-between gap-2">
        <figcaption className="text-xs font-semibold text-primary">
          — {highlight.name}
        </figcaption>
        {href && (
          <span className="text-xs font-medium text-primary/70 group-hover/review:text-primary transition-colors whitespace-nowrap">
            Read review →
          </span>
        )}
      </div>
    </>
  );

  const boxClass =
    "mt-4 block rounded-xl bg-primary/[0.07] border border-primary/10 px-4 py-3";

  if (!href) {
    return <figure className={boxClass}>{body}</figure>;
  }

  return (
    <Link
      to={href}
      className={`group/review ${boxClass} transition-colors hover:bg-primary/[0.11] hover:border-primary/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`}
      aria-label={`Read the full patient review for this service`}
    >
      <figure>{body}</figure>
    </Link>
  );
};

export default ReviewHighlight;
