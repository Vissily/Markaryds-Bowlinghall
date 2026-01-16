import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Star, StarOff, Save, X, Monitor, MonitorOff, Download, Play, PlayCircle, Youtube, Link } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MediaUpload from "./ImageUpload";

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  is_featured: boolean;
  show_in_slideshow: boolean;
  show_in_hero: boolean;
  sort_order: number;
  created_at: string;
  youtube_url: string | null;
}

const GalleryManager = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editYoutubeUrl, setEditYoutubeUrl] = useState("");
  const [addingYoutube, setAddingYoutube] = useState(false);
  const [newYoutubeUrl, setNewYoutubeUrl] = useState("");
  const [newYoutubeTitle, setNewYoutubeTitle] = useState("");
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
        title: "Media borttagen",
        description: "Filen har tagits bort från galleriet"
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Fel vid borttagning",
        description: "Kunde inte ta bort filen",
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
        title: currentSlideshow ? "Media borttagen från slideshow" : "Media tillagd i slideshow",
        description: currentSlideshow ? "Filen visas inte längre i bildspelet" : "Filen visas nu i bildspelet"
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

  const handleToggleHero = async (id: string, currentHero: boolean) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ show_in_hero: !currentHero })
        .eq('id', id);

      if (error) throw error;

      setImages(images.map(img => 
        img.id === id ? { ...img, show_in_hero: !currentHero } : img
      ));

      toast({
        title: currentHero ? "Media borttagen från hero" : "Media tillagd i hero",
        description: currentHero ? "Filen visas inte längre på framsidan" : "Filen visas nu på framsidan"
      });
    } catch (error) {
      console.error('Error toggling hero:', error);
      toast({
        title: "Fel vid uppdatering",
        description: "Kunde inte uppdatera hero-status",
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
        title: currentFeatured ? "Media avmarkerad" : "Media markerad",
        description: currentFeatured ? "Filen är inte längre utvald" : "Filen är nu utvald"
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
    setEditYoutubeUrl(image.youtube_url || "");
  };

  const saveEdit = async () => {
    if (!editingId || !editTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          youtube_url: editYoutubeUrl.trim() || null
        })
        .eq('id', editingId);

      if (error) throw error;

      setImages(images.map(img => 
        img.id === editingId 
          ? { 
              ...img, 
              title: editTitle.trim(), 
              description: editDescription.trim() || null,
              youtube_url: editYoutubeUrl.trim() || null
            }
          : img
      ));

      setEditingId(null);
      setEditTitle("");
      setEditDescription("");
      setEditYoutubeUrl("");

      toast({
        title: "Media uppdaterad",
        description: "Filuppgifterna har sparats"
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
    setEditYoutubeUrl("");
  };

  const handleAddYoutubeVideo = async () => {
    if (!newYoutubeUrl.trim() || !newYoutubeTitle.trim()) {
      toast({
        title: "Fyll i alla fält",
        description: "Både titel och YouTube-länk krävs",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Inte inloggad');

      const { data, error } = await supabase
        .from('gallery_images')
        .insert({
          title: newYoutubeTitle.trim(),
          youtube_url: newYoutubeUrl.trim(),
          file_path: `youtube-${Date.now()}`, // Placeholder path
          uploaded_by: user.id,
          mime_type: 'video/youtube',
          show_in_hero: true
        })
        .select()
        .single();

      if (error) throw error;

      setImages([...images, data]);
      setNewYoutubeUrl("");
      setNewYoutubeTitle("");
      setAddingYoutube(false);

      toast({
        title: "YouTube-video tillagd",
        description: "Videon har lagts till och visas i hero-sektionen"
      });
    } catch (error) {
      console.error('Error adding YouTube video:', error);
      toast({
        title: "Fel vid tillägg",
        description: "Kunde inte lägga till YouTube-video",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async (image: GalleryImage) => {
    try {
      const imageUrl = getImageUrl(image.file_path);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${image.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${image.file_path.split('.').pop()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Nedladdning påbörjad",
        description: `${image.title} laddas ner`
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Fel vid nedladdning",
        description: "Kunde inte ladda ner bilden",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-4">Laddar bilder...</div>;
  }

  return (
    <div className="space-y-6">
      {/* YouTube Video Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-600" />
            Lägg till YouTube-video för Hero
          </CardTitle>
        </CardHeader>
        <CardContent>
          {addingYoutube ? (
            <div className="space-y-3">
              <Input
                value={newYoutubeTitle}
                onChange={(e) => setNewYoutubeTitle(e.target.value)}
                placeholder="Titel för videon"
              />
              <Input
                value={newYoutubeUrl}
                onChange={(e) => setNewYoutubeUrl(e.target.value)}
                placeholder="YouTube-länk (t.ex. https://www.youtube.com/watch?v=...)"
              />
              <div className="flex gap-2">
                <Button onClick={handleAddYoutubeVideo}>
                  <Save className="w-4 h-4 mr-2" />
                  Lägg till video
                </Button>
                <Button variant="outline" onClick={() => {
                  setAddingYoutube(false);
                  setNewYoutubeUrl("");
                  setNewYoutubeTitle("");
                }}>
                  <X className="w-4 h-4 mr-2" />
                  Avbryt
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                💡 YouTube-videor visas i hero-sektionen på startsidan och drar ingen bandbredd från din Supabase-lagring.
              </p>
            </div>
          ) : (
            <Button onClick={() => setAddingYoutube(true)} variant="outline">
              <Youtube className="w-4 h-4 mr-2" />
              Lägg till YouTube-video
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ladda upp ny media</CardTitle>
        </CardHeader>
        <CardContent>
          <MediaUpload onUploadComplete={fetchImages} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hantera gallerimedia ({images.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <p className="text-muted-foreground">Inga mediafiler uppladdade än.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    {image.mime_type?.startsWith('image/') && (
                      <img
                        src={getImageUrl(image.file_path)}
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {image.mime_type?.startsWith('video/') && !image.youtube_url && image.mime_type !== 'video/youtube' && (
                      <video
                        src={getImageUrl(image.file_path)}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                    {(image.youtube_url || image.mime_type === 'video/youtube') && (
                      <div className="w-full h-full bg-red-50 flex items-center justify-center">
                        <div className="text-center">
                          <Youtube className="w-12 h-12 text-red-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">{image.title}</p>
                          {image.youtube_url && (
                            <a 
                              href={image.youtube_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center justify-center gap-1 mt-1"
                            >
                              <Link className="w-3 h-3" />
                              Öppna i YouTube
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    {image.mime_type === 'application/pdf' && (
                      <div className="w-full h-full bg-red-50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-red-100 rounded mx-auto mb-2 flex items-center justify-center">
                            <span className="text-red-600 font-bold">PDF</span>
                          </div>
                          <p className="text-sm text-gray-600">{image.title}</p>
                        </div>
                      </div>
                    )}
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
                    {image.show_in_hero && (
                      <Badge className="absolute bottom-2 left-2" variant="default">
                        <PlayCircle className="w-3 h-3 mr-1" />
                        Hero
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
                        <Input
                          value={editYoutubeUrl}
                          onChange={(e) => setEditYoutubeUrl(e.target.value)}
                          placeholder="YouTube-länk (valfritt)"
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
                            title="Redigera"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(image)}
                            title="Ladda ner"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleSlideshow(image.id, image.show_in_slideshow)}
                            title={image.show_in_slideshow ? "Ta bort från slideshow" : "Lägg till i slideshow"}
                          >
                            {image.show_in_slideshow ? <MonitorOff className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                          </Button>
                          {(image.mime_type?.startsWith('video/') || image.youtube_url) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleHero(image.id, image.show_in_hero)}
                              title={image.show_in_hero ? "Ta bort från hero" : "Lägg till i hero"}
                            >
                              {image.show_in_hero ? <Play className="w-3 h-3" /> : <PlayCircle className="w-3 h-3" />}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleFeatured(image.id, image.is_featured)}
                            title={image.is_featured ? "Ta bort utvald" : "Markera som utvald"}
                          >
                            {image.is_featured ? <StarOff className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(image.id, image.file_path)}
                            title="Ta bort"
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