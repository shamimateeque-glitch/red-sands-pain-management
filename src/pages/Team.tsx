import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ExternalLink, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { supabase } from "@/integrations/supabase/client";
import { teamSlug } from "@/data/team";
import { normalizeBio, type TeamMember } from "@/types/team";

/* ---------------- Types ---------------- */

type Filter = "All" | "Administrative" | "Clinical" | "Collaborations";

const FILTERS: Filter[] = ["All", "Administrative", "Clinical", "Collaborations"];

const CATEGORY_LABEL: Record<string, Filter> = {
  administrative: "Administrative",
  clinical: "Clinical",
  collaborations: "Collaborations",
};

const isCollab = (m: TeamMember) => m.category === "collaborations";

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
    {member.photo_url ? (
      <img
        src={member.photo_url}
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
  entry: TeamMember;
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
      {isCollab(entry) && entry.business && (
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
  entry: TeamMember | null;
  onClose: () => void;
}) => {
  const collab = entry && isCollab(entry) ? entry : null;
  const bios = entry ? normalizeBio(entry.bio) : [];

  return (
    <Dialog open={!!entry} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {entry && (
          <div className="grid md:grid-cols-[260px,1fr] gap-0">
            {/* Photo (prefer modal photo when provided) */}
            <div
              className={
                entry.modal_aspect
                  ? "bg-secondary/10 aspect-[4/5] md:aspect-auto"
                  : "bg-secondary/10 aspect-[4/5] md:aspect-auto md:h-full"
              }
              style={
                entry.modal_aspect
                  ? { aspectRatio: entry.modal_aspect.replace("/", " / ") }
                  : undefined
              }
            >
              {entry.modal_photo_url || entry.photo_url ? (
                <img
                  src={entry.modal_photo_url || entry.photo_url || undefined}
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
              {collab && collab.business && (
                <p className="text-sm text-muted-foreground mt-1.5">
                  {collab.business}
                </p>
              )}
              {collab && collab.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(collab.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-start gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors leading-snug"
                >
                  <MapPin className="h-3.5 w-3.5 mt-px flex-shrink-0" />
                  <span>{collab.address}</span>
                </a>
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
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("All");
  const [active, setActive] = useState<TeamMember | null>(null);
  const { hash } = useLocation();

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });

      if (!error && data) {
        setMembers(data as TeamMember[]);
      }
      setLoading(false);
    };

    fetchMembers();

    // Keep the page in sync with admin edits without a manual refresh.
    const channel = supabase
      .channel("team-members-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_members" },
        () => fetchMembers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Open modal from URL hash once members are loaded / hash changes.
  useEffect(() => {
    const slug = decodeURIComponent((hash || "").slice(1));
    if (!slug || members.length === 0) return;
    const found = members.find((m) => teamSlug(m.name) === slug);
    if (found) {
      setActive(found);
      setFilter("All");
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [hash, members]);

  const filtered = useMemo(
    () =>
      filter === "All"
        ? members
        : members.filter((m) => CATEGORY_LABEL[m.category] === filter),
    [filter, members],
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-secondary/10 pt-6 pb-10 md:pt-8 md:pb-14">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-12 h-1 bg-primary rounded-full mb-4 mx-auto" />
              <h1 className="mb-5 text-maroon">Our Team</h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                We have a multidisciplinary team of physicians, nurses, mental health counsellors,
                and trusted partners working collaboratively to support individuals living with
                chronic pain across Prince Edward Island.
              </p>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="py-14">
          <div className="container mx-auto px-4 max-w-7xl">
            <FilterPills active={filter} onChange={setFilter} />

            {loading ? (
              <p className="text-center text-muted-foreground py-12">Loading team…</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filtered.map((m) => (
                    <Card key={m.id} entry={m} onOpen={() => setActive(m)} />
                  ))}
                </div>

                {filtered.length === 0 && (
                  <p className="text-center text-muted-foreground py-12">
                    No members in this category.
                  </p>
                )}
              </>
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
