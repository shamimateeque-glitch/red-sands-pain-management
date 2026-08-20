import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import FileDropzone from "./FileDropzone";
import { normalizeBio, type TeamMember } from "@/types/team";

interface TeamFormProps {
  member?: TeamMember | null;
  onClose: () => void;
  onSave?: () => void;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const TeamForm = ({ member, onClose, onSave }: TeamFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    category: "clinical",
    bio: "",
    initials: "",
    modalAspect: "",
    business: "",
    website: "",
    phone: "",
    email: "",
    address: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [modalPhotoFile, setModalPhotoFile] = useState<File | null>(null);
  const [modalPhotoPreview, setModalPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        title: member.title,
        category: member.category || "clinical",
        // Join stored paragraphs back into a blank-line-separated textarea.
        bio: normalizeBio(member.bio).join("\n\n"),
        initials: member.initials || "",
        modalAspect: member.modal_aspect || "",
        business: member.business || "",
        website: member.website || "",
        phone: member.phone || "",
        email: member.email || "",
        address: member.address || "",
      });
      if (member.photo_url) setPhotoPreview(member.photo_url);
      if (member.modal_photo_url) setModalPhotoPreview(member.modal_photo_url);
    }
  }, [member]);

  // Revoke object URLs created for local previews.
  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);
  useEffect(() => {
    return () => {
      if (modalPhotoPreview && modalPhotoPreview.startsWith("blob:"))
        URL.revokeObjectURL(modalPhotoPreview);
    };
  }, [modalPhotoPreview]);

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from("team-photos")
      .upload(path, file, { upsert: true });

    if (error) throw error;
    if (!data || !data.path) {
      throw new Error("Photo upload failed: no confirmation received from storage.");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("team-photos").getPublicUrl(data.path);

    return publicUrl;
  };

  const isCollab = formData.category === "collaborations";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify session is still valid before uploading.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Your session has expired. Please log out and log back in.");
        setLoading(false);
        return;
      }

      const slug = slugify(formData.name) || "member";

      let photoUrl = member?.photo_url ?? null;
      let modalPhotoUrl = member?.modal_photo_url ?? null;

      // Main photo: upload new file, or clear if the preview was removed.
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        photoUrl = await uploadFile(photoFile, `${slug}-${Date.now()}.${ext}`);
      } else if (photoPreview === null) {
        photoUrl = null;
      }

      // Modal photo (optional).
      if (modalPhotoFile) {
        const ext = modalPhotoFile.name.split(".").pop();
        modalPhotoUrl = await uploadFile(modalPhotoFile, `${slug}-modal-${Date.now()}.${ext}`);
      } else if (modalPhotoPreview === null) {
        modalPhotoUrl = null;
      }

      // Split the bio textarea into paragraphs on blank lines.
      const bioArray = formData.bio
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const memberData = {
        name: formData.name,
        title: formData.title,
        category: formData.category,
        bio: bioArray,
        initials: formData.initials || null,
        modal_aspect: formData.modalAspect || null,
        photo_url: photoUrl,
        modal_photo_url: modalPhotoUrl,
        business: isCollab ? formData.business || null : null,
        website: isCollab ? formData.website || null : null,
        phone: isCollab ? formData.phone || null : null,
        email: isCollab ? formData.email || null : null,
        address: isCollab ? formData.address || null : null,
      };

      if (member) {
        const { data: updateResult, error } = await supabase
          .from("team_members")
          .update(memberData)
          .eq("id", member.id)
          .select();

        if (error) throw error;
        if (!updateResult || updateResult.length === 0) {
          throw new Error(
            "Update failed: no rows were modified. Your session may have expired — please log out and log back in."
          );
        }
        toast.success("Team member updated successfully");
      } else {
        const { data: insertResult, error } = await supabase
          .from("team_members")
          .insert([memberData])
          .select();

        if (error) throw error;
        if (!insertResult || insertResult.length === 0) {
          throw new Error(
            "Create failed: team member was not saved. Your session may have expired — please log out and log back in."
          );
        }
        toast.success("Team member added successfully");
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
          <CardTitle>{member ? "Edit Team Member" : "Add Team Member"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Jane Smith"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title / Role</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Pain Nurse"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administrative">Administrative</SelectItem>
                <SelectItem value="clinical">Clinical</SelectItem>
                <SelectItem value="collaborations">Collaborations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biography</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={8}
              placeholder="Write the biography here. Separate paragraphs with a blank line."
            />
            <p className="text-xs text-muted-foreground">
              Separate paragraphs with a blank line — each becomes its own paragraph on the site.
            </p>
          </div>

          <FileDropzone
            label="Photo"
            accept="image/*"
            file={photoFile}
            onFileChange={(file) => {
              setPhotoFile(file);
              setPhotoPreview(file ? URL.createObjectURL(file) : null);
            }}
            currentFileUrl={member?.photo_url || undefined}
            preview={photoPreview}
          />

          <FileDropzone
            label="Modal Photo (optional — larger image shown in the popup)"
            accept="image/*"
            file={modalPhotoFile}
            onFileChange={(file) => {
              setModalPhotoFile(file);
              setModalPhotoPreview(file ? URL.createObjectURL(file) : null);
            }}
            currentFileUrl={member?.modal_photo_url || undefined}
            preview={modalPhotoPreview}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initials">Initials (optional)</Label>
              <Input
                id="initials"
                value={formData.initials}
                onChange={(e) => setFormData({ ...formData, initials: e.target.value })}
                placeholder="Shown when no photo is set, e.g. JS"
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modalAspect">Modal Photo Aspect (optional)</Label>
              <Input
                id="modalAspect"
                value={formData.modalAspect}
                onChange={(e) => setFormData({ ...formData, modalAspect: e.target.value })}
                placeholder='e.g. "3/4" or "1/1"'
              />
              <p className="text-xs text-muted-foreground">
                Locks the popup photo to a ratio so a headshot isn't over-cropped.
              </p>
            </div>
          </div>

          {isCollab && (
            <div className="space-y-4 p-4 rounded-lg border border-border/60 bg-muted/20">
              <Label className="text-sm font-semibold">Collaborator details</Label>
              <div className="space-y-2">
                <Label htmlFor="business">Business / Clinic name</Label>
                <Input
                  id="business"
                  value={formData.business}
                  onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                  placeholder="e.g. Aspire Physio | Wellness"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="902-555-1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, City, PE"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : member ? "Update" : "Create"}
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

export default TeamForm;
