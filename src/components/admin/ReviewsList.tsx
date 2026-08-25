import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pencil, Trash2, GripVertical, Quote } from "lucide-react";
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
import type { ServiceReview } from "@/types/review";

interface ReviewsListProps {
  onEdit: (review: ServiceReview) => void;
}

const ReviewsList = ({ onEdit }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("service_reviews")
      .select("*, treatments(title)")
      .order("display_order", { nullsFirst: false });

    if (error) {
      toast.error("Failed to load reviews");
    } else {
      setReviews((data as unknown as ServiceReview[]) || []);
    }
    setLoading(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = reviews.findIndex((r) => r.id === active.id);
    const newIndex = reviews.findIndex((r) => r.id === over.id);

    const newReviews = arrayMove(reviews, oldIndex, newIndex);
    setReviews(newReviews);

    for (let i = 0; i < newReviews.length; i++) {
      const { error } = await supabase
        .from("service_reviews")
        .update({ display_order: i })
        .eq("id", newReviews[i].id);

      if (error) {
        toast.error("Failed to update order");
        fetchReviews();
        return;
      }
    }

    toast.success("Order updated successfully");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    const { error } = await supabase.from("service_reviews").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete review");
    } else {
      toast.success("Review deleted successfully");
      fetchReviews();
    }
  };

  const togglePublished = async (review: ServiceReview) => {
    const next = !review.is_published;
    const { error } = await supabase
      .from("service_reviews")
      .update({ is_published: next })
      .eq("id", review.id);

    if (error) {
      toast.error("Failed to update review");
    } else {
      toast.success(next ? "Review published" : "Review unpublished");
      fetchReviews();
    }
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No reviews yet. Click "Add Review" to create one.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={reviews.map((r) => r.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {reviews.map((review) => (
            <SortableItem
              key={review.id}
              review={review}
              onEdit={onEdit}
              onDelete={handleDelete}
              onTogglePublished={togglePublished}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

interface SortableItemProps {
  review: ServiceReview;
  onEdit: (review: ServiceReview) => void;
  onDelete: (id: string) => void;
  onTogglePublished: (review: ServiceReview) => void;
}

const SortableItem = ({
  review,
  onEdit,
  onDelete,
  onTogglePublished,
}: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: review.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className={isDragging ? "opacity-50" : ""}>
      <CardContent className="flex items-start gap-4 p-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none pt-1"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <Quote className="h-5 w-5 text-primary/40 shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold">
              {review.patient_name?.trim() || "Verified Patient"}
            </h3>
            <Badge
              variant={review.is_published ? "default" : "secondary"}
              className="shrink-0 text-xs"
            >
              {review.is_published ? "Published" : "Draft"}
            </Badge>
            {review.treatments?.title && (
              <span className="text-xs text-muted-foreground truncate">
                {review.treatments.title}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 italic">
            "{review.quote}"
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => onTogglePublished(review)}>
            {review.is_published ? "Unpublish" : "Publish"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(review)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(review.id)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewsList;
