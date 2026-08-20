// Shared shape for a row of the Supabase `team_members` table, used by the
// admin CRUD components and the public team pages.

export type TeamCategory = "administrative" | "clinical" | "collaborations";

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  category: string; // TeamCategory in practice
  photo_url: string | null;
  modal_photo_url: string | null;
  initials: string | null;
  /** Stored as a JSON array of paragraph strings. */
  bio: string[] | null;
  modal_aspect: string | null;
  // collaborator-only fields
  business: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  display_order: number;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Coerce the JSONB `bio` value (which may arrive as string, array, or null)
 *  into a clean array of non-empty paragraph strings. */
export const normalizeBio = (bio: unknown): string[] => {
  if (Array.isArray(bio)) {
    return bio.filter((p): p is string => typeof p === "string" && p.trim().length > 0);
  }
  if (typeof bio === "string" && bio.trim().length > 0) {
    return [bio];
  }
  return [];
};
