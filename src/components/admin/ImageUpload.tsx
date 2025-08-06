import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MediaUploadProps {
  onUploadComplete?: () => void;
}

const MediaUpload = ({ onUploadComplete }: MediaUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - allow images, videos, and PDFs
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Fel filtyp",
        description: "Endast bilder, videor (MP4, MOV, AVI, WebM) och PDF-filer är tillåtna",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Filen är för stor",
        description: "Max filstorlek är 50MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension

    // Create preview URL for images and videos
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null); // No preview for PDFs
    }
  };

  const handleUpload = async () => {
    console.log('Upload button clicked', { selectedFile, title });
    
    if (!selectedFile || !title.trim()) {
      console.log('Validation failed:', { hasFile: !!selectedFile, hasTitle: !!title.trim() });
      toast({
        title: "Fyll i alla fält",
        description: "Titel och fil krävs",
        variant: "destructive"
      });
      return;
    }

    console.log('Starting upload process...');
    setIsUploading(true);

    try {
      // Get current user
      console.log('Getting current user...');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);
      
      if (!user) {
        console.log('No user found');
        toast({
          title: "Du måste vara inloggad",
          description: "Logga in för att ladda upp filer",
          variant: "destructive"
        });
        return;
      }

      // Create unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      console.log('Starting file upload:', {
        fileName,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        bucketId: 'gallery-images'
      });

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(fileName, selectedFile);

      console.log('Upload result:', { uploadData, uploadError });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      // Save metadata to database
      console.log('Saving metadata to database:', {
        title: title.trim(),
        description: description.trim() || null,
        file_path: uploadData.path,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
        uploaded_by: user.id
      });

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

      if (dbError) {
        console.error('Database error details:', dbError);
        throw dbError;
      }

      toast({
        title: "Uppladdning lyckades!",
        description: "Filen har lagts till i galleriet"
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

    } catch (error: any) {
      console.error('Upload error:', error);
      
      let errorMessage = "Något gick fel. Försök igen.";
      
      if (error?.message?.includes('Payload too large')) {
        errorMessage = "Filen är för stor. Max 50MB tillåten.";
      } else if (error?.message?.includes('Invalid file type')) {
        errorMessage = "Filtypen stöds inte.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Uppladdning misslyckades",
        description: errorMessage,
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
          Ladda upp media
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Välj fil (bilder, videor, PDF - max 50MB)</Label>
          <Input
            id="file-upload"
            type="file"
            accept="image/*,video/*,.pdf"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </div>

        {previewUrl && selectedFile && (
          <div className="relative">
            {selectedFile.type.startsWith('image/') && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-32 object-cover rounded border"
              />
            )}
            {selectedFile.type.startsWith('video/') && (
              <video
                src={previewUrl}
                className="w-full h-32 object-cover rounded border"
                controls
              />
            )}
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

        {selectedFile && selectedFile.type === 'application/pdf' && (
          <div className="relative p-4 border rounded">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                <span className="text-red-600 text-xs font-bold">PDF</span>
              </div>
              <span className="text-sm">{selectedFile.name}</span>
            </div>
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
            placeholder="Titel för filen..."
            disabled={isUploading}
          />
        </div>

        <div>
          <Label htmlFor="description">Beskrivning (valfri)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beskriv filen..."
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

export default MediaUpload;