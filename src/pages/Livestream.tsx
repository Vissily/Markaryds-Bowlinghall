import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LivestreamSection from "@/components/LivestreamSection";
import { useSEO, createBreadcrumbJsonLd, createWebPageJsonLd } from "@/hooks/useSEO";

const Livestream = () => {
  useSEO({
    title: "Livestream – Se Bowling Live | Markaryds Bowlinghall",
    description: "Följ bowlingmatcher och turneringar live från Markaryds Bowlinghall. Streama tävlingar och specialevent direkt i webbläsaren.",
    keywords: "bowling livestream, bowling live markaryd, streama bowling, bowling tävling live",
    canonical: "https://markarydsbowling.se/livestream",
    ogImage: "https://markarydsbowling.se/lovable-uploads/d8ae05f0-bff1-4c53-91fa-49db4627300c.png",
    jsonLd: [
      createBreadcrumbJsonLd([
        { name: "Hem", url: "https://markarydsbowling.se" },
        { name: "Livestream", url: "https://markarydsbowling.se/livestream" },
      ]),
      createWebPageJsonLd({
        name: "Livestream",
        description: "Följ bowlingmatcher och turneringar live från Markaryds Bowlinghall.",
        url: "https://markarydsbowling.se/livestream",
      }),
    ],
  });

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <LivestreamSection />
      <Footer />
    </main>
  );
};

export default Livestream;
