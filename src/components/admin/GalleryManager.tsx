import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Star, StarOff, Save, X, Monitor, MonitorOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "./ImageUpload";

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  is_featured: boolean;
  show_in_slideshow: boolean;
  sort_order: number;
  created_at: string;
}

const GalleryManager = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const { toast } = useToast();

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Fel vid hämtning",
        description: "Kunde inte ladda bilderna",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleDelete = async (id: string, filePath: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna bild?')) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('gallery-images')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      setImages(images.filter(img => img.id !== id));
      toast({
        title: "Bild borttagen",
        description: "Bilden har tagits bort från galleriet"
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Fel vid borttagning",
        description: "Kunde inte ta bort bilden",
        variant: "destructive"
      });
    }
  };

  const handleToggleSlideshow = async (id: string, currentSlideshow: boolean) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ show_in_slideshow: !currentSlideshow })
        .eq('id', id);

      if (error) throw error;

      setImages(images.map(img => 
        img.id === id ? { ...img, show_in_slideshow: !currentSlideshow } : img
      ));

      toast({
        title: currentSlideshow ? "Bild borttagen från slideshow" : "Bild tillagd i slideshow",
        description: currentSlideshow ? "Bilden visas inte längre i bildspelet" : "Bilden visas nu i bildspelet"
      });
    } catch (error) {
      console.error('Error toggling slideshow:', error);
      toast({
        title: "Fel vid uppdatering",
        description: "Kunde inte uppdatera slideshow-status",
        variant: "destructive"
      });
    }
  };
  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ is_featured: !currentFeatured })
        .eq('id', id);

      if (error) throw error;

      setImages(images.map(img => 
        img.id === id ? { ...img, is_featured: !currentFeatured } : img
      ));

      toast({
        title: currentFeatured ? "Bild avmarkerad" : "Bild markerad",
        description: currentFeatured ? "Bilden är inte längre utvald" : "Bilden är nu utvald"
      });
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast({
        title: "Fel vid uppdatering",
        description: "Kunde inte uppdatera bildstatus",
        variant: "destructive"
      });
    }
  };

  const startEdit = (image: GalleryImage) => {
    setEditingId(image.id);
    setEditTitle(image.title);
    setEditDescription(image.description || "");
  };

  const saveEdit = async () => {
    if (!editingId || !editTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null
        })
        .eq('id', editingId);

      if (error) throw error;

      setImages(images.map(img => 
        img.id === editingId 
          ? { ...img, title: editTitle.trim(), description: editDescription.trim() || null }
          : img
      ));

      setEditingId(null);
      setEditTitle("");
      setEditDescription("");

      toast({
        title: "Bild uppdaterad",
        description: "Bilduppgifterna har sparats"
      });
    } catch (error) {
      console.error('Error updating image:', error);
      toast({
        title: "Fel vid sparande",
        description: "Kunde inte spara ändringarna",
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  if (loading) {
    return <div className="p-4">Laddar bilder...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ladda upp ny bild</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload onUploadComplete={fetchImages} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hantera galleribilder ({images.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <p className="text-muted-foreground">Inga bilder uppladdade än.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={getImageUrl(image.file_path)}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    {image.is_featured && (
                      <Badge className="absolute top-2 left-2" variant="secondary">
                        <Star className="w-3 h-3 mr-1" />
                        Utvald
                      </Badge>
                    )}
                    {image.show_in_slideshow && (
                      <Badge className="absolute top-2 right-2" variant="default">
                        <Monitor className="w-3 h-3 mr-1" />
                        Slideshow
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    {editingId === image.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Titel"
                        />
                        <Textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Beskrivning"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit}>
                            <Save className="w-3 h-3 mr-1" />
                            Spara
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="w-3 h-3 mr-1" />
                            Avbryt
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold truncate">{image.title}</h3>
                        {image.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {image.description}
                          </p>
                        )}
                        <div className="flex gap-1 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(image)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleSlideshow(image.id, image.show_in_slideshow)}
                          >
                            {image.show_in_slideshow ? <MonitorOff className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleFeatured(image.id, image.is_featured)}
                          >
                            {image.is_featured ? <StarOff className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(image.id, image.file_path)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryManager;