import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Handles scroll on route changes.
 *
 * - No hash → scroll to top of page.
 * - Hash present → scroll to element with that id once it exists. Retries
 *   for a short window because the target section may not be rendered yet
 *   right after a route change (especially on a full page load from another
 *   route, e.g. /team → /#about).
 */
const ScrollToTopOnNavigate = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      return;
    }

    const id = decodeURIComponent(hash.slice(1));
    if (!id) return;

    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 20; // ~1s at 50ms intervals
    const timers: number[] = [];

    const scrollNow = (behavior: ScrollBehavior) => {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior, block: "start" });
      return true;
    };

    const tryScroll = () => {
      if (cancelled) return;
      if (scrollNow("smooth")) {
        // Re-align a few times after the initial scroll to compensate for
        // late layout shifts: images loading, scroll-reveal animations
        // expanding placeholders, carousels populating, etc.
        [300, 700, 1200, 1800].forEach((ms) => {
          const t = window.setTimeout(() => {
            if (!cancelled) scrollNow("auto");
          }, ms);
          timers.push(t);
        });
        return;
      }
      if (attempts++ < MAX_ATTEMPTS) {
        const t = window.setTimeout(tryScroll, 50);
        timers.push(t);
      } else {
        // Element never appeared — fall back to scrolling to top so the
        // user doesn't get left at the previous page's scroll position.
        // (This covers e.g. /team#<slug> which opens a modal instead of
        // scrolling to an element.)
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      }
    };

    // Defer to next frame so React has a chance to render the target.
    requestAnimationFrame(tryScroll);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [pathname, hash]);

  return null;
};

export default ScrollToTopOnNavigate;
