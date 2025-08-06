import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const GallerySection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const galleryImages = [
    {
      src: "/lovable-uploads/1f098528-a474-45a4-9856-cd939d92199f.png",
      alt: "Bowlingskor och kula med banor i bakgrunden",
      title: "Redo för Spel",
      description: "Professionell utrustning för den perfekta bowlingupplevelsen"
    },
    {
      src: "/lovable-uploads/372f4e62-8d8c-421e-9e00-cdc227bb22f2.png",
      alt: "Professionella bowlingbanor med modern design",
      title: "Moderna Banor",
      description: "8 professionella Brunswick banor med senaste tekniken"
    },
    {
      src: "https://drive.google.com/uc?export=view&id=16cOvd5APENmjmXMwnklX6R_CpakiiEV-",
      alt: "Markaryds Bowling interiör och atmosfär",
      title: "Vår Miljö",
      description: "En inbjudande atmosfär där familjer och vänner trivs"
    },
    {
      src: "/lovable-uploads/e77cef8a-0f4b-44ec-855c-068f714bd840.png",
      alt: "Mysig restaurangdel med moderna möbler",
      title: "Restaurang & Bar",
      description: "Njut av god mat och dryck i vår mysiga restaurangmiljö"
    },
    {
      src: "/lovable-uploads/3f91a31b-f9e8-4409-a19b-9e0fb0f3d765.png",
      alt: "Dart och shuffleboard område",
      title: "Fler Aktiviteter",
      description: "Dart, shuffleboard och andra roliga spel för hela familjen"
    },
    {
      src: "/lovable-uploads/bfd75706-4f9b-415d-a95c-2948af2e63a0.png",
      alt: "Vänlig personal vid receptionen",
      title: "Välkommen Hit",
      description: "Vår vänliga personal tar emot dig med ett leende"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
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

  return (
    <section id="gallery" className="py-24 px-4 bg-muted/30">
      <div className="container mx-auto max-w-5xl">
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
            {/* Main slideshow */}
            <div className="relative aspect-[16/9] overflow-hidden">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                    index === currentSlide ? 'translate-x-0' : 
                    index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover object-center"
                    style={{ 
                      imageRendering: 'crisp-edges',
                      filter: 'contrast(1.05) brightness(1.02)'
                    }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="text-white font-bold text-2xl md:text-3xl mb-2">
                      {image.title}
                    </h3>
                    <p className="text-white/90 text-lg">
                      {image.description}
                    </p>
                  </div>
                </div>
              ))}

              {/* Navigation arrows */}
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
            </div>

            {/* Thumbnail navigation */}
            <div className="flex justify-center gap-2 p-6 bg-card">
              {galleryImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-16 h-12 rounded overflow-hidden border-2 transition-all duration-300 ${
                    index === currentSlide 
                      ? 'border-primary scale-110' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover object-center"
                    style={{ 
                      imageRendering: 'crisp-edges',
                      filter: 'contrast(1.05) brightness(1.02)'
                    }}
                  />
                </button>
              ))}
            </div>
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