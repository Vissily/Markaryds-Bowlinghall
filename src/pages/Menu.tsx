import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Menu = () => {
  const appetizers = [
    { name: "PUBTALLRIK", price: 60, description: "Nachochips, lökrigar, mozzarellasticks, chili chicken & vitlöksås" },
    { name: "POMMESTALLRIK", price: 30, description: "" },
    { name: "NACHOCHIPS", price: 40, description: "ost & dippa" },
    { name: "OST & SKINKTOAST", price: 40, description: "sallad & dressing" },
    { name: "RÄKMACKA", price: 60, description: "" }
  ];

  const mainDishes = [
    { name: "KALVSNITZEL", price: 160, description: "Stekt potatis & bearnaisesås" },
    { name: "ANGUSBURGARE", price: 140, description: "200g nötkött, ost & bacon, pommes och bbq-sås" },
    { name: "HAMBURGERTALLRIK", price: 90, description: "90g nötkött, dressing, sallad, gurka, tomat och pommes" },
    { name: "HALLOUMIBURGARE", price: 110, description: "dressing, sallad, gurka, tomat, ostskiva, majo och pommes" },
    { name: "KYCKLINGSPETT", price: 110, description: "med pommes & bbq-sås" },
    { name: "SPÅTTA", price: 95, description: "med stekt potatis & remoulad sås" },
    { name: "SPAGETTI BOLOGNESE", price: 80, description: "" },
    { name: "NUGGETSTALLRIK", price: 80, description: "" },
    { name: "RÄKBOMB", price: 125, description: "" },
    { name: "SALLAD", price: 95, description: "välj mellan räk, kyckling el. halloumi" }
  ];

  const kidsMenu = [
    { name: "HAMBURGERTALLRIK", price: 60, description: "" },
    { name: "NUGGETSTRALRIK", price: 60, description: "" },
    { name: "KYCKLINGSPETT M.POMMES", price: 60, description: "" },
    { name: "SPAGETTI BOLOGNESE", price: 60, description: "" }
  ];

  const desserts = [
    { name: "VANILJGLASS", price: 40, description: "med chokladsås" },
    { name: "BROWNIE", price: 45, description: "med vaniljglass" }
  ];

  const fajitasBuffet = {
    name: "FAJITASBUFFÉ",
    price: "145 / 95",
    description: "Minst 15 personer och förbokning, pris avser vuxen / barn exkl dricka"
  };

  const drinks = [
    { category: "ALKOHOLFRITT", items: [
      { name: "LÄSK", price: 25, description: "Cola Cola, Cola Zero, Fanta, Sprite" },
      { name: "ALKOHOLFRITT", price: 25, description: "Öl Carlsberg, Cider Päron" },
      { name: "MER/FESTIS", price: 25, description: "Apelsin, Päron, Äpple Hallon/Svart vinbär, Cactus lime" },
      { name: "POWERADE, NOCCO, VITAMIN WELL", price: 25, description: "" },
      { name: "REDBULL", price: 20, description: "" },
      { name: "AQUA", price: 15, description: "Citron, Naturell, Hallon/Fläder" },
      { name: "KAFFE/TE", price: 10, description: "" }
    ]},
    { category: "ALKOHOL", items: [
      { name: "50 CL STARKÖL", price: 63, description: "Mariestads, Eriksberg, Norrlands Guld, Bryggmästarens" },
      { name: "33 CL STARKÖL", price: 52, description: "Carlsberg, Heineken" },
      { name: "PROSECCO", price: 79, description: "" },
      { name: "IPA", price: 64, description: "Lagunitas, Hard Hittin'" },
      { name: "VIN", price: 65, description: "Quiet life Chardonnay vitt, Quiet Life Shiraz rött" },
      { name: "CIDER", price: 60, description: "Smirnoff Ice, Breezer, Crush jordgubb 7%" },
      { name: "Mango Passion, Päron", price: 58, description: "" },
      { name: "FATÖL HOLBA", price: "48/59", description: "Liten 0,25, Stor 0,4" },
      { name: "GLUTENFRI ÖL", price: 50, description: "Crocodil" }
    ]},
    { category: "GROGGAR", items: [
      { name: "4CL", price: 95, description: "" },
      { name: "6CL", price: 130, description: "" },
      { description: "Rom & Cola, Redbull Vodka, Gin & Tonic, Jäger Redbull, Nocco Vodka", price: "", name: "" }
    ]},
    { category: "DRINKAR", items: [
      { name: "Rosa Pantern, Orgasm, Blue Lagoon, Calippo Cola, White Russian, Piggelin", price: 120, description: "" },
      { name: "IRISH COFFE, KAFFE KARLSSON", price: 110, description: "" }
    ]}
  ];

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Meny
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Välkommen att smaka på våra drycker och läckra rätter
            </p>
          </div>

          <div className="grid gap-8">
            {/* Förrätter */}
            <Card className="overflow-hidden shadow-card">
              <CardHeader className="bg-gradient-primary text-primary-foreground">
                <CardTitle className="text-2xl font-bold">FÖRRÄTTER</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {appetizers.map((item, index) => (
                    <div key={index} className="flex justify-between items-start border-b border-border pb-4 last:border-b-0">
                      <div>
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                      <span className="text-lg font-bold text-foreground">{item.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Huvudrätter */}
            <Card className="overflow-hidden shadow-card">
              <CardHeader className="bg-gradient-secondary text-secondary-foreground">
                <CardTitle className="text-2xl font-bold">HUVUDRÄTTER</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {mainDishes.map((item, index) => (
                    <div key={index} className="flex justify-between items-start border-b border-border pb-4 last:border-b-0">
                      <div>
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                      <span className="text-lg font-bold text-foreground">{item.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Barnmeny */}
            <Card className="overflow-hidden shadow-card">
              <CardHeader className="bg-gradient-primary text-primary-foreground">
                <CardTitle className="text-2xl font-bold">BARNMENY</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {kidsMenu.map((item, index) => (
                    <div key={index} className="flex justify-between items-start border-b border-border pb-4 last:border-b-0">
                      <div>
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                      </div>
                      <span className="text-lg font-bold text-foreground">{item.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fajitas Buffé */}
            <Card className="overflow-hidden shadow-card">
              <CardHeader className="bg-gradient-secondary text-secondary-foreground">
                <CardTitle className="text-2xl font-bold">FAJITASBUFFÉ</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground">{fajitasBuffet.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{fajitasBuffet.description}</p>
                  </div>
                  <span className="text-lg font-bold text-foreground">{fajitasBuffet.price}</span>
                </div>
              </CardContent>
            </Card>

            {/* Desserter */}
            <Card className="overflow-hidden shadow-card">
              <CardHeader className="bg-gradient-primary text-primary-foreground">
                <CardTitle className="text-2xl font-bold">DESSERTER</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {desserts.map((item, index) => (
                    <div key={index} className="flex justify-between items-start border-b border-border pb-4 last:border-b-0">
                      <div>
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                      <span className="text-lg font-bold text-foreground">{item.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Drycker */}
            <div className="grid md:grid-cols-2 gap-6">
              {drinks.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="overflow-hidden shadow-card">
                  <CardHeader className="bg-gradient-primary text-primary-foreground">
                    <CardTitle className="text-xl font-bold">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-3">
                      {category.items.map((item, index) => (
                        <div key={index} className="border-b border-border pb-3 last:border-b-0">
                          {item.name && (
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-foreground">{item.name}</h4>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                )}
                              </div>
                              {item.price && (
                                <span className="font-bold text-foreground">{item.price}</span>
                              )}
                            </div>
                          )}
                          {!item.name && item.description && (
                            <p className="text-sm text-muted-foreground italic">{item.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              <strong>#BESTÄLLA MAT FÖR AVHÄMTNING</strong><br />
              <strong>#ALLERGIER? RÅDFRÅGA PERSONALEN</strong>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Menu;