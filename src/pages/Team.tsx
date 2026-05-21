import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ExternalLink, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import {
  adminTeam,
  clinicalTeam,
  collaborators,
  teamSlug,
  type TeamMember,
  type Collaborator,
} from "@/data/team";

/* ---------------- Types ---------------- */

type Group = "Administrative" | "Clinical" | "Collaborations";
type Filter = "All" | Group;
type Entry = (TeamMember | Collaborator) & { group: Group };

const ALL_MEMBERS: Entry[] = [
  ...adminTeam.map((m) => ({ ...m, group: "Administrative" as Group })),
  ...clinicalTeam.map((m) => ({ ...m, group: "Clinical" as Group })),
  ...collaborators.map((m) => ({ ...m, group: "Collaborations" as Group })),
];

const FILTERS: Filter[] = ["All", "Administrative", "Clinical", "Collaborations"];

const isCollab = (m: TeamMember | Collaborator): m is Collaborator =>
  "business" in m;

/* ---------------- Reveal-on-scroll ---------------- */

const RevealOnScroll = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

/* ---------------- Photo / Initials ---------------- */

const InitialsBlock = ({ member }: { member: TeamMember }) => (
  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
    <span className="text-primary text-5xl font-semibold tracking-wide">
      {member.initials ?? member.name.slice(0, 2).toUpperCase()}
    </span>
  </div>
);

const CardPhoto = ({ member }: { member: TeamMember }) => (
  <div className="aspect-[4/5] overflow-hidden bg-secondary/10">
    {member.photo ? (
      <img
        src={member.photo}
        alt={member.name}
        className="w-full h-full object-cover object-top group-hover:scale-[1.04] transition-transform duration-500"
        loading="lazy"
      />
    ) : (
      <InitialsBlock member={member} />
    )}
  </div>
);

/* ---------------- Card ---------------- */

const Card = ({
  entry,
  onOpen,
}: {
  entry: Entry;
  onOpen: () => void;
}) => (
  <button
    type="button"
    onClick={onOpen}
    className="group block w-full text-left bg-white border border-border/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    aria-label={`View ${entry.name}'s profile`}
  >
    <CardPhoto member={entry} />
    <div className="p-5">
      <h3 className="font-bold text-maroon text-lg leading-tight group-hover:text-primary transition-colors">
        {entry.name}
      </h3>
      <p className="text-sm text-muted-foreground mt-1.5 leading-snug">
        {entry.title}
      </p>
      {isCollab(entry) && (
        <p className="text-xs text-primary/70 mt-1.5 font-medium">{entry.business}</p>
      )}
    </div>
  </button>
);

/* ---------------- Filter Pills ---------------- */

const FilterPills = ({
  active,
  onChange,
}: {
  active: Filter;
  onChange: (f: Filter) => void;
}) => (
  <div className="flex flex-wrap gap-2.5 mb-10">
    {FILTERS.map((f) => {
      const isActive = active === f;
      return (
        <button
          key={f}
          type="button"
          onClick={() => onChange(f)}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            isActive
              ? "bg-primary text-white shadow-md"
              : "bg-white border border-border text-foreground hover:border-primary/40 hover:text-primary"
          }`}
          aria-pressed={isActive}
        >
          {f}
        </button>
      );
    })}
  </div>
);

/* ---------------- Member Dialog ---------------- */

const MemberDialog = ({
  entry,
  onClose,
}: {
  entry: Entry | null;
  onClose: () => void;
}) => {
  const collab = entry && isCollab(entry) ? entry : null;
  const bios = entry?.bio
    ? Array.isArray(entry.bio)
      ? entry.bio
      : [entry.bio]
    : [];

  return (
    <Dialog open={!!entry} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {entry && (
          <div className="grid md:grid-cols-[260px,1fr] gap-0">
            {/* Photo (prefer modalPhoto when provided) */}
            <div className="bg-secondary/10 aspect-[4/5] md:aspect-auto md:h-full">
              {entry.modalPhoto || entry.photo ? (
                <img
                  src={entry.modalPhoto || entry.photo}
                  alt={entry.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <InitialsBlock member={entry} />
              )}
            </div>

            {/* Body */}
            <div className="p-6 md:p-8 flex flex-col">
              <DialogTitle className="text-maroon text-2xl font-bold leading-tight mb-1">
                {entry.name}
              </DialogTitle>
              <p className="text-primary text-xs uppercase tracking-widest font-semibold">
                {entry.title}
              </p>
              {collab && (
                <p className="text-sm text-muted-foreground mt-1.5">
                  {collab.business}
                </p>
              )}

              {bios.length > 0 && (
                <div className="mt-5 space-y-3 text-sm leading-relaxed text-foreground/80">
                  {bios.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}

              {!bios.length && (
                <p className="mt-5 text-sm text-muted-foreground italic">
                  Biography coming soon.
                </p>
              )}

              {collab && (collab.website || collab.phone || collab.email) && (
                <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-border/50">
                  {collab.website && (
                    <Button asChild size="sm">
                      <a
                        href={collab.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Website
                      </a>
                    </Button>
                  )}
                  {collab.phone && (
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={`tel:${collab.phone.replace(/[^0-9+]/g, "")}`}
                        className="flex items-center gap-1.5"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {collab.phone}
                      </a>
                    </Button>
                  )}
                  {collab.email && (
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={`mailto:${collab.email}`}
                        className="flex items-center gap-1.5"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ---------------- Page ---------------- */

const Team = () => {
  const [filter, setFilter] = useState<Filter>("All");
  const [active, setActive] = useState<Entry | null>(null);
  const { hash } = useLocation();

  // Open modal from URL hash on mount / hash change
  useEffect(() => {
    const slug = decodeURIComponent((hash || "").slice(1));
    if (!slug) return;
    const found = ALL_MEMBERS.find((m) => teamSlug(m.name) === slug);
    if (found) {
      setActive(found);
      // Make sure the filter doesn't hide the source card behind the modal
      setFilter("All");
    }
  }, [hash]);

  const filtered = useMemo(
    () => (filter === "All" ? ALL_MEMBERS : ALL_MEMBERS.filter((m) => m.group === filter)),
    [filter],
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-secondary/10 pt-6 pb-10 md:pt-8 md:pb-14">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center max-w-6xl mx-auto">
              {/* Text */}
              <div className="order-2 md:order-1">
                <div className="w-12 h-1 bg-primary rounded-full mb-4" />
                <h1 className="mb-5 text-maroon">Our Team</h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  We have a multidisciplinary team of physicians, nurses, mental health counsellors,
                  and trusted partners working collaboratively to support individuals living with
                  chronic pain across Prince Edward Island.
                </p>
              </div>

              {/* Office photo */}
              <div className="order-1 md:order-2 relative max-w-md mx-auto md:max-w-none md:mx-0">
                <div className="absolute -left-3 top-3 bottom-3 w-1.5 bg-primary rounded-full hidden md:block" />
                <div className="absolute -bottom-3 -left-3 w-full h-full rounded-xl bg-primary/10 hidden md:block" />
                <img
                  src="/team/office-reception.png"
                  alt="Red Sands Pain Management reception"
                  className="rounded-xl shadow-2xl w-full relative z-10 aspect-[3/2] object-cover max-h-[360px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="py-14">
          <div className="container mx-auto px-4 max-w-7xl">
            <FilterPills active={filter} onChange={setFilter} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((m, i) => (
                <RevealOnScroll key={m.name} delay={(i % 4) * 80}>
                  <Card entry={m} onOpen={() => setActive(m)} />
                </RevealOnScroll>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                No members in this category.
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
      <MemberDialog entry={active} onClose={() => setActive(null)} />
    </div>
  );
};

export default Team;
