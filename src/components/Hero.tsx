import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Calendar } from "lucide-react";
import heroImage from "@/assets/hero-bowling.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
          poster={heroImage}
        >
          <source src="https://www.markarydsbowling.se/wp-content/uploads/2022/10/markarydsbowling.mp4" type="video/mp4" />
          <img 
            src={heroImage} 
            alt="Markaryds Bowlinghall interiör" 
            className="w-full h-full object-cover"
          />
        </video>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-background/20 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-white/20">
            <Star className="w-4 h-4 text-secondary" />
            <span className="text-white font-medium">Sedan 2013</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Markaryds
            <span className="block text-secondary">Bowlinghall</span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Mer än bara bowling – upplev padel, minigolf, dart och shuffleboard 
            i Smålands modernaste aktivitetshall
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button variant="hero" size="xl" className="group" asChild>
              <a href="#activities">
                Boka Din Aktivitet
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button variant="outline" size="xl" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-primary" asChild>
              <a href="#activities">
                Se Aktiviteter
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-secondary mr-2" />
                <span className="text-3xl font-bold text-white">450</span>
              </div>
              <p className="text-white/80">Spelare per vecka</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6 text-secondary mr-2" />
                <span className="text-3xl font-bold text-white">70</span>
              </div>
              <p className="text-white/80">Öppettimmar per vecka</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Star className="w-6 h-6 text-secondary mr-2" />
                <span className="text-3xl font-bold text-white">5</span>
              </div>
              <p className="text-white/80">Olika aktiviteter</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-secondary rounded-full animate-float opacity-60"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-white rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-40 left-20 w-3 h-3 bg-secondary rounded-full animate-float opacity-50" style={{animationDelay: '2s'}}></div>
    </section>
  );
};

export default Hero;