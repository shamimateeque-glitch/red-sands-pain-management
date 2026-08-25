import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { quoteParagraphs } from "@/types/review";

export interface ReviewHighlightData {
  /** Opening line of the review, used as the card teaser. */
  line: string;
  /** Attribution shown under the line. */
  name: string;
}

/**
 * Fetches every published review in one batched query and returns a map of
 * treatment id -> teaser, so service cards can show a short pull-quote without
 * issuing a request per card.
 *
 * When a service has several published reviews, the one with the lowest
 * display_order wins — so the drag-ordering in the admin Reviews tab decides
 * which quote is featured on the card.
 *
 * Fails soft: any error (including the table not existing yet) yields an empty
 * map, so cards render exactly as they did before this feature.
 */
export const useReviewHighlights = () => {
  const [highlights, setHighlights] = useState<Map<string, ReviewHighlightData>>(
    new Map()
  );

  useEffect(() => {
    let cancelled = false;

    const fetchHighlights = async () => {
      const { data, error } = await supabase
        .from("service_reviews")
        .select("treatment_id, quote, patient_name")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (cancelled || error || !data) return;

      const map = new Map<string, ReviewHighlightData>();
      for (const row of data) {
        // Rows arrive ordered, so the first one seen per service is the featured one.
        if (map.has(row.treatment_id)) continue;

        const line = quoteParagraphs(row.quote)[0];
        if (!line) continue;

        map.set(row.treatment_id, {
          line,
          name: row.patient_name?.trim() || "Verified Patient",
        });
      }

      setHighlights(map);
    };

    fetchHighlights();

    return () => {
      cancelled = true;
    };
  }, []);

  return highlights;
};
