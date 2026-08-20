import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TeamMember } from "@/types/team";

const CATEGORY_LABEL: Record<string, string> = {
  administrative: "Administrative",
  clinical: "Clinical",
  collaborations: "Collaborations",
};

interface TeamListProps {
  onEdit: (member: TeamMember) => void;
}

const TeamList = ({ onEdit }: TeamListProps) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchMembers();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("display_order", { nullsFirst: false })
      .order("name");

    if (error) {
      toast.error("Failed to load team members");
    } else {
      setMembers((data as TeamMember[]) || []);
    }
    setLoading(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = members.findIndex((m) => m.id === active.id);
    const newIndex = members.findIndex((m) => m.id === over.id);

    const newMembers = arrayMove(members, oldIndex, newIndex);
    setMembers(newMembers);

    // Persist the new display_order for every row.
    for (let i = 0; i < newMembers.length; i++) {
      const { error } = await supabase
        .from("team_members")
        .update({ display_order: i })
        .eq("id", newMembers[i].id);

      if (error) {
        toast.error("Failed to update order");
        fetchMembers(); // Revert on error
        return;
      }
    }

    toast.success("Order updated successfully");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    const { error } = await supabase.from("team_members").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete team member");
    } else {
      toast.success("Team member deleted successfully");
      fetchMembers();
    }
  };

  const filteredMembers = members.filter((m) =>
    activeTab === "all" ? true : m.category === activeTab
  );

  const countFor = (category: string) =>
    members.filter((m) => m.category === category).length;

  if (loading) {
    return <div>Loading team members...</div>;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">All ({members.length})</TabsTrigger>
        <TabsTrigger value="administrative">
          Administrative ({countFor("administrative")})
        </TabsTrigger>
        <TabsTrigger value="clinical">Clinical ({countFor("clinical")})</TabsTrigger>
        <TabsTrigger value="collaborations">
          Collaborations ({countFor("collaborations")})
        </TabsTrigger>
      </TabsList>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredMembers.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <SortableItem
                key={member.id}
                member={member}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {filteredMembers.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No team members in this category yet.
        </p>
      )}
    </Tabs>
  );
};

interface SortableItemProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
}

const SortableItem = ({ member, onEdit, onDelete }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className={isDragging ? "opacity-50" : ""}>
      <CardContent className="flex items-center gap-4 p-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt={member.name}
            className="w-12 h-12 rounded-full object-cover object-top shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center shrink-0">
            {member.initials ?? member.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg truncate">{member.name}</h3>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {CATEGORY_LABEL[member.category] ?? member.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{member.title}</p>
          {member.business && (
            <p className="text-xs text-primary/70 mt-0.5 truncate">{member.business}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => onEdit(member)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(member.id)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamList;
