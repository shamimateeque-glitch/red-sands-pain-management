// Team data now lives in the Supabase `team_members` table and is managed from
// the admin panel (/admin → Team tab). The public pages (src/pages/Team.tsx and
// src/components/TeamSection.tsx) fetch it at runtime; the row shape and helpers
// live in src/types/team.ts.
//
// Only this slug helper remains here — it derives the URL hash used to deep-link
// to a member's modal on /team (e.g. /team#dr-kamran-khan).

/** URL-safe slug derived from a person's name. Used as anchor id on /team. */
export const teamSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
