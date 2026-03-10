import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventsSection from "@/components/EventsSection";
import { useSEO, createBreadcrumbJsonLd, createWebPageJsonLd } from "@/hooks/useSEO";

const Events = () => {
  useSEO({
    title: "Evenemang & Turneringar – Markaryds Bowlinghall",
    description: "Se kommande bowlingturneringar, livematcher och events på Markaryds Bowlinghall. Anmäl dig online eller registrera intresse.",
    keywords: "bowling evenemang markaryd, bowlingturneringar, bowling tävling, livematch bowling, event markaryd",
    canonical: "https://markarydsbowling.se/events",
    ogImage: "https://markarydsbowling.se/lovable-uploads/d8ae05f0-bff1-4c53-91fa-49db4627300c.png",
    jsonLd: [
      createBreadcrumbJsonLd([
        { name: "Hem", url: "https://markarydsbowling.se" },
        { name: "Evenemang", url: "https://markarydsbowling.se/events" },
      ]),
      createWebPageJsonLd({
        name: "Evenemang & Turneringar",
        description: "Kommande bowlingturneringar och evenemang på Markaryds Bowlinghall.",
        url: "https://markarydsbowling.se/events",
      }),
    ],
  });

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <EventsSection />
      <Footer />
    </main>
  );
};

export default Events;
