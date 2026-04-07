import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Upload, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface FileDropzoneProps {
  label: string;
  accept: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  currentFileUrl?: string;
  preview?: string | null;
}

const FileDropzone = ({
  label,
  accept,
  file,
  onFileChange,
  currentFileUrl,
  preview,
}: FileDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchFileMetadata = async () => {
      if (currentFileUrl && !file) {
        try {
          // Extract bucket and path from URL
          const url = new URL(currentFileUrl);
          const pathParts = url.pathname.split('/');
          const bucketIndex = pathParts.findIndex(part => part === 'object' || part === 'public');
          
          if (bucketIndex !== -1) {
            const bucket = pathParts[bucketIndex + 1];
            const filePath = pathParts.slice(bucketIndex + 2).join('/');
            
            // Fetch file metadata
            const { data, error } = await supabase.storage
              .from(bucket)
              .list(filePath.substring(0, filePath.lastIndexOf('/')), {
                search: filePath.substring(filePath.lastIndexOf('/') + 1)
              });

            if (!error && data && data.length > 0) {
              setUploadedFileSize(data[0].metadata?.size || null);
            }
          }
        } catch (error) {
          console.error('Error fetching file metadata:', error);
        }
      } else {
        setUploadedFileSize(null);
      }
    };

    fetchFileMetadata();
  }, [currentFileUrl, file]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    const isAccepted = accept.split(",").some(acceptedType => {
      const trimmed = acceptedType.trim();
      if (trimmed.endsWith("/*")) {
        return droppedFile.type.startsWith(trimmed.replace("/*", "/"));
      }
      return droppedFile.type === trimmed;
    });
    if (droppedFile && isAccepted) {
      onFileChange(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileChange(selectedFile);
    // Create preview for SVG files
    if (selectedFile && selectedFile.type === 'image/svg+xml' && !preview) {
      // SVG preview will be handled by the parent component if needed
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {file || currentFileUrl ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {file ? file.name : (currentFileUrl ? decodeURIComponent(currentFileUrl.split('/').pop() || 'Current file uploaded') : "Current file uploaded")}
                  </p>
                  {file && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Ready to upload
                    </Badge>
                  )}
                  {!file && currentFileUrl && (
                    <Badge variant="outline" className="text-xs">
                      Uploaded
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {file 
                    ? `${(file.size / 1024).toFixed(1)} KB • Will be uploaded on save` 
                    : uploadedFileSize 
                      ? `${(uploadedFileSize / 1024).toFixed(1)} KB • Click to replace`
                      : "Click to replace"
                  }
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Drag and drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {accept.includes("image") ? "PNG, JPG, WEBP" : "PDF files only"}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {preview && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
          <img
            src={preview}
            alt="Upload preview"
            className="w-full max-w-md h-48 object-cover rounded-lg border"
          />
        </div>
      )}
      
      {file && accept.includes('svg') && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">SVG Icon Selected</p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Your custom SVG icon is ready. Click "Update" or "Create" to upload and save.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
