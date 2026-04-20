import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSEO, createBreadcrumbJsonLd, createWebPageJsonLd } from "@/hooks/useSEO";

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
              href="https://scoring.bowlres.se/markaryd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              Öppna Helskärm
            </a>
          </div>
          <div className="w-full h-[800px] border border-border rounded-lg overflow-hidden">
            <iframe
              src="https://scoring.bowlres.se/markaryd"
              className="w-full h-full"
              title="Live Bowling Resultat"
              allowFullScreen
            />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Livescore;