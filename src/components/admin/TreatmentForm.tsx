import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Eye, Sparkles } from "lucide-react";
import IconPicker from "./IconPicker";
import FileDropzone from "./FileDropzone";
import RichTextEditor from "./RichTextEditor";

type StylePreset = 'modern' | 'minimalist' | 'colorful' | 'realistic';

interface TreatmentFormProps {
  treatment?: any;
  onClose: () => void;
  onSave?: () => void;
}

const TreatmentForm = ({ treatment, onClose, onSave }: TreatmentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [generatingIcon, setGeneratingIcon] = useState(false);
  const [stylePreset, setStylePreset] = useState<StylePreset>('modern');
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    icon: "",
    iconBackground: "white",
    serviceType: "covered",
    externalUrl: "",
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (treatment) {
      setFormData({
        title: treatment.title,
        slug: treatment.slug,
        description: treatment.description,
        content: treatment.content,
        icon: treatment.icon,
        iconBackground: treatment.icon_background || "white",
        serviceType: treatment.service_type || "covered",
        externalUrl: treatment.external_url || "",
      });
      if (treatment.image_url) {
        setImagePreview(treatment.image_url);
      }
    }
  }, [treatment]);

  useEffect(() => {
    return () => {
      if (imagePreview && !imagePreview.startsWith('http')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) throw error;
    if (!data || !data.path) {
      throw new Error(`File upload to ${bucket} failed: no confirmation received from storage.`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const uploadBase64Image = async (base64Data: string, fileName: string) => {
    // Convert base64 to blob with proper PNG handling
    const base64String = base64Data.split(',')[1];
    const mimeType = base64Data.split(',')[0].match(/:(.*?);/)?.[1] || 'image/png';
    
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    // Ensure filename has .png extension
    const pngFileName = fileName.endsWith('.png') ? fileName : fileName.replace(/\.[^.]+$/, '.png');
    const file = new File([blob], pngFileName, { type: 'image/png' });
    
    const { data, error } = await supabase.storage
      .from("treatment-images")
      .upload(pngFileName, file, { upsert: true });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from("treatment-images")
      .getPublicUrl(pngFileName);
    
    return publicUrl;
  };

  const handleGenerateIcon = async () => {
    if (!formData.title) {
      toast.error("Please enter a treatment title first");
      return;
    }

    setGeneratingIcon(true);
    const toastId = toast.loading(`Generating AI icon for ${formData.title}...`);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-treatment-icon', {
        body: {
          title: formData.title,
          description: formData.description,
          style: stylePreset
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Upload the generated image to storage
      const fileName = `${formData.slug || generateSlug(formData.title)}-ai-icon-${Date.now()}.png`;
      const imageUrl = await uploadBase64Image(data.imageData, fileName);
      
      setImagePreview(imageUrl);
      toast.success("AI icon generated successfully!", { id: toastId });
    } catch (error: any) {
      console.error('Error generating icon:', error);
      toast.error(error.message || "Failed to generate icon", { id: toastId });
    } finally {
      setGeneratingIcon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify session is still valid before uploading
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Your session has expired. Please log out and log back in.");
        setLoading(false);
        return;
      }

      let pdfUrl = treatment?.pdf_url;
      let imageUrl = treatment?.image_url;
      let svgUrl = treatment?.icon_svg_url;

      // Upload PDF if provided
      if (pdfFile) {
        const fileName = `${formData.slug}-${Date.now()}.pdf`;
        pdfUrl = await uploadFile(pdfFile, "treatment-pdfs", fileName);
      }

      // Handle image removal - if imagePreview is null and no new file, clear the image_url
      if (imagePreview === null && !imageFile) {
        imageUrl = null;
      }

      if (svgFile) {
        const fileName = `${formData.slug}-icon-${Date.now()}.svg`;
        svgUrl = await uploadFile(svgFile, "treatment-images", fileName);
      }

      if (imageFile) {
        const fileName = `${formData.slug}-${Date.now()}.${imageFile.name.split('.').pop()}`;
        imageUrl = await uploadFile(imageFile, "treatment-images", fileName);
      } else if (imagePreview && imagePreview !== treatment?.image_url) {
        // If we have a preview that's different from the original, it's an AI-generated image
        imageUrl = imagePreview;
      }

      const treatmentData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        content: formData.content,
        icon: formData.icon,
        pdf_url: pdfUrl,
        image_url: imageUrl,
        icon_svg_url: svgUrl,
        icon_background: formData.iconBackground,
        service_type: formData.serviceType,
        external_url: formData.externalUrl || null,
      };

      if (treatment) {
        const { data: updateResult, error } = await supabase
          .from("treatments")
          .update(treatmentData)
          .eq("id", treatment.id)
          .select();

        if (error) throw error;
        if (!updateResult || updateResult.length === 0) {
          throw new Error("Update failed: no rows were modified. Your session may have expired — please log out and log back in.");
        }
        const message = svgFile
          ? "Treatment updated successfully with custom SVG icon!"
          : "Treatment updated successfully";
        toast.success(message);
      } else {
        const { data: insertResult, error } = await supabase
          .from("treatments")
          .insert([treatmentData])
          .select();

        if (error) throw error;
        if (!insertResult || insertResult.length === 0) {
          throw new Error("Create failed: treatment was not saved. Your session may have expired — please log out and log back in.");
        }
        const message = svgFile
          ? "Treatment created successfully with custom SVG icon!"
          : "Treatment created successfully";
        toast.success(message);
      }

      // Notify parent so it can refresh the list with the latest data
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
          <CardTitle>
            {treatment ? "Edit Treatment" : "Add New Treatment"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type</Label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
            >
              <SelectTrigger id="serviceType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="covered">Covered Service</SelectItem>
                <SelectItem value="private_pay">Private Pay Service</SelectItem>
                <SelectItem value="general_information">General Information</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.serviceType === "private_pay" || formData.serviceType === "general_information") && (
            <div className="space-y-2">
              <Label htmlFor="externalUrl">External Website URL (optional)</Label>
              <Input
                id="externalUrl"
                type="url"
                placeholder="https://example.com"
                value={formData.externalUrl}
                onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                For services that link to an external website (e.g., Arthrosamid)
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Full Content</Label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          </div>

          <div className="space-y-2">
            <Label>Icon Selection</Label>
            <p className="text-sm text-muted-foreground">
              Choose an icon from the picker below, or upload a custom SVG icon
            </p>
          </div>

          <IconPicker
            value={formData.icon}
            onValueChange={(icon) => setFormData({ ...formData, icon })}
          />

          <FileDropzone
            label="Custom SVG Icon (Alternative to Icon Picker)"
            accept="image/svg+xml"
            file={svgFile}
            onFileChange={setSvgFile}
            currentFileUrl={treatment?.icon_svg_url}
          />

          <FileDropzone
            label="PDF Document"
            accept="application/pdf"
            file={pdfFile}
            onFileChange={setPdfFile}
            currentFileUrl={treatment?.pdf_url}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Treatment Image</Label>
              <div className="flex items-center gap-2">
                <Select value={stylePreset} onValueChange={(value) => setStylePreset(value as StylePreset)}>
                  <SelectTrigger className="w-[150px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="colorful">Colorful</SelectItem>
                    <SelectItem value="realistic">Realistic</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateIcon}
                  disabled={generatingIcon || !formData.title}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {generatingIcon ? "Generating..." : "Generate AI Icon"}
                </Button>
              </div>
            </div>
            <FileDropzone
              label=""
              accept="image/*"
              file={imageFile}
              onFileChange={(file) => {
                setImageFile(file);
                if (file) {
                  const previewUrl = URL.createObjectURL(file);
                  setImagePreview(previewUrl);
                } else {
                  // Clear both the file and preview when removing
                  setImagePreview(null);
                }
              }}
              currentFileUrl={treatment?.image_url}
              preview={imagePreview}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iconBackground">Icon Background</Label>
            <div className="flex gap-2">
              <Select 
                value={formData.iconBackground} 
                onValueChange={(value) => setFormData({ ...formData, iconBackground: value })}
              >
                <SelectTrigger id="iconBackground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="transparent">Transparent</SelectItem>
                  <SelectItem value="#f8f9fa">Light Gray</SelectItem>
                  <SelectItem value="#944242">Burgundy</SelectItem>
                  <SelectItem value="custom">Custom Color</SelectItem>
                </SelectContent>
              </Select>
              {formData.iconBackground === 'custom' && (
                <Input
                  type="color"
                  value={formData.iconBackground === 'custom' ? '#ffffff' : formData.iconBackground}
                  onChange={(e) => setFormData({ ...formData, iconBackground: e.target.value })}
                  className="w-20"
                />
              )}
            </div>
            {imagePreview && (
              <div className="mt-2 p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Preview with background:</p>
                <div 
                  className="w-20 h-20 rounded-lg overflow-hidden shadow-md mx-auto"
                  style={{ 
                    backgroundColor: formData.iconBackground === 'transparent' ? '#ffffff' : formData.iconBackground,
                    backgroundImage: formData.iconBackground === 'transparent' 
                      ? 'linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)'
                      : 'none',
                    backgroundSize: formData.iconBackground === 'transparent' ? '16px 16px' : 'auto',
                    backgroundPosition: formData.iconBackground === 'transparent' ? '0 0, 0 8px, 8px -8px, -8px 0px' : 'initial'
                  }}
                >
                  <img 
                    src={imagePreview} 
                    alt="Preview"
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : treatment ? "Update" : "Create"}
            </Button>
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogTrigger asChild>
                <Button type="button" variant="secondary">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Treatment Preview</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Hero Section Preview */}
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold">{formData.title || "Treatment Title"}</h2>
                    <p className="text-lg text-muted-foreground">
                      {formData.description || "Treatment description will appear here"}
                    </p>
                  </div>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div>
                      <img
                        src={imagePreview}
                        alt={formData.title}
                        className="w-full rounded-lg shadow-lg"
                      />
                    </div>
                  )}

                  {/* Content Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Treatment Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary prose-ul:text-foreground prose-ol:text-foreground prose-blockquote:text-foreground prose-blockquote:border-l-primary prose-code:text-foreground prose-pre:bg-muted"
                        dangerouslySetInnerHTML={{ __html: formData.content || "<p>Content will appear here</p>" }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TreatmentForm;
