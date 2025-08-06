import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, ExternalLink } from "lucide-react";

const BookingSection = () => {

  return (
    <section id="booking" className="py-24 px-4 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Boka Din Upplevelse
          </h2>
          <p className="text-xl text-white/95 max-w-2xl mx-auto drop-shadow-sm">
            Reservera din tid enkelt och smidigt. Välj mellan våra olika aktiviteter och boka direkt online.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/15 backdrop-blur-md border-white/30 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/20">
            <CardHeader className="text-center">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-secondary drop-shadow-md" />
              <CardTitle className="text-lg font-semibold">Flexibla Tider</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-white/90 leading-relaxed">
                Boka upp till 30 dagar i förväg och välj den tid som passar dig bäst
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/15 backdrop-blur-md border-white/30 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/20">
            <CardHeader className="text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-secondary drop-shadow-md" />
              <CardTitle className="text-lg font-semibold">Grupper & Events</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-white/90 leading-relaxed">
                Perfekt för kalas, företagsevent och gruppreservationer
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/15 backdrop-blur-md border-white/30 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/20">
            <CardHeader className="text-center">
              <Clock className="w-10 h-10 mx-auto mb-3 text-secondary drop-shadow-md" />
              <CardTitle className="text-lg font-semibold">Snabb & Enkel</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-white/90 leading-relaxed">
                Konfirmera din bokning direkt och få bekräftelse via e-post
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            size="xl" 
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-lg px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            asChild
          >
            <a 
              href="https://secure.meriq.com/markaryd/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Calendar className="w-6 h-6 mr-3" />
              Boka Nu - Markaryds Bowling
              <ExternalLink className="w-5 h-5 ml-3" />
            </a>
          </Button>
          
          <p className="mt-6 text-primary-foreground/70">
            Har du frågor om bokningen? 
            <a href="tel:+46433135177" className="text-secondary hover:text-secondary/80 underline ml-1">
              Ring oss på 0433-135 177
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;