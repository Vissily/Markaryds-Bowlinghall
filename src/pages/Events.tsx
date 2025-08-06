import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventsSection from "@/components/EventsSection";
import { useSEO } from "@/hooks/useSEO";

const Events = () => {
  // SEO optimization for events page
  useSEO({
    title: "Evenemang & Turneringar - Markaryds Bowlinghall | Bowling Events",
    description: "Kommande bowlingturneringar och evenemang på Markaryds Bowlinghall. Anmäl dig till våra tävlingar och specialevent. Se schema och anmälningsinfo.",
    keywords: "evenemang, turneringar, bowling, tävling, markaryd, bowlinghall, anmälan, event",
    canonical: "https://markarydsbowling.se/events"
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