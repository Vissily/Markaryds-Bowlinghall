import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BookingSection from "@/components/BookingSection";
import About from "@/components/About";
import Activities from "@/components/Activities";
import Hours from "@/components/Hours";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <BookingSection />
      <About />
      <Activities />
      <Hours />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;
