import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";

const Markarydsligan = () => {
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
      url: "https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8693&fromAdmin=1",
      schedule: "Måndag 19:00"
    },
    {
      id: "serie-b", 
      name: "Serie B",
      url: "https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8694&fromAdmin=1",
      schedule: "Tis 19:30"
    },
    {
      id: "serie-c",
      name: "Serie C", 
      url: "https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8695&fromAdmin=1",
      schedule: "Mån 18:00"
    },
    {
      id: "serie-d",
      name: "Serie D",
      url: "https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8696&fromAdmin=1",
      schedule: "Tis 17:30"
    },
    {
      id: "serie-e",
      name: "Serie E",
      url: "https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8697&fromAdmin=1",
      schedule: "Tis 18:30"
    },
    {
      id: "55-grupp-1",
      name: "55+ Grupp 1",
      url: "https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8822&fromAdmin=1",
      schedule: "Torsdagar 14:00"
    },
    {
      id: "55-grupp-2", 
      name: "55+ Grupp 2",
      url: "https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8823&fromAdmin=1",
      schedule: "Torsdagar 15:30"
    }
  ];

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

          {/* Series Buttons with Schedule */}
          <div className="max-w-4xl mx-auto space-y-6">
            {series.map((serie) => (
              <div key={serie.id} className="flex flex-col sm:flex-row items-center justify-between bg-card p-6 rounded-lg border">
                <div className="text-center sm:text-left mb-4 sm:mb-0">
                  <h2 className="text-2xl font-bold text-foreground mb-2">{serie.name}</h2>
                  <p className="text-lg text-muted-foreground">{serie.schedule}</p>
                </div>
                <Button 
                  size="lg" 
                  className="rounded-full px-8 py-3 font-semibold"
                  asChild
                >
                  <a href={serie.url} target="_blank" rel="noopener noreferrer">
                    Se tabell & resultat
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Markarydsligan;