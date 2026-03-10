import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuSection from "@/components/MenuSection";
import { ChefHat, Clock, Users } from "lucide-react";
import { useSEO, createBreadcrumbJsonLd, createWebPageJsonLd } from "@/hooks/useSEO";

const Menu = () => {
  useSEO({
    title: "Meny – Mat & Dryck | Markaryds Bowlinghall",
    description: "Se vår meny med pizza, hamburgare, tilltugg och dryck. Fajitasbuffé för grupper från 145 kr. Beställ mat till din bowlingupplevelse i Markaryd.",
    keywords: "restaurang markaryd, mat bowling, pizza markaryd, fajitasbuffé, bowlinghall restaurang",
    canonical: "https://markarydsbowling.se/menu",
    ogImage: "https://markarydsbowling.se/lovable-uploads/d8ae05f0-bff1-4c53-91fa-49db4627300c.png",
    jsonLd: [
      createBreadcrumbJsonLd([
        { name: "Hem", url: "https://markarydsbowling.se" },
        { name: "Meny", url: "https://markarydsbowling.se/menu" },
      ]),
      createWebPageJsonLd({
        name: "Meny – Mat & Dryck",
        description: "Meny med pizza, hamburgare och fajitasbuffé på Markaryds Bowlinghall.",
        url: "https://markarydsbowling.se/menu",
      }),
    ],
  });

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 px-4 overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10"></div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-background/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-primary/20">
            <ChefHat className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">Från kök till bord</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Vår
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Meny
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Smakfulla rätter och drycker för alla tillfällen – från snabba mellanmål till fullständiga måltider
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-5 h-5" />
              <span>Serveras dagligen</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5" />
              <span>Gruppbokningar välkomnas</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">

          {/* Menu from Database */}
          <div className="mb-16">
            <MenuSection />
          </div>

          {/* Bottom Info */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">Praktisk Information</h3>
                  <div className="grid md:grid-cols-2 gap-6 text-muted-foreground">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">🥡 BESTÄLLA MAT FÖR AVHÄMTNING</h4>
                      <p>Ring oss för förbeställning och bekväm avhämtning</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">⚠️ ALLERGIER? RÅDFRÅGA PERSONALEN</h4>
                      <p>Vi hjälper gärna till med allergiinformation</p>
                    </div>
                  </div>
                  <Button className="mt-6" size="lg">
                    Kontakta oss för beställning
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Menu;