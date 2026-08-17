// Team data — edit this file to add/update team members.
// Photos live in /public/team-photos and are served from /team-photos/<filename>.
// (Folder is named team-photos rather than team to avoid conflict with the
// /team React Router route, which would otherwise be intercepted by Apache.)

/** URL-safe slug derived from a person's name. Used as anchor id on /team. */
export const teamSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export interface TeamMember {
  name: string;
  title: string;
  /** Path under /public, e.g. "/team-photos/sofia.jpg". Omit to fall back to initials. */
  photo?: string;
  /** Optional larger / different photo shown in the modal. Falls back to `photo`. */
  modalPhoto?: string;
  /** 2-letter initials used when no photo is available. */
  initials?: string;
  /** Single string or array of paragraphs. */
  bio?: string | string[];
  /**
   * Desktop aspect ratio for the modal photo column (e.g. "3/4", "4/5").
   * Default behavior stretches the photo to the full modal height, which can
   * over-crop a well-framed headshot — set this to lock the photo to its
   * natural aspect on desktop.
   */
  modalAspect?: string;
}

export interface Collaborator extends TeamMember {
  business: string;
  website?: string;
  phone?: string;
  email?: string;
  /** Optional postal/street address. Shown in the modal under the business. */
  address?: string;
}

export const adminTeam: TeamMember[] = [
  {
    name: "Sofia Kamran",
    title: "Chief Administrative Officer",
    photo: "/team-photos/sofia.jpg",
    bio: "I'm the Chief Administrative Officer — keeping operations seamless, solving problems before they arise, and mastering the art of controlling chaos. Behind the scenes, I keep everything moving smoothly while quietly running the show.",
  },
  {
    name: "Michaela Jenkins",
    title: "Medical Office Assistant",
    photo: "/team-photos/Michaela%20Jenkins.png",
    bio: [
      "As a Medical Office Assistant, I am dedicated to ensuring a professional and seamless experience for every patient. I serve as the primary point of contact for the practice, managing patient greetings, scheduling, billing, and office communications.",
      "By coordinating the daily calendars for our doctors and nursing staff, I work to ensure that our clinic operates efficiently and that our patients receive the highest standard of administrative support.",
    ],
  },
];

export const clinicalTeam: TeamMember[] = [
  {
    name: "Dr. Kamran Khan",
    title: "Physician — MD, FRCA (UK), MScMEd",
    photo: "/team-photos/Kamran%20Khan.jpg",
    bio: "I completed my Anesthesiology and Pain Management specialist training at the University of Oxford in the UK in 2008, as a Fellow of the Royal College of Anaesthetists (FRCA). I have special interest and expertise in ultrasound and x-ray guided acute and chronic pain interventions. I am trained to provide a wide spectrum of pain management services for patients affected by neck, back, joint and a variety of other types of pain. I always take a biopsychosocial approach in providing comprehensive multidisciplinary care to our chronic pain patient population.",
  },
  {
    name: "Maria Khan, LPN",
    title: "Pain Nurse",
    photo: "/team-photos/Maria-newpic.jpg",
    bio: "As a Licensed Practical Nurse with extensive experience in pain management, I provide patient-centered care from initial assessment through ongoing follow-up. I am skilled in conducting detailed intake evaluations and supporting physicians during interventional procedures. I am committed to improving patient outcomes through compassionate care and effective communication, always focusing on creating a comfortable and supportive clinical experience for every patient.",
  },
  {
    name: "Erin Richard, LPN",
    title: "Pain Nurse",
    photo: "/team-photos/Erin%20Richard.jpg",
    bio: "My name is Erin Richard, and I have practiced as an LPN for 37 years in various clinical settings. For the past few years, my focus has been on pain management and serving as a clinical instructor for the Practical Nursing program.",
  },
  {
    name: "Kim MacDonald, LPN",
    title: "Pain Nurse",
    photo: "/team-photos/Kim%20Macdonald.jpg",
    bio: [
      "I have been a nurse for 38 years, spending the majority of my career in the Operating Room. Currently, I work in pain management, where I am dedicated to helping patients who suffer from chronic pain.",
      "Outside of my professional life, I am a mother of two and truly enjoy life.",
    ],
  },
];

export const collaborators: Collaborator[] = [
  {
    name: "Katie Beck",
    title: "Clinical Exercise Physiologist (CSEP-CEP) & Professional Kinesiologist",
    business: "Beck Exercise Physiology Inc",
    photo: "/team-photos/Katie-beck.jpg",
    modalAspect: "852/1002",
    website: "https://www.beckexercisephysiology.ca",
    phone: "902-367-0320",
    email: "katie@beckexercisephysiology.ca",
    bio: [
      "I'm Katie Beck, a Clinical Exercise Physiologist (CSEP-CEP) and Professional Kinesiologist based in Prince Edward Island. Through Beck Exercise Physiology Inc, my team and I provide free, evidence-based exercise support for Islanders living with chronic and complex medical conditions.",
      "Through virtual programming, we help people living with pain and other health conditions improve daily function and build confidence in movement. We believe movement should be collaborative — we don't tell you how to move; we help you discover what works for you.",
      "Current free programs include chronic pain, diabetes, COPD, cancer, heart disease, osteoarthritis, and neurological conditions including MS, stroke, and Parkinson's disease.",
    ],
  },
  {
    name: "Mandy Fraser",
    title: "Physiotherapist & Registered Counselling Therapist",
    business: "Aspire Physio | Wellness",
    website: "https://www.aspirephysio.ca",
    phone: "902-628-1991",
    photo: "/team-photos/Mandy%20%20Fraser.jpg",
    modalAspect: "3/4",
    bio: [
      "I am a native Islander and Physiotherapist practicing at Aspire Physio Wellness in Stratford, PEI. I completed my Degree in Physiotherapy at Queen's University in 2002 and have more than 20 years of experience in physical rehabilitation, with a special focus on chronic pain management.",
      "In 2022, I completed my Master's Degree in Counselling Psychology through Yorkville University. I now integrate physiotherapy and psychotherapy using a biopsychosocial approach to help individuals living with persistent pain improve function, quality of life, and participation in meaningful daily activities.",
      "I am a Registered Counselling Therapist with the College of Counselling Therapists of Prince Edward Island and a Certified Canadian Counsellor (CCC) with the Canadian Counselling and Psychotherapy Association. I am also pleased to collaborate with Dr. Khan and the team at Red Sands Pain Management to provide comprehensive interdisciplinary care for individuals experiencing chronic pain.",
    ],
  },
  {
    name: "Alice Anand-Toner",
    title: "Occupational Therapist & CRPS Expert",
    business: "Summerside Occupational Therapy",
    phone: "902-786-6722",
    photo: "/team-photos/Alice2.jpg",
    modalPhoto: "/team-photos/Alice%20Anand%20Toner.jpg",
    bio: [
      "I completed my Master of Science in Occupational Therapy (MSc OT) at Dalhousie University in 2009 after earning a Bachelor of Science from Acadia University in 2006. I have experience working across inpatient, outpatient, community, and private practice settings, with a special interest in chronic pain, CRPS, and upper extremity rehabilitation. In 2024, I completed a Master of Clinical Science in Upper Extremity Rehabilitation through Western University.",
      "I am passionate about helping individuals achieve meaningful recovery goals through personalized rehabilitation, education, and support. I currently practice at Summerside Occupational Therapy and CBI Health.",
    ],
  },
  {
    name: "Trevor Dunphy",
    title: "Physiotherapist",
    business: "PhysioFIX PEI",
    address: "75 John Joe Sark Dr, Stratford, PE C1B 4R3",
    website: "https://www.physiofixpei.ca",
    phone: "902-901-5300",
    email: "info@physiofixpei.ca",
    photo: "/team-photos/Trevor-41.jpg",
    bio: "I graduated from the University of Ottawa with a Master of Science in Physiotherapy. As a former varsity soccer player and avid runner, I understand how important movement is for staying healthy, active, and doing the things you love. I'm passionate about helping people of all ages recover from injury, achieve their goals, and get back to living confidently. I enjoy working with patients in both English and French, creating a comfortable and supportive experience for everyone.",
  },
  {
    name: "Marcel Macdonald",
    title: "Physiotherapist & Partner",
    business: "Reactive Health & Wellness",
    address: "175 Shakespeare Drive, Stratford, PE C1B 4J7",
    website: "https://www.reactivehealth.com",
    phone: "902-370-7322",
    email: "charlottetown@reactivehealth.com",
    photo: "/team-photos/Marcel%20Macdonald.png",
    modalAspect: "1/1",
    bio: [
      "I am a physiotherapist with a special interest in shoulder rehabilitation. After earning my Master of Science in Physiotherapy from Dalhousie University in 2008, I have continued to advance my expertise through extensive post-graduate education in the assessment and treatment of shoulder conditions.",
      "From 2019 to 2021, I developed a shoulder rehabilitation pilot program in partnership with the Workers Compensation Board of PEI, which resulted in significantly improved return-to-work outcomes for injured workers.",
      "My approach combines evidence-based care, patient education, therapeutic exercise, and manual therapy to help individuals reduce pain, restore function, and return to their daily activities with confidence. I am proud to work collaboratively with Dr. Khan and his team to provide comprehensive care for people experiencing shoulder pain and dysfunction.",
    ],
  },
];
