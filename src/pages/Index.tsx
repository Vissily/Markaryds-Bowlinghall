import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BookingSection from "@/components/BookingSection";
import About from "@/components/About";
import GallerySection from "@/components/GallerySection";
import Activities from "@/components/Activities";
import Hours from "@/components/Hours";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  // SEO optimization for homepage
  useSEO({
    title: "Markaryds Bowlinghall - Bowling, Padel & Minigolf i Markaryd",
    description: "Markaryds Bowlinghall - Bowlinghall, padel, minigolf, dart och shuffleboard i Markaryd. Öppet 7 dagar i veckan. Boka din aktivitet redan idag!",
    keywords: "bowling, padel, minigolf, dart, shuffleboard, markaryd, bowlinghall, aktiviteter, sport, familj, underhållning",
    canonical: "https://markarydsbowling.se"
  });
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <BookingSection />
      <About />
      <GallerySection />
      <Activities />
      <Hours />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;
