import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";

const Markarydsligan = () => {
  const [activeSeries, setActiveSeries] = useState("serie-a");

  // SEO optimization for markarydsligan page
  useSEO({
    title: "Markarydsligan - Bowlingserier | Markaryds Bowlinghall",
    description: "Följ Markarydsligan med våra 5 bowlingserier - Serie A, B, C, D och E. Se tabeller, resultat och anmäl ditt lag för säsongen.",
    keywords: "markarydsligan, bowlingserier, serie a, serie b, serie c, bowling liga, markaryd, bowlinghall",
    canonical: "https://markarydsbowling.se/markarydsligan"
  });

  const series = [
    {
      id: "serie-a",
      name: "Serie A",
      description: "Högsta divisionen med de mest rutinerade lagen",
      teams: "12 lag",
      schedule: "Onsdagar 19:00"
    },
    {
      id: "serie-b", 
      name: "Serie B",
      description: "Andra divisionen för erfarna spelare",
      teams: "12 lag",
      schedule: "Torsdagar 19:00"
    },
    {
      id: "serie-c",
      name: "Serie C", 
      description: "Tredje divisionen för utvecklande spelare",
      teams: "10 lag",
      schedule: "Tisdagar 19:00"
    },
    {
      id: "serie-d",
      name: "Serie D",
      description: "Fjärde divisionen för nybörjare och motionärer",
      teams: "10 lag",
      schedule: "Måndagar 19:00"
    },
    {
      id: "serie-e",
      name: "Serie E",
      description: "Ungdomsserie för spelare under 18 år",
      teams: "8 lag", 
      schedule: "Lördagar 14:00"
    }
  ];

  const currentSeries = series.find(s => s.id === activeSeries);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Markarydsligan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Välkommen till Markarydsligan - vår lokala bowlingserie med fem divisioner för alla nivåer
            </p>
          </div>

          {/* Series Selection Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {series.map((serie) => (
              <Button
                key={serie.id}
                variant={activeSeries === serie.id ? "default" : "outline"}
                size="lg"
                className="rounded-full px-6 py-3 font-semibold"
                onClick={() => setActiveSeries(serie.id)}
              >
                {serie.name}
              </Button>
            ))}
          </div>

          {/* Active Series Content */}
          {currentSeries && (
            <Card className="max-w-4xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">{currentSeries.name}</CardTitle>
                <CardDescription className="text-lg">
                  {currentSeries.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Antal lag</h3>
                    <p className="text-2xl font-bold text-primary">{currentSeries.teams}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Speltider</h3>
                    <p className="text-2xl font-bold text-primary">{currentSeries.schedule}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Säsong</h3>
                    <p className="text-2xl font-bold text-primary">2024/2025</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4 text-center">Information</h3>
                  <div className="prose max-w-none text-center space-y-4">
                    <p>
                      Serien pågår från september till maj med en kort juluppehåll. 
                      Varje lag spelar hemma och borta mot alla andra lag i serien.
                    </p>
                    <p>
                      För mer information om anmälan, regler och spelschema, kontakta oss på telefon eller mejl.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-6">
                  <Button size="lg" asChild>
                    <a href="/#kontakt">
                      Kontakta oss
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href="/livescore">
                      Se resultat
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Markarydsligan;