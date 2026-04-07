import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Check, X, Loader2, RefreshCw } from "lucide-react";
import * as Icons from "lucide-react";

interface Treatment {
  id: string;
  title: string;
  description: string;
  icon: string;
  slug: string;
  image_url?: string;
}

interface GeneratedIcon {
  treatmentId: string;
  imageData: string;
  uploaded?: boolean;
  imageUrl?: string;
}

type StylePreset = 'modern' | 'minimalist' | 'colorful' | 'realistic';

const styleDescriptions: Record<StylePreset, string> = {
  modern: 'sleek contemporary design with gradients and depth, tech-forward aesthetic',
  minimalist: 'ultra-simple clean lines, flat design, minimal details, monochromatic with accent color',
  colorful: 'vibrant rich colors, dynamic composition, eye-catching palette, bold and expressive',
  realistic: 'detailed photorealistic medical illustration, anatomically accurate, professional medical textbook style'
};

const BatchIconGenerator = ({ onClose }: { onClose: () => void }) => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedIcons, setGeneratedIcons] = useState<Record<string, GeneratedIcon>>({});
  const [selectedTreatments, setSelectedTreatments] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [stylePreset, setStylePreset] = useState<StylePreset>('modern');

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    const { data, error } = await supabase
      .from("treatments")
      .select("id, title, description, icon, slug, image_url")
      .order("title");

    if (!error && data) {
      setTreatments(data);
      // Start with no treatments selected
      setSelectedTreatments(new Set());
    }
    setLoading(false);
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

  const generateIconForTreatment = async (treatment: Treatment, style: StylePreset = stylePreset) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-treatment-icon', {
        body: {
          title: treatment.title,
          description: treatment.description,
          style: style
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data.imageData;
    } catch (error: any) {
      console.error(`Error generating icon for ${treatment.title}:`, error);
      throw error;
    }
  };

  const handleGenerateAll = async () => {
    const selectedTreatmentsList = treatments.filter(t => selectedTreatments.has(t.id));
    
    if (selectedTreatmentsList.length === 0) {
      toast.error("Please select at least one treatment");
      return;
    }

    setGenerating(true);
    const newGeneratedIcons: Record<string, GeneratedIcon> = {};
    let successCount = 0;
    let failCount = 0;
    let currentToastId: string | number = '';

    for (const treatment of selectedTreatmentsList) {
      try {
        // Show/update a persistent loading toast
        if (currentToastId) {
          toast.loading(`Generating icon for ${treatment.title}...`, { id: currentToastId });
        } else {
          currentToastId = toast.loading(`Generating icon for ${treatment.title}...`);
        }
        
        const imageData = await generateIconForTreatment(treatment);
        newGeneratedIcons[treatment.id] = {
          treatmentId: treatment.id,
          imageData
        };
        successCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        failCount++;
        toast.error(`Failed to generate icon for ${treatment.title}`);
      }
    }

    // Dismiss the loading toast
    if (currentToastId) {
      toast.dismiss(currentToastId);
    }

    setGeneratedIcons(prev => ({ ...prev, ...newGeneratedIcons }));
    setGenerating(false);
    
    if (successCount > 0) {
      toast.success(`Generated ${successCount} icons successfully${failCount > 0 ? ` (${failCount} failed)` : ''}`);
    }
  };

  const handleRegenerateIcon = async (treatment: Treatment) => {
    setRegeneratingId(treatment.id);
    const toastId = toast.loading(`Regenerating icon for ${treatment.title}...`);
    
    try {
      const imageData = await generateIconForTreatment(treatment);
      
      setGeneratedIcons(prev => ({
        ...prev,
        [treatment.id]: {
          treatmentId: treatment.id,
          imageData,
          uploaded: false
        }
      }));
      
      toast.success(`Icon regenerated for ${treatment.title}`, { id: toastId });
    } catch (error: any) {
      toast.error(`Failed to regenerate icon for ${treatment.title}`, { id: toastId });
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleSaveAll = async () => {
    const iconsToSave = Object.entries(generatedIcons).filter(([_, icon]) => !icon.uploaded);
    
    if (iconsToSave.length === 0) {
      toast.error("No new icons to save");
      return;
    }

    setSaving(true);
    let savedCount = 0;

    for (const [treatmentId, icon] of iconsToSave) {
      try {
        const treatment = treatments.find(t => t.id === treatmentId);
        if (!treatment) continue;

        // Upload to storage
        const fileName = `${treatment.slug}-ai-icon-${Date.now()}.png`;
        const imageUrl = await uploadBase64Image(icon.imageData, fileName);

        // Update database
        const { error } = await supabase
          .from("treatments")
          .update({ image_url: imageUrl })
          .eq("id", treatmentId);

        if (error) throw error;

        // Mark as uploaded
        setGeneratedIcons(prev => ({
          ...prev,
          [treatmentId]: { ...prev[treatmentId], uploaded: true, imageUrl }
        }));

        savedCount++;
      } catch (error: any) {
        console.error(`Error saving icon for treatment ${treatmentId}:`, error);
        toast.error(`Failed to save icon for a treatment`);
      }
    }

    setSaving(false);
    
    if (savedCount > 0) {
      toast.success(`Saved ${savedCount} icons successfully!`);
      // Refresh treatments to show updated data
      fetchTreatments();
    }
  };

  const toggleTreatmentSelection = (treatmentId: string) => {
    setSelectedTreatments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(treatmentId)) {
        newSet.delete(treatmentId);
      } else {
        newSet.add(treatmentId);
      }
      return newSet;
    });
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Activity;
    return <Icon className="h-8 w-8" />;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading treatments...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Batch AI Icon Generator</CardTitle>
          <CardDescription>
            Generate AI-powered icons for multiple treatments at once. Select the treatments you want to generate icons for, 
            preview them, and save the ones you like.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="style-preset">Icon Style</Label>
              <Select value={stylePreset} onValueChange={(value) => setStylePreset(value as StylePreset)}>
                <SelectTrigger id="style-preset">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Modern</span>
                      <span className="text-xs text-muted-foreground">Sleek contemporary with gradients</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="minimalist">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Minimalist</span>
                      <span className="text-xs text-muted-foreground">Clean lines and flat design</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="colorful">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Colorful</span>
                      <span className="text-xs text-muted-foreground">Vibrant and bold palette</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="realistic">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Realistic</span>
                      <span className="text-xs text-muted-foreground">Detailed medical illustration</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              onClick={handleGenerateAll}
              disabled={generating || selectedTreatments.size === 0}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Selected ({selectedTreatments.size})
                </>
              )}
            </Button>
            <Button
              onClick={handleSaveAll}
              disabled={saving || Object.keys(generatedIcons).length === 0}
              variant="secondary"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save All Generated
                </>
              )}
            </Button>
            <Button onClick={onClose} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {treatments.map((treatment) => {
              const generatedIcon = generatedIcons[treatment.id];
              const isSelected = selectedTreatments.has(treatment.id);
              const isRegenerating = regeneratingId === treatment.id;

              return (
                <Card
                  key={treatment.id}
                  className={`relative transition-all ${
                    isSelected ? 'ring-2 ring-primary' : 'opacity-60'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => toggleTreatmentSelection(treatment.id)}
                      >
                        <CardTitle className="text-lg">{treatment.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {generatedIcon?.uploaded && (
                          <Badge variant="secondary">
                            <Check className="h-3 w-3 mr-1" />
                            Saved
                          </Badge>
                        )}
                        {generatedIcon && !generatedIcon.uploaded && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRegenerateIcon(treatment);
                            }}
                            disabled={isRegenerating || generating}
                          >
                            {isRegenerating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent onClick={() => toggleTreatmentSelection(treatment.id)} className="cursor-pointer">
                    <div className="space-y-4">
                      {/* Current Icon */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Current:</p>
                        <div className="flex items-center justify-center h-24 bg-muted rounded-lg">
                          {treatment.image_url ? (
                            <img
                              src={treatment.image_url}
                              alt={treatment.title}
                              className="h-20 w-20 object-cover rounded"
                            />
                          ) : (
                            <div className="text-primary">
                              {getIcon(treatment.icon)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Generated Icon Preview */}
                      {generatedIcon && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Generated:</p>
                            {isRegenerating && (
                              <span className="text-xs text-muted-foreground">Regenerating...</span>
                            )}
                          </div>
                          <div className="flex items-center justify-center h-24 bg-muted rounded-lg border-2 border-primary/50">
                            <img
                              src={generatedIcon.imageData}
                              alt={`Generated icon for ${treatment.title}`}
                              className="h-20 w-20 object-cover rounded"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchIconGenerator;
