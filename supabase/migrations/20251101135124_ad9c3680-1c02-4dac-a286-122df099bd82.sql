-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create treatments table
CREATE TABLE public.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  icon TEXT NOT NULL,
  pdf_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for treatments
CREATE POLICY "Anyone can view treatments"
  ON public.treatments FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert treatments"
  ON public.treatments FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update treatments"
  ON public.treatments FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete treatments"
  ON public.treatments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('treatment-pdfs', 'treatment-pdfs', true),
  ('treatment-images', 'treatment-images', true);

-- Storage policies for PDFs
CREATE POLICY "Anyone can view PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'treatment-pdfs');

CREATE POLICY "Admins can upload PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'treatment-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update PDFs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'treatment-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete PDFs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'treatment-pdfs' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for images
CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'treatment-images');

CREATE POLICY "Admins can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'treatment-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'treatment-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'treatment-images' AND public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add trigger to treatments table
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.treatments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();