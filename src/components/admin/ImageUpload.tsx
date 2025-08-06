import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onUploadComplete?: () => void;
}

const ImageUpload = ({ onUploadComplete }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Fel filtyp",
        description: "Endast bildfiler är tillåtna",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Filen är för stor",
        description: "Max filstorlek är 10MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      toast({
        title: "Fyll i alla fält",
        description: "Titel och bild krävs",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Du måste vara inloggad",
          description: "Logga in för att ladda upp bilder",
          variant: "destructive"
        });
        return;
      }

      // Create unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('gallery_images')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          file_path: uploadData.path,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          uploaded_by: user.id
        });

      if (dbError) throw dbError;

      toast({
        title: "Uppladdning lyckades!",
        description: "Bilden har lagts till i galleriet"
      });

      // Reset form
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      setPreviewUrl(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      onUploadComplete?.();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Uppladdning misslyckades",
        description: "Något gick fel. Försök igen.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setTitle("");
    setDescription("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Ladda upp bild
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Välj bildfil</Label>
          <Input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </div>

        {previewUrl && (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-32 object-cover rounded border"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              className="absolute top-2 right-2"
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div>
          <Label htmlFor="title">Titel</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Bildtitel..."
            disabled={isUploading}
          />
        </div>

        <div>
          <Label htmlFor="description">Beskrivning (valfri)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beskriv bilden..."
            disabled={isUploading}
            rows={3}
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !title.trim() || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Laddar upp...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Ladda upp
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImageUpload;