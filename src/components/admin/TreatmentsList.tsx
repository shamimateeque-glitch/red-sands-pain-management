import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Pencil, Trash2, GripVertical, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface Treatment {
  id: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  icon: string;
  pdf_url: string | null;
  image_url: string | null;
  display_order: number | null;
  service_type: string;
  external_url: string | null;
  created_at: string;
  updated_at: string;
}

interface TreatmentsListProps {
  onEdit: (treatment: Treatment) => void;
}

const TreatmentsList = ({ onEdit }: TreatmentsListProps) => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchTreatments();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchTreatments = async () => {
    const { data, error } = await supabase
      .from("treatments")
      .select("*")
      .order("display_order", { nullsFirst: false })
      .order("title");

    if (error) {
      toast.error("Failed to load treatments");
    } else {
      setTreatments((data as Treatment[]) || []);
    }
    setLoading(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = treatments.findIndex((t) => t.id === active.id);
    const newIndex = treatments.findIndex((t) => t.id === over.id);

    const newTreatments = arrayMove(treatments, oldIndex, newIndex);
    setTreatments(newTreatments);

    // Update display_order for all treatments
    for (let i = 0; i < newTreatments.length; i++) {
      const { error } = await supabase
        .from("treatments")
        .update({ display_order: i } as any)
        .eq("id", newTreatments[i].id);

      if (error) {
        toast.error("Failed to update order");
        fetchTreatments(); // Revert on error
        return;
      }
    }
    
    toast.success("Order updated successfully");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this treatment?")) return;

    const { error } = await supabase
      .from("treatments")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete treatment");
    } else {
      toast.success("Treatment deleted successfully");
      fetchTreatments();
    }
  };

  const filteredTreatments = treatments.filter((t) => {
    if (activeTab === "all") return true;
    if (activeTab === "covered") return t.service_type === "covered";
    if (activeTab === "private_pay") return t.service_type === "private_pay";
    if (activeTab === "general_information") return t.service_type === "general_information";
    return true;
  });

  if (loading) {
    return <div>Loading treatments...</div>;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">All ({treatments.length})</TabsTrigger>
        <TabsTrigger value="covered">
          Covered ({treatments.filter((t) => t.service_type === "covered").length})
        </TabsTrigger>
        <TabsTrigger value="private_pay">
          Private Pay ({treatments.filter((t) => t.service_type === "private_pay").length})
        </TabsTrigger>
        <TabsTrigger value="general_information">
          General Info ({treatments.filter((t) => t.service_type === "general_information").length})
        </TabsTrigger>
      </TabsList>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredTreatments.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {filteredTreatments.map((treatment) => (
              <SortableItem
                key={treatment.id}
                treatment={treatment}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </Tabs>
  );
};

interface SortableItemProps {
  treatment: Treatment;
  onEdit: (treatment: Treatment) => void;
  onDelete: (id: string) => void;
}

const SortableItem = ({ treatment, onEdit, onDelete }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: treatment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-50" : ""}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{treatment.title}</h3>
            {treatment.external_url && (
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <Badge
              variant={treatment.service_type === "covered" ? "outline" : "secondary"}
              className={`shrink-0 text-xs ${
                treatment.service_type === "private_pay"
                  ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                  : treatment.service_type === "general_information"
                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                  : ""
              }`}
            >
              {treatment.service_type === "private_pay"
                ? "Private Pay"
                : treatment.service_type === "general_information"
                ? "General Info"
                : "Covered"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {treatment.description}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(treatment)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(treatment.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreatmentsList;
