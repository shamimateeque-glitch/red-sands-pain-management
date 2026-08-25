// Shared shape for a row of the Supabase `service_reviews` table — a patient
// review attached to a single treatment/service.

export interface ServiceReview {
  id: string;
  treatment_id: string;
  /** Displayed attribution, e.g. "Robin C.". Null/blank renders as "Verified Patient". */
  patient_name: string | null;
  quote: string;
  /** Reviews stay hidden on the public site until this is switched on. */
  is_published: boolean;
  display_order: number;
  created_at?: string | null;
  updated_at?: string | null;
  /** Present when the row is fetched with a `treatments(title)` join (admin list). */
  treatments?: { title: string } | null;
}

/** Split a stored quote into paragraphs on newlines, dropping empties. */
export const quoteParagraphs = (quote: string): string[] =>
  quote
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
