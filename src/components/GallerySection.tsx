import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const GallerySection = () => {
  const galleryImages = [
    {
      src: "/lovable-uploads/1f098528-a474-45a4-9856-cd939d92199f.png",
      alt: "Bowlingskor och kula med banor i bakgrunden",
      title: "Redo för Spel"
    },
    {
      src: "/lovable-uploads/372f4e62-8d8c-421e-9e00-cdc227bb22f2.png",
      alt: "Professionella bowlingbanor med modern design",
      title: "Moderna Banor"
    },
    {
      src: "/lovable-uploads/e77cef8a-0f4b-44ec-855c-068f714bd840.png",
      alt: "Mysig restaurangdel med moderna möbler",
      title: "Restaurang & Bar"
    },
    {
      src: "/lovable-uploads/3f91a31b-f9e8-4409-a19b-9e0fb0f3d765.png",
      alt: "Dart och shuffleboard område",
      title: "Fler Aktiviteter"
    },
    {
      src: "/lovable-uploads/bfd75706-4f9b-415d-a95c-2948af2e63a0.png",
      alt: "Vänlig personal vid receptionen",
      title: "Välkommen Hit"
    }
  ];

  return (
    <section id="gallery" className="py-24 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Upplev Atmosfären
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Få en känsla för vår moderna och mysiga miljö där alla känner sig välkomna
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <Card 
              key={index} 
              className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-500 hover:scale-105 border-2"
            >
              <CardContent className="p-0 relative">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-white font-semibold text-lg">
                      {image.title}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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