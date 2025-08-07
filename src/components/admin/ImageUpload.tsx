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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileMetadata, setFileMetadata] = useState<{ title: string; description: string; previewUrl?: string }[]>([]);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types - allow images, videos, and PDFs
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm',
      'application/pdf'
    ];
    
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        invalidFiles.push(file.name);
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Filen är för stor",
          description: `${file.name} - Max filstorlek är 50MB`,
          variant: "destructive"
        });
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      toast({
        title: "Ogiltiga filtyper",
        description: `Dessa filer stöds inte: ${invalidFiles.join(', ')}`,
        variant: "destructive"
      });
    }

    if (validFiles.length === 0) return;

    setSelectedFiles(validFiles);

    // Create metadata for each file
    const metadata = validFiles.map(file => {
      const baseMetadata = {
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        description: ""
      };

      // Create preview URL for images and videos
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        return { ...baseMetadata, previewUrl: url };
      }

      return baseMetadata;
    });

    setFileMetadata(metadata);
  };

  const handleUpload = async () => {
    console.log('Upload button clicked', { selectedFiles: selectedFiles.length, fileMetadata });
    
    // Validate that all files have titles
    const hasEmptyTitles = fileMetadata.some(meta => !meta.title.trim());
    if (selectedFiles.length === 0 || hasEmptyTitles) {
      toast({
        title: "Fyll i alla fält",
        description: "Alla filer måste ha en titel",
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

      const uploadPromises = selectedFiles.map(async (file, index) => {
        const metadata = fileMetadata[index];
        
        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${index}.${fileExt}`;

        console.log('Starting file upload:', {
          fileName,
          fileSize: file.size,
          fileType: file.type,
          bucketId: 'gallery-images'
        });

        // Upload file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('gallery-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error details:', uploadError);
          throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
        }

        // Save metadata to database
        const { error: dbError } = await supabase
          .from('gallery_images')
          .insert({
            title: metadata.title.trim(),
            description: metadata.description.trim() || null,
            file_path: uploadData.path,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: user.id
          });

        if (dbError) {
          console.error('Database error details:', dbError);
          throw new Error(`Database save failed for ${file.name}: ${dbError.message}`);
        }

        return { success: true, fileName: file.name };
      });

      const results = await Promise.allSettled(uploadPromises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        toast({
          title: "Uppladdning lyckades!",
          description: `${successful} ${successful === 1 ? 'fil' : 'filer'} har lagts till i galleriet${failed > 0 ? `, ${failed} misslyckades` : ''}`
        });
      }

      if (failed > 0 && successful === 0) {
        toast({
          title: "Uppladdning misslyckades",
          description: "Alla filer misslyckades att laddas upp",
          variant: "destructive"
        });
      }

      // Reset form if at least one file succeeded
      if (successful > 0) {
        setSelectedFiles([]);
        setFileMetadata([]);
        
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        onUploadComplete?.();
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      
      toast({
        title: "Uppladdning misslyckades",
        description: error.message || "Något gick fel. Försök igen.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    // Clean up preview URLs
    fileMetadata.forEach(meta => {
      if (meta.previewUrl) {
        URL.revokeObjectURL(meta.previewUrl);
      }
    });
    
    setSelectedFiles([]);
    setFileMetadata([]);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newMetadata = fileMetadata.filter((_, i) => i !== index);
    
    // Clean up preview URL for removed file
    if (fileMetadata[index]?.previewUrl) {
      URL.revokeObjectURL(fileMetadata[index].previewUrl!);
    }
    
    setSelectedFiles(newFiles);
    setFileMetadata(newMetadata);
  };

  const updateFileMetadata = (index: number, field: 'title' | 'description', value: string) => {
    const newMetadata = [...fileMetadata];
    newMetadata[index] = { ...newMetadata[index], [field]: value };
    setFileMetadata(newMetadata);
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
          <Label htmlFor="file-upload">Välj filer (bilder, videor, PDF - max 50MB per fil)</Label>
          <Input
            id="file-upload"
            type="file"
            accept="image/*,video/*,.pdf"
            onChange={handleFileSelect}
            disabled={isUploading}
            multiple
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{selectedFiles.length} {selectedFiles.length === 1 ? 'fil' : 'filer'} valda</span>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                disabled={isUploading}
              >
                Rensa alla
              </Button>
            </div>
            
            {selectedFiles.map((file, index) => (
              <div key={index} className="border rounded p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Preview */}
                    {fileMetadata[index]?.previewUrl && file.type.startsWith('image/') && (
                      <img
                        src={fileMetadata[index].previewUrl}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded border mb-2"
                      />
                    )}
                    {fileMetadata[index]?.previewUrl && file.type.startsWith('video/') && (
                      <video
                        src={fileMetadata[index].previewUrl}
                        className="w-full h-24 object-cover rounded border mb-2"
                        controls
                      />
                    )}
                    {file.type === 'application/pdf' && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded mb-2">
                        <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                          <span className="text-red-600 text-xs font-bold">PDF</span>
                        </div>
                        <span className="text-sm">{file.name}</span>
                      </div>
                    )}
                    
                    {/* Metadata inputs */}
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor={`title-${index}`}>Titel</Label>
                        <Input
                          id={`title-${index}`}
                          value={fileMetadata[index]?.title || ''}
                          onChange={(e) => updateFileMetadata(index, 'title', e.target.value)}
                          placeholder="Titel för filen..."
                          disabled={isUploading}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`description-${index}`}>Beskrivning (valfri)</Label>
                        <Textarea
                          id={`description-${index}`}
                          value={fileMetadata[index]?.description || ''}
                          onChange={(e) => updateFileMetadata(index, 'description', e.target.value)}
                          placeholder="Beskriv filen..."
                          disabled={isUploading}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                    className="ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || fileMetadata.some(meta => !meta.title.trim()) || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Laddar upp {selectedFiles.length} {selectedFiles.length === 1 ? 'fil' : 'filer'}...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Ladda upp {selectedFiles.length > 0 ? `${selectedFiles.length} ${selectedFiles.length === 1 ? 'fil' : 'filer'}` : 'filer'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MediaUpload;