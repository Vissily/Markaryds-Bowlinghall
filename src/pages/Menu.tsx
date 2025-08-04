import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChefHat, Wine, Coffee, Star, Clock, Users } from "lucide-react";

const Menu = () => {
  const menuCategories = [
    {
      title: "FÖRRÄTTER",
      icon: ChefHat,
      gradient: "from-orange-500 to-red-500",
      items: [
        { name: "PUBTALLRIK", price: 60, description: "Nachochips, lökrigar, mozzarellasticks, chili chicken & vitlöksås", popular: true },
        { name: "POMMESTALLRIK", price: 30, description: "Knapriga pommes frites med valfri dip" },
        { name: "NACHOCHIPS", price: 40, description: "Krispiga nachos med ost & dippa" },
        { name: "OST & SKINKTOAST", price: 40, description: "Varm toast med sallad & dressing" },
        { name: "RÄKMACKA", price: 60, description: "Klassisk räkmacka på färskt bröd" }
      ]
    },
    {
      title: "HUVUDRÄTTER", 
      icon: ChefHat,
      gradient: "from-green-500 to-emerald-500",
      items: [
        { name: "KALVSNITZEL", price: 160, description: "Stekt potatis & bearnaisesås", popular: true },
        { name: "ANGUSBURGARE", price: 140, description: "200g nötkött, ost & bacon, pommes och bbq-sås", popular: true },
        { name: "HAMBURGERTALLRIK", price: 90, description: "90g nötkött, dressing, sallad, gurka, tomat och pommes" },
        { name: "HALLOUMIBURGARE", price: 110, description: "Vegetarisk med dressing, sallad, gurka, tomat, ostskiva & pommes" },
        { name: "KYCKLINGSPETT", price: 110, description: "Marinerade spett med pommes & bbq-sås" },
        { name: "SPÅTTA", price: 95, description: "Färsk fisk med stekt potatis & remoulad sås" },
        { name: "SPAGETTI BOLOGNESE", price: 80, description: "Klassisk köttfärssås med parmesan" },
        { name: "NUGGETSTALLRIK", price: 80, description: "Knapriga kycklingnuggets med pommes" },
        { name: "RÄKBOMB", price: 125, description: "Husets specialitet med färska räkor" },
        { name: "SALLAD", price: 95, description: "Välj mellan räk, kyckling eller halloumi" }
      ]
    },
    {
      title: "BARNMENY",
      icon: Star,
      gradient: "from-yellow-500 to-orange-500", 
      items: [
        { name: "HAMBURGERTALLRIK", price: 60, description: "Perfekt storlek för barn" },
        { name: "NUGGETSTALLRIK", price: 60, description: "Barnfavorit med pommes" },
        { name: "KYCKLINGSPETT M.POMMES", price: 60, description: "Mild marinering, perfekt för barn" },
        { name: "SPAGETTI BOLOGNESE", price: 60, description: "Mild köttfärssås" }
      ]
    },
    {
      title: "DESSERTER",
      icon: Coffee,
      gradient: "from-pink-500 to-purple-500",
      items: [
        { name: "VANILJGLASS", price: 40, description: "Kreamy vaniljglass med chokladsås" },
        { name: "BROWNIE", price: 45, description: "Varm brownie med vaniljglass" }
      ]
    }
  ];

  const drinkCategories = [
    {
      title: "ALKOHOLFRITT",
      gradient: "from-blue-500 to-cyan-500",
      items: [
        { name: "LÄSK", price: 25, description: "Cola Cola, Cola Zero, Fanta, Sprite" },
        { name: "ALKOHOLFRITT ÖL", price: 25, description: "Carlsberg, Cider Päron" },
        { name: "MER/FESTIS", price: 25, description: "Apelsin, Päron, Äpple Hallon/Svart vinbär, Cactus lime" },
        { name: "ENERGIDRYCKER", price: 25, description: "Powerade, Nocco, Vitamin Well" },
        { name: "REDBULL", price: 20, description: "Klassisk energidryck" },
        { name: "VATTEN", price: 15, description: "Citron, Naturell, Hallon/Fläder" },
        { name: "KAFFE/TE", price: 10, description: "Nybryggt kaffe eller te" }
      ]
    },
    {
      title: "ALKOHOL",
      gradient: "from-purple-500 to-indigo-500",
      items: [
        { name: "STARKÖL 50CL", price: 63, description: "Mariestads, Eriksberg, Norrlands Guld, Bryggmästarens" },
        { name: "STARKÖL 33CL", price: 52, description: "Carlsberg, Heineken" },
        { name: "PROSECCO", price: 79, description: "Mousserande vin" },
        { name: "IPA", price: 64, description: "Lagunitas, Hard Hittin'" },
        { name: "VIN", price: 65, description: "Quiet Life Chardonnay vitt, Quiet Life Shiraz rött" },
        { name: "CIDER", price: 60, description: "Smirnoff Ice, Breezer, Crush jordgubb 7%" },
        { name: "FATÖL HOLBA", price: "48/59", description: "Liten 0,25 / Stor 0,4" },
        { name: "GLUTENFRI ÖL", price: 50, description: "Crocodil" }
      ]
    }
  ];

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

          {/* Food Menu */}
          <div className="grid gap-8 mb-16">
            {menuCategories.map((category, categoryIndex) => {
              const IconComponent = category.icon;
              return (
                <Card key={categoryIndex} className="overflow-hidden shadow-elegant border-0">
                  <CardHeader className={`bg-gradient-to-r ${category.gradient} text-white`}>
                    <CardTitle className="text-3xl font-bold flex items-center gap-3">
                      <IconComponent className="w-8 h-8" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid gap-6">
                      {category.items.map((item, index) => (
                        <div key={index} className="relative group">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-xl text-foreground">{item.name}</h3>
                                {item.popular && (
                                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                                    Populär
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-bold text-foreground">{item.price}</span>
                              <span className="text-muted-foreground ml-1">kr</span>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50"></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Drinks Menu */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-center text-foreground mb-12">Drycker</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {drinkCategories.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="overflow-hidden shadow-elegant border-0">
                  <CardHeader className={`bg-gradient-to-r ${category.gradient} text-white`}>
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                      <Wine className="w-6 h-6" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {category.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{item.name}</h4>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                          </div>
                          <span className="font-bold text-foreground whitespace-nowrap">{item.price} kr</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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