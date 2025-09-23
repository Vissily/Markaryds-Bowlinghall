import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
}

const GallerySection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Default images as fallback
  const defaultImages: GalleryImage[] = [
    {
      id: "default-1",
      title: "Redo för Spel",
      description: "Professionell utrustning för den perfekta bowlingupplevelsen",
      file_path: "/lovable-uploads/1f098528-a474-45a4-9856-cd939d92199f.png"
    },
    {
      id: "default-2", 
      title: "Moderna Banor",
      description: "8 professionella Brunswick banor med senaste tekniken",
      file_path: "/lovable-uploads/372f4e62-8d8c-421e-9e00-cdc227bb22f2.png"
    },
    {
      id: "default-3",
      title: "Restaurang & Bar", 
      description: "Njut av god mat och dryck i vår mysiga restaurangmiljö",
      file_path: "/lovable-uploads/e77cef8a-0f4b-44ec-855c-068f714bd840.png"
    },
    {
      id: "default-4",
      title: "Fler Aktiviteter",
      description: "Dart, shuffleboard och andra roliga spel för hela familjen", 
      file_path: "/lovable-uploads/3f91a31b-f9e8-4409-a19b-9e0fb0f3d765.png"
    },
    {
      id: "default-5",
      title: "Välkommen Hit",
      description: "Vår vänliga personal tar emot dig med ett leende",
      file_path: "/lovable-uploads/bfd75706-4f9b-415d-a95c-2948af2e63a0.png"
    }
  ];

  // Fetch images from database
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('id, title, description, file_path')
          .eq('show_in_slideshow', true)
          .order('sort_order', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Convert database images to correct format
          const formattedImages = data.map(img => ({
            ...img,
            file_path: supabase.storage.from('gallery-images').getPublicUrl(img.file_path).data.publicUrl
          }));
          setGalleryImages(formattedImages);
        } else {
          // Use default images if no database images
          setGalleryImages(defaultImages);
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
        // Use default images on error
        setGalleryImages(defaultImages);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Optimized auto-play to prevent forced reflows
  useEffect(() => {
    if (!isPlaying || galleryImages.length === 0) return;
    
    const interval = setInterval(() => {
      // Use requestAnimationFrame to batch DOM updates
      requestAnimationFrame(() => {
        setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, galleryImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <section id="gallery" className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Laddar galleri...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-24 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Upplev Atmosfären
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Få en känsla för vår moderna och mysiga miljö där alla känner sig välkomna
          </p>
        </div>

        <Card className="overflow-hidden shadow-elegant border-2">
          <CardContent className="p-0 relative">
            {galleryImages.length === 0 ? (
              <div className="aspect-[21/9] flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">Inga bilder markerade för slideshow än.</p>
              </div>
            ) : (
              <>
                {/* Main slideshow */}
                <div className="relative aspect-[21/9]">
                  {galleryImages.map((image, index) => (
                    <div
                      key={image.id}
                      className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                        index === currentSlide ? 'translate-x-0' : 
                        index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                      }`}
                    >
                      <img
                        src={image.file_path}
                        alt={image.title}
                        className="w-full h-full object-cover object-center"
                        style={{ 
                          imageRendering: 'crisp-edges',
                          filter: 'contrast(1.05) brightness(1.02)'
                        }}
                        loading="lazy"
                      />
                    </div>
                  ))}

                  {/* Navigation arrows - only show if there are multiple images */}
                  {galleryImages.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                        onClick={prevSlide}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                        onClick={nextSlide}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>

                      {/* Play/Pause button */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </>
                  )}
                </div>

                {/* Thumbnail navigation - only show if there are multiple images */}
                {galleryImages.length > 1 && (
                  <div className="flex justify-center gap-2 p-6 bg-card">
                    {galleryImages.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => goToSlide(index)}
                        className={`w-16 h-12 rounded overflow-hidden border-2 transition-all duration-300 ${
                          index === currentSlide 
                            ? 'border-primary scale-110' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <img
                          src={image.file_path}
                          alt={image.title}
                          className="w-full h-full object-cover object-center"
                          style={{ 
                            imageRendering: 'crisp-edges',
                            filter: 'contrast(1.05) brightness(1.02)'
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <p className="text-muted-foreground text-lg">
            Kom och upplev Markaryds Bowling – här skapar vi minnen tillsammans!
          </p>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;