import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import type { ServiceReview } from "@/types/review";

interface ReviewFormProps {
  review?: ServiceReview | null;
  onClose: () => void;
  onSave?: () => void;
}

interface TreatmentOption {
  id: string;
  title: string;
}

const ReviewForm = ({ review, onClose, onSave }: ReviewFormProps) => {
  const [loading, setLoading] = useState(false);
  const [treatments, setTreatments] = useState<TreatmentOption[]>([]);
  const [formData, setFormData] = useState({
    treatmentId: "",
    patientName: "",
    quote: "",
    isPublished: false,
  });

  // Load the service list for the dropdown.
  useEffect(() => {
    const fetchTreatments = async () => {
      const { data, error } = await supabase
        .from("treatments")
        .select("id, title")
        .order("title");

      if (error) {
        toast.error("Failed to load services");
      } else {
        setTreatments((data as TreatmentOption[]) || []);
      }
    };

    fetchTreatments();
  }, []);

  useEffect(() => {
    if (review) {
      setFormData({
        treatmentId: review.treatment_id,
        patientName: review.patient_name || "",
        quote: review.quote,
        isPublished: review.is_published,
      });
    }
  }, [review]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.treatmentId) {
      toast.error("Please choose which service this review is for.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Your session has expired. Please log out and log back in.");
        setLoading(false);
        return;
      }

      const reviewData = {
        treatment_id: formData.treatmentId,
        patient_name: formData.patientName.trim() || null,
        quote: formData.quote.trim(),
        is_published: formData.isPublished,
      };

      if (review) {
        const { data: updateResult, error } = await supabase
          .from("service_reviews")
          .update(reviewData)
          .eq("id", review.id)
          .select();

        if (error) throw error;
        if (!updateResult || updateResult.length === 0) {
          throw new Error(
            "Update failed: no rows were modified. Your session may have expired — please log out and log back in."
          );
        }
        toast.success("Review updated successfully");
      } else {
        const { data: insertResult, error } = await supabase
          .from("service_reviews")
          .insert([reviewData])
          .select();

        if (error) throw error;
        if (!insertResult || insertResult.length === 0) {
          throw new Error(
            "Create failed: review was not saved. Your session may have expired — please log out and log back in."
          );
        }
        toast.success("Review added successfully");
      }

      onSave?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>{review ? "Edit Review" : "Add Review"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="treatmentId">Service this review is for</Label>
            <Select
              value={formData.treatmentId}
              onValueChange={(value) => setFormData({ ...formData, treatmentId: value })}
            >
              <SelectTrigger id="treatmentId">
                <SelectValue placeholder="Choose a service..." />
              </SelectTrigger>
              <SelectContent>
                {treatments.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The review appears on this service's page only.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote">Review</Label>
            <Textarea
              id="quote"
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              rows={7}
              placeholder="The patient's own words..."
              required
            />
            <p className="text-xs text-muted-foreground">
              Press Enter to start a new line — each line shows as its own paragraph.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientName">Patient name (as shown on the site)</Label>
            <Input
              id="patientName"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              placeholder="e.g. Robin C."
            />
            <p className="text-xs text-muted-foreground">
              First name + last initial is recommended for privacy. Leave blank to show
              "Verified Patient".
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg border border-border/60 bg-muted/20">
            <Switch
              id="isPublished"
              checked={formData.isPublished}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPublished: checked })
              }
            />
            <div className="space-y-1">
              <Label htmlFor="isPublished" className="cursor-pointer">
                Published
              </Label>
              <p className="text-xs text-muted-foreground">
                When off, the review is saved as a draft and is not visible to visitors.
                Make sure you have the patient's consent before publishing.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : review ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
