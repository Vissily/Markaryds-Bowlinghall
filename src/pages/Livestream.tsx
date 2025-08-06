import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LivestreamSection from "@/components/LivestreamSection";
import { useSEO } from "@/hooks/useSEO";

const Livestream = () => {
  // SEO optimization for livestream page
  useSEO({
    title: "Livestream - Markaryds Bowlinghall | Se Bowling Live",
    description: "Följ bowlingmatcher och turneringar live från Markaryds Bowlinghall. Se våra livestreams av tävlingar och specialevent direkt här.",
    keywords: "livestream, bowling live, tävlingar, turneringar, markaryd bowlinghall, live streaming",
    canonical: "https://markarydsbowling.se/livestream"
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