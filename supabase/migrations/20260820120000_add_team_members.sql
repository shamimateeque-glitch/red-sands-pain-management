-- Team members: move the hardcoded team (src/data/team.ts) into a Supabase table
-- so the team can be managed from the admin panel, mirroring the treatments pattern.

-- 1. Table -------------------------------------------------------------------
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  -- one of: 'administrative' | 'clinical' | 'collaborations'
  category TEXT NOT NULL DEFAULT 'clinical',
  photo_url TEXT,
  modal_photo_url TEXT,
  initials TEXT,
  -- array of paragraph strings (preserves the string / string[] bio shape)
  bio JSONB NOT NULL DEFAULT '[]'::jsonb,
  modal_aspect TEXT,
  -- collaborator-only fields (nullable for regular members)
  business TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. RLS: public read, admin-only write (same shape as treatments) -----------
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team members"
  ON public.team_members FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert team members"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update team members"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete team members"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. updated_at trigger (reuses existing handle_updated_at function) ---------
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Storage bucket for team photos (same policy shape as treatment-images) --
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-photos', 'team-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view team photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'team-photos');

CREATE POLICY "Admins can upload team photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'team-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update team photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'team-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete team photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'team-photos' AND public.has_role(auth.uid(), 'admin'));

-- 5. Seed the current 11 team members ---------------------------------------
-- display_order encodes the current site order (Dr. Khan first, then admin,
-- then the rest of clinical, then collaborators). Photo paths keep their
-- existing /team-photos/... values served from /public.

INSERT INTO public.team_members
  (name, title, category, photo_url, modal_photo_url, modal_aspect, bio,
   business, website, phone, email, address, display_order)
VALUES
  -- Clinical: Dr. Khan hoisted to the front
  ('Dr. Kamran Khan', 'Physician — MD, FRCA (UK), MScMEd', 'clinical',
   '/team-photos/Kamran%20Khan.jpg', NULL, NULL,
   jsonb_build_array('I completed my Anesthesiology and Pain Management specialist training at the University of Oxford in the UK in 2008, as a Fellow of the Royal College of Anaesthetists (FRCA). I have special interest and expertise in ultrasound and x-ray guided acute and chronic pain interventions. I am trained to provide a wide spectrum of pain management services for patients affected by neck, back, joint and a variety of other types of pain. I always take a biopsychosocial approach in providing comprehensive multidisciplinary care to our chronic pain patient population.'),
   NULL, NULL, NULL, NULL, NULL, 0),

  -- Administrative
  ('Sofia Kamran', 'Chief Administrative Officer', 'administrative',
   '/team-photos/sofia.jpg', NULL, NULL,
   jsonb_build_array('I''m the Chief Administrative Officer — keeping operations seamless, solving problems before they arise, and mastering the art of controlling chaos. Behind the scenes, I keep everything moving smoothly while quietly running the show.'),
   NULL, NULL, NULL, NULL, NULL, 1),

  ('Michaela Jenkins', 'Medical Office Assistant', 'administrative',
   '/team-photos/Michaela%20Jenkins.png', NULL, NULL,
   jsonb_build_array(
     'As a Medical Office Assistant, I am dedicated to ensuring a professional and seamless experience for every patient. I serve as the primary point of contact for the practice, managing patient greetings, scheduling, billing, and office communications.',
     'By coordinating the daily calendars for our doctors and nursing staff, I work to ensure that our clinic operates efficiently and that our patients receive the highest standard of administrative support.'),
   NULL, NULL, NULL, NULL, NULL, 2),

  -- Rest of clinical team
  ('Maria Khan, LPN', 'Pain Nurse', 'clinical',
   '/team-photos/Maria-newpic.jpg', NULL, NULL,
   jsonb_build_array('As a Licensed Practical Nurse with extensive experience in pain management, I provide patient-centered care from initial assessment through ongoing follow-up. I am skilled in conducting detailed intake evaluations and supporting physicians during interventional procedures. I am committed to improving patient outcomes through compassionate care and effective communication, always focusing on creating a comfortable and supportive clinical experience for every patient.'),
   NULL, NULL, NULL, NULL, NULL, 3),

  ('Erin Richard, LPN', 'Pain Nurse', 'clinical',
   '/team-photos/Erin%20Richard.jpg', NULL, NULL,
   jsonb_build_array('My name is Erin Richard, and I have practiced as an LPN for 37 years in various clinical settings. For the past few years, my focus has been on pain management and serving as a clinical instructor for the Practical Nursing program.'),
   NULL, NULL, NULL, NULL, NULL, 4),

  ('Kim MacDonald, LPN', 'Pain Nurse', 'clinical',
   '/team-photos/Kim%20Macdonald.jpg', NULL, NULL,
   jsonb_build_array(
     'I have been a nurse for 38 years, spending the majority of my career in the Operating Room. Currently, I work in pain management, where I am dedicated to helping patients who suffer from chronic pain.',
     'Outside of my professional life, I am a mother of two and truly enjoy life.'),
   NULL, NULL, NULL, NULL, NULL, 5),

  -- Collaborators
  ('Katie Beck', 'Clinical Exercise Physiologist (CSEP-CEP) & Professional Kinesiologist', 'collaborations',
   '/team-photos/Katie-beck.jpg', NULL, '852/1002',
   jsonb_build_array(
     'I''m Katie Beck, a Clinical Exercise Physiologist (CSEP-CEP) and Professional Kinesiologist based in Prince Edward Island. Through Beck Exercise Physiology Inc, my team and I provide free, evidence-based exercise support for Islanders living with chronic and complex medical conditions.',
     'Through virtual programming, we help people living with pain and other health conditions improve daily function and build confidence in movement. We believe movement should be collaborative — we don''t tell you how to move; we help you discover what works for you.',
     'Current free programs include chronic pain, diabetes, COPD, cancer, heart disease, osteoarthritis, and neurological conditions including MS, stroke, and Parkinson''s disease.'),
   'Beck Exercise Physiology Inc', 'https://www.beckexercisephysiology.ca', '902-367-0320', 'katie@beckexercisephysiology.ca', NULL, 6),

  ('Mandy Fraser', 'Physiotherapist & Registered Counselling Therapist', 'collaborations',
   '/team-photos/Mandy%20%20Fraser.jpg', NULL, '3/4',
   jsonb_build_array(
     'I am a native Islander and Physiotherapist practicing at Aspire Physio Wellness in Stratford, PEI. I completed my Degree in Physiotherapy at Queen''s University in 2002 and have more than 20 years of experience in physical rehabilitation, with a special focus on chronic pain management.',
     'In 2022, I completed my Master''s Degree in Counselling Psychology through Yorkville University. I now integrate physiotherapy and psychotherapy using a biopsychosocial approach to help individuals living with persistent pain improve function, quality of life, and participation in meaningful daily activities.',
     'I am a Registered Counselling Therapist with the College of Counselling Therapists of Prince Edward Island and a Certified Canadian Counsellor (CCC) with the Canadian Counselling and Psychotherapy Association. I am also pleased to collaborate with Dr. Khan and the team at Red Sands Pain Management to provide comprehensive interdisciplinary care for individuals experiencing chronic pain.'),
   'Aspire Physio | Wellness', 'https://www.aspirephysio.ca', '902-628-1991', NULL, NULL, 7),

  ('Alice Anand-Toner', 'Occupational Therapist & CRPS Expert', 'collaborations',
   '/team-photos/Alice2.jpg', '/team-photos/Alice%20Anand%20Toner.jpg', NULL,
   jsonb_build_array(
     'I completed my Master of Science in Occupational Therapy (MSc OT) at Dalhousie University in 2009 after earning a Bachelor of Science from Acadia University in 2006. I have experience working across inpatient, outpatient, community, and private practice settings, with a special interest in chronic pain, CRPS, and upper extremity rehabilitation. In 2024, I completed a Master of Clinical Science in Upper Extremity Rehabilitation through Western University.',
     'I am passionate about helping individuals achieve meaningful recovery goals through personalized rehabilitation, education, and support. I currently practice at Summerside Occupational Therapy and CBI Health.'),
   'Summerside Occupational Therapy', NULL, '902-786-6722', NULL, NULL, 8),

  ('Trevor Dunphy', 'Physiotherapist', 'collaborations',
   '/team-photos/Trevor-41.jpg', NULL, NULL,
   jsonb_build_array('I graduated from the University of Ottawa with a Master of Science in Physiotherapy. As a former varsity soccer player and avid runner, I understand how important movement is for staying healthy, active, and doing the things you love. I''m passionate about helping people of all ages recover from injury, achieve their goals, and get back to living confidently. I enjoy working with patients in both English and French, creating a comfortable and supportive experience for everyone.'),
   'PhysioFIX PEI', 'https://www.physiofixpei.ca', '902-901-5300', 'info@physiofixpei.ca', '75 John Joe Sark Dr, Stratford, PE C1B 4R3', 9),

  ('Marcel Macdonald', 'Physiotherapist & Partner', 'collaborations',
   '/team-photos/Marcel%20Macdonald.png', NULL, '1/1',
   jsonb_build_array(
     'I am a physiotherapist with a special interest in shoulder rehabilitation. After earning my Master of Science in Physiotherapy from Dalhousie University in 2008, I have continued to advance my expertise through extensive post-graduate education in the assessment and treatment of shoulder conditions.',
     'From 2019 to 2021, I developed a shoulder rehabilitation pilot program in partnership with the Workers Compensation Board of PEI, which resulted in significantly improved return-to-work outcomes for injured workers.',
     'My approach combines evidence-based care, patient education, therapeutic exercise, and manual therapy to help individuals reduce pain, restore function, and return to their daily activities with confidence. I am proud to work collaboratively with Dr. Khan and his team to provide comprehensive care for people experiencing shoulder pain and dysfunction.'),
   'Reactive Health & Wellness', 'https://www.reactivehealth.com', '902-370-7322', 'charlottetown@reactivehealth.com', '175 Shakespeare Drive, Stratford, PE C1B 4J7', 10);
