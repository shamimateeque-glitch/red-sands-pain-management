import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { teamSlug } from "@/data/team";
import type { TeamMember } from "@/types/team";

const CATEGORY_BADGE: Record<string, string> = {
  administrative: "Admin",
  clinical: "Clinical",
  collaborations: "Collaborator",
};

const Avatar = ({ member }: { member: TeamMember }) => {
  if (member.photo_url) {
    return (
      <img
        src={member.photo_url}
        alt={member.name}
        className="w-28 h-28 rounded-full object-cover object-top shadow-md ring-4 ring-white"
        loading="lazy"
      />
    );
  }
  return (
    <div className="w-28 h-28 rounded-full bg-primary/10 text-primary text-2xl font-semibold shadow-md ring-4 ring-white flex items-center justify-center">
      {member.initials ?? member.name.slice(0, 2).toUpperCase()}
    </div>
  );
};

const Card = ({ member }: { member: TeamMember }) => (
  <Link
    to={`/team#${teamSlug(member.name)}`}
    className="group flex flex-col items-center text-center bg-white border border-border/50 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 transition-all h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    aria-label={`View ${member.name}'s profile`}
  >
    <Avatar member={member} />
    <h4 className="mt-4 font-semibold text-maroon text-sm leading-tight group-hover:text-primary transition-colors">
      {member.name}
    </h4>
    <p className="text-xs text-muted-foreground mt-1 leading-snug">{member.title}</p>
    <span className="mt-3 inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium tracking-wide uppercase">
      {CATEGORY_BADGE[member.category] ?? member.category}
    </span>
  </Link>
);

const TeamSection = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);

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
    };

    fetchMembers();

    const channel = supabase
      .channel("team-section-changes")
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

  return (
    <section id="team" className="py-16 md:py-20 bg-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="w-12 h-1 bg-primary rounded-full mx-auto mb-4" />
          <h2 className="mb-3 text-maroon">Meet Our Team</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Physicians, nurse practitioners, pain nurses, and trusted PEI partners — working together for you.
          </p>
        </div>

        <Carousel
          opts={{ align: "start", dragFree: true }}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-3 md:-ml-4">
            {members.map((m) => (
              <CarouselItem
                key={m.id}
                className="pl-3 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <Card member={m} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </Carousel>

        <div className="text-center mt-10">
          <Button asChild size="lg" className="shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <Link to="/team" className="flex items-center gap-2">
              View Full Team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
