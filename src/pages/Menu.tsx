import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuSection from "@/components/MenuSection";
import { ChefHat, Clock, Users, Star } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const Menu = () => {
  // SEO optimization for menu page
  useSEO({
    title: "Meny & Priser - Markaryds Bowlinghall | Mat & Dryck",
    description: "Se vår meny med pizza, hamburgare, tilltugg och dryck. Specialpris på fajitasbuffé för grupper. Beställ mat till din bowling- eller padelupplevelse i Markaryd.",
    keywords: "meny, mat, pizza, hamburgare, fajitas, buffé, dryck, markaryd bowlinghall, restaurang",
    canonical: "https://markarydsbowling.se/menu"
  });
  const specialOffer = {
    title: "FAJITASBUFFÉ",
    price: "145 / 95",
    description: "Minst 15 personer och förbokning, pris avser vuxen / barn exkl dricka",
    features: ["All you can eat", "Kött & vegetariskt", "Tillbehör ingår", "Perfekt för grupper"]
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
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
          
          {/* Special Offer Highlight */}
          <div className="mb-16">
            <Card className="overflow-hidden shadow-elegant border-0 bg-gradient-to-r from-orange-500/10 to-red-500/10">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardTitle className="text-3xl font-bold flex items-center gap-3">
                  <Star className="w-8 h-8" />
                  {specialOffer.title}
                  <span className="ml-auto text-2xl">{specialOffer.price}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-lg text-foreground mb-6">{specialOffer.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {specialOffer.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-foreground font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

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