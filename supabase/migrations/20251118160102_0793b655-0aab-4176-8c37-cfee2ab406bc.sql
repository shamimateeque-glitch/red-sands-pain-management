-- Update treatments RLS policies to use has_role() instead of profiles.role
DROP POLICY IF EXISTS "Admins can insert treatments" ON public.treatments;
DROP POLICY IF EXISTS "Admins can update treatments" ON public.treatments;
DROP POLICY IF EXISTS "Admins can delete treatments" ON public.treatments;

CREATE POLICY "Admins can insert treatments"
ON public.treatments
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update treatments"
ON public.treatments
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete treatments"
ON public.treatments
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));