import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const Livescore = () => {
  // SEO optimization for livescore page
  useSEO({
    title: "Livescore - Markaryds Bowlinghall | Poäng och Resultat Live",
    description: "Följ live-resultat och poäng från tävlingar och matcher på Markaryds Bowlinghall. Se aktuella ställningar i realtid.",
    keywords: "livescore, bowling resultat, live poäng, tävlingar, markaryd bowlinghall, lanetalk",
    canonical: "https://markarydsbowling.se/livescore"
  });

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Live Resultat</h1>
            <a
              href="https://livescoring.lanetalk.com/viking/index.html?uuid=74a4d364-b1cc-11e4-ab94-0050569337ac"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              Öppna Helskärm
            </a>
          </div>
          <div className="w-full h-[800px] border border-border rounded-lg overflow-hidden">
            <iframe
              src="https://livescoring.lanetalk.com/viking/index.html?uuid=74a4d364-b1cc-11e4-ab94-0050569337ac"
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