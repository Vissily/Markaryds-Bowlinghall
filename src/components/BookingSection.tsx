import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, ExternalLink, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const BookingSection = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <section id="booking" className="py-24 px-4 bg-gradient-primary">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Boka Din Upplevelse
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Reservera din tid enkelt och smidigt. Välj mellan våra olika aktiviteter och boka direkt online.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-primary-foreground">
            <CardHeader className="text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <CardTitle className="text-lg">Flexibla Tider</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-primary-foreground/80">
                Boka upp till 30 dagar i förväg och välj den tid som passar dig bäst
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-primary-foreground">
            <CardHeader className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <CardTitle className="text-lg">Grupper & Events</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-primary-foreground/80">
                Perfekt för kalas, företagsevent och gruppreservationer
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-primary-foreground">
            <CardHeader className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <CardTitle className="text-lg">Snabb & Enkel</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-primary-foreground/80">
                Konfirmera din bokning direkt och få bekräftelse via e-post
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
            <DialogTrigger asChild>
              <Button 
                size="xl" 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-lg px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Calendar className="w-6 h-6 mr-3" />
                Boka Nu - Markaryds Bowling
                <ExternalLink className="w-5 h-5 ml-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
              <DialogHeader className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl font-bold">Boka Din Aktivitet</DialogTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsBookingOpen(false)}
                    className="rounded-full w-8 h-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </DialogHeader>
              <div className="flex-1 p-0">
                <iframe
                  src="https://secure.meriq.com/markaryd/"
                  className="w-full h-full border-0"
                  title="Markaryds Bowling Booking System"
                  loading="lazy"
                />
              </div>
            </DialogContent>
          </Dialog>
          
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