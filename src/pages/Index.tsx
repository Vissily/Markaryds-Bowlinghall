import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BookingSection from "@/components/BookingSection";
import About from "@/components/About";
import GallerySection from "@/components/GallerySection";
import Activities from "@/components/Activities";
import FeaturedEvents from "@/components/FeaturedEvents";
import Hours from "@/components/Hours";
import Contact from "@/components/Contact";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";
import { useSEO, createBreadcrumbJsonLd } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "Markaryds Bowlinghall – Bowling, Padel & Minigolf i Markaryd",
    description: "Upplev bowling, padel, minigolf, dart och shuffleboard på Markaryds Bowlinghall. Öppet 7 dagar i veckan – boka online idag!",
    keywords: "bowling markaryd, padel markaryd, minigolf markaryd, bowlinghall, aktiviteter markaryd, familjeaktiviteter småland",
    canonical: "https://markarydsbowling.se",
    ogImage: "https://markarydsbowling.se/lovable-uploads/d8ae05f0-bff1-4c53-91fa-49db4627300c.png",
    jsonLd: createBreadcrumbJsonLd([
      { name: "Hem", url: "https://markarydsbowling.se" },
    ]),
  });

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <BookingSection />
      <ReviewsSection />
      <FeaturedEvents />
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
