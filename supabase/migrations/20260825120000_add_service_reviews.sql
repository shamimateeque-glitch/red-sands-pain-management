-- Patient reviews attached to a service (treatment), managed from the admin panel.
-- Mirrors the team_members pattern: public read, admin-only write.

-- 1. Table -------------------------------------------------------------------
CREATE TABLE public.service_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_id UUID NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
  -- Displayed attribution, e.g. "Robin C.". Leave blank to show "Verified Patient".
  patient_name TEXT,
  quote TEXT NOT NULL,
  -- Reviews stay hidden until explicitly published from the admin panel.
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX service_reviews_treatment_id_idx ON public.service_reviews (treatment_id);

-- 2. RLS: public read, admin-only write --------------------------------------
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view service reviews"
  ON public.service_reviews FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert service reviews"
  ON public.service_reviews FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update service reviews"
  ON public.service_reviews FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete service reviews"
  ON public.service_reviews FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. updated_at trigger (reuses existing handle_updated_at function) ---------
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.service_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Seed the PRP review as an UNPUBLISHED draft -----------------------------
-- Attached to "Platelet Rich Plasma (PRP) Injections". It will NOT appear on
-- the site until it is switched to Published in the admin panel.
INSERT INTO public.service_reviews (treatment_id, patient_name, quote, is_published, display_order)
SELECT
  t.id,
  'Robin C.',
  E'It has been a game changer!\nI can sleep through the night, I can cross my legs again! It was worth it in the end!\nI had discomfort (quite moderate) for the first two days but after that it was already better than before PRP — and now it is like a new hip!',
  false,
  0
FROM public.treatments t
WHERE t.slug = 'platelet-rich-plasma-prp-injections';
