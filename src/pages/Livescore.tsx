import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSEO, createBreadcrumbJsonLd, createWebPageJsonLd } from "@/hooks/useSEO";
import { ExternalLink } from "lucide-react";
import KimsoftOverlay from "@/components/KimsoftOverlay";

const SCORING_URL = "https://markaryds.bowlingscoring.se/";

const Livescore = () => {
  useSEO({
    title: "Livescore – Resultat i Realtid | Markaryds Bowlinghall",
    description: "Följ bowlingresultat live från Markaryds Bowlinghall. Se aktuella poängställningar från tävlingar och matcher i realtid.",
    keywords: "bowling livescore, live resultat bowling, bowling poäng, tävlingsresultat markaryd",
    canonical: "https://markarydsbowling.se/livescore",
    ogImage: "https://markarydsbowling.se/lovable-uploads/d8ae05f0-bff1-4c53-91fa-49db4627300c.png",
    jsonLd: [
      createBreadcrumbJsonLd([
        { name: "Hem", url: "https://markarydsbowling.se" },
        { name: "Livescore", url: "https://markarydsbowling.se/livescore" },
      ]),
      createWebPageJsonLd({
        name: "Livescore",
        description: "Live bowlingresultat från Markaryds Bowlinghall.",
        url: "https://markarydsbowling.se/livescore",
      }),
    ],
  });

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Live Resultat</h1>
            <a
              href={SCORING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              Öppna Helskärm
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>
          <div className="mb-8">
            <KimsoftOverlay />
          </div>
          <div className="w-full border border-border rounded-lg bg-card p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Resultat i realtid
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Alla matcher och tävlingar visas på vår livescore-sida. Öppna den i
              en ny flik för att följa poängen direkt, eller visa den på
              storbildsskärmen i hallen.
            </p>
            <a
              href={SCORING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              Öppna live resultat
              <ExternalLink className="w-5 h-5 ml-3" />
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Livescore;
