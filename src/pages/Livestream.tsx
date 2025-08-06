import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LivestreamSection from "@/components/LivestreamSection";

const Livestream = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <LivestreamSection />
      <Footer />
    </main>
  );
};

export default Livestream;