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
}

export interface Collaborator extends TeamMember {
  business: string;
  website?: string;
  phone?: string;
  email?: string;
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
    name: "Cathy Nabuurs",
    title: "Nurse Practitioner",
    photo: "/team-photos/Cathy%20Nabuurs.jpg",
    bio: [
      "I graduated from the Dalhousie University Family All Ages Nurse Practitioner Program in 2020 and began my career as an Orthopedic and Pain Management Nurse Practitioner. In 2022, I completed the NP Graduate Orthopedic Certificate through Duke University.",
      "I have experience treating a variety of orthopedic and pain-related conditions, including performing joint and soft tissue injections. My approach focuses on evidence-based care, patient education, and helping individuals improve their function and quality of life.",
      "Outside of work, I enjoy staying active, running, and spending quality time with my husband and two children.",
    ],
  },
  {
    name: "Maria Khan, LPN",
    title: "Pain Nurse",
    photo: "/team-photos/Maria.jpg",
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
  {
    name: "Katherine (Katie) Arsenault, RN",
    title: "Mental Health / Counselling Nurse",
    photo: "/team-photos/Katherine%20%28Katie%29%20Arsenault.jpeg",
    bio: [
      "My name is Katherine (Katie) Arsenault. I was born and raised on Prince Edward Island and recently returned home to be closer to my family.",
      "For the past 18 years, I have worked as a Registered Nurse in mental health in Moncton. I am passionate about fostering emotional resilience and supporting individuals living with chronic pain and the mental health challenges that often accompany it.",
      "I am excited to join the Red Sands Pain Management team and provide compassionate mental health support to patients while serving the PEI community I am proud to call home.",
    ],
  },
];

export const collaborators: Collaborator[] = [
  {
    name: "Katie Beck",
    title: "Clinical Exercise Physiologist (CSEP-CEP) & Professional Kinesiologist",
    business: "Beck Exercise Physiology Inc",
    photo: "/team-photos/Katie-beck.jpg",
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
    title: "Physiotherapist & Pain Counselor",
    business: "Aspire Physiology",
    website: "https://www.aspirephysio.ca",
    initials: "MF",
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
];
