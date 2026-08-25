import { ExternalLink, BookOpen } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

/* ---------------- Data ---------------- */

interface Resource {
  title: string;
  url: string;
  /** Clean text shown for the link. */
  display: string;
}

const RESOURCES: Resource[] = [
  {
    title: "Power Over Pain Portal",
    url: "https://www.poweroverpain.ca",
    display: "poweroverpain.ca",
  },
  {
    title: "Pain Revolution",
    url: "https://www.painrevolution.org",
    display: "painrevolution.org",
  },
  {
    title: "Dr. Andrea Furlan, Pain Resources",
    url: "https://www.doctorandreafurlan.com",
    display: "doctorandreafurlan.com",
  },
  {
    title: "Beck Exercise Physiology Inc",
    url: "https://www.beckexercisephysiology.com",
    display: "www.beckexercisephysiology.com",
  },
  {
    title: "Pain BC",
    url: "https://liveplanbeplus.ca",
    display: "liveplanbeplus.ca",
  },
  {
    title: "Pain Canada — Empowered Relief",
    url: "https://www.paincanada.ca/resources/empowered-relief",
    display: "paincanada.ca/resources/empowered-relief",
  },
];

/* ---------------- Card ---------------- */

const ResourceCard = ({ resource }: { resource: Resource }) => (
  <a
    href={resource.url}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-start gap-4 bg-white border border-border/40 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    aria-label={`Open ${resource.title} in a new tab`}
  >
    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
      <BookOpen className="h-5 w-5 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-maroon text-lg leading-tight group-hover:text-primary transition-colors">
        {resource.title}
      </h3>
      <span className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-primary/80 break-all">
        {resource.display}
        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
      </span>
    </div>
  </a>
);

/* ---------------- Page ---------------- */

const Resources = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-secondary/10 pt-6 pb-10 md:pt-8 md:pb-14">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-12 h-1 bg-primary rounded-full mb-4 mx-auto" />
              <h1 className="mb-5 text-maroon">Resources</h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Pain management is more than medications and procedures—it's a multidisciplinary
                and holistic approach. Explore trusted online resources to better understand pain,
                discover different management strategies, and take an active role in your journey
                toward improved well-being.
              </p>
            </div>
          </div>
        </section>

        {/* Resource list */}
        <section className="py-14">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="mb-8 text-center">
              <h2 className="text-maroon mb-2">Online Pain Resources for Patients</h2>
              <p className="text-sm text-muted-foreground">
                These links open in a new tab. Red Sands Pain Management is not responsible for
                the content of external websites.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {RESOURCES.map((resource) => (
                <ResourceCard key={resource.url} resource={resource} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Resources;
