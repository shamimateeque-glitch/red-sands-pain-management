-- Create treatments table
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  content TEXT,
  icon TEXT,
  pdf_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

-- Create policies - anyone can view treatments
CREATE POLICY "Anyone can view treatments"
  ON public.treatments
  FOR SELECT
  USING (true);

-- Authenticated users with admin role can manage treatments
CREATE POLICY "Admins can insert treatments"
  ON public.treatments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update treatments"
  ON public.treatments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete treatments"
  ON public.treatments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_treatments_updated_at
  BEFORE UPDATE ON public.treatments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage buckets for treatment files
INSERT INTO storage.buckets (id, name, public)
VALUES ('treatment-pdfs', 'treatment-pdfs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('treatment-images', 'treatment-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for PDFs
CREATE POLICY "Anyone can view treatment PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'treatment-pdfs');

CREATE POLICY "Admins can upload treatment PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'treatment-pdfs' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update treatment PDFs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'treatment-pdfs' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete treatment PDFs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'treatment-pdfs' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Storage policies for images
CREATE POLICY "Anyone can view treatment images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'treatment-images');

CREATE POLICY "Admins can upload treatment images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'treatment-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update treatment images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'treatment-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete treatment images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'treatment-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );