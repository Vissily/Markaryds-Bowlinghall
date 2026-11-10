import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";
import { useBookingDialog, type BookingActivity } from "@/components/BookingDialog";


// Priser – ändra här vid behov
const PRICES = {
  bowling: "från 190 kr/tim",
  shuffleboard: "från 150 kr/tim",
  dart: "från 200 kr/tim",
};

const BOOKING_OPTIONS: {
  title: string; price: string; players: string; duration: string;
  description?: string; cta: string; activity: BookingActivity; image: string; imagePosition?: string;
}[] = [
  { title: "Bowling", price: PRICES.bowling, players: "1–24 spelare", duration: "1 h eller 2 h", cta: "Boka bowling", activity: "bowling", image: "/lovable-uploads/d025f527-67a2-4533-9f7c-5f9b721eeae3.png" },
  { title: "Shuffleboard", price: PRICES.shuffleboard, players: "1–8 spelare", duration: "1 h eller 2 h", cta: "Boka shuffleboard", activity: "shuffleboard", image: "/lovable-uploads/fa0932f5-a4ea-4727-abe1-889222f079a3.png" },
  { title: "Dart", price: PRICES.dart, players: "1–8 spelare", duration: "1 h eller 2 h", description: "Dart med Scolia – systemet håller koll på poängen åt er", cta: "Boka dart", activity: "dart", image: "/lovable-uploads/467dfd69-83bc-45f7-a2eb-8bd86e415a5b.png", imagePosition: "center 30%" },
];

const BookingSection = () => {
  const { bookingLinkProps } = useBookingDialog();

  return (
    <section id="booking" className="py-24 px-4 bg-card border-t-4 border-b-4 border-primary/20">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Boka Din Upplevelse
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Reservera din tid enkelt och smidigt. Välj mellan våra olika aktiviteter och boka direkt online.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-105 border-2">
            <CardHeader className="text-center">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-primary" />
              <CardTitle className="text-lg font-semibold text-card-foreground">Flexibla Tider</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                Boka upp till 30 dagar i förväg och välj den tid som passar dig bäst
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-105 border-2">
            <CardHeader className="text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-primary" />
              <CardTitle className="text-lg font-semibold text-card-foreground">Grupper & Events</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                Perfekt för kalas, företagsevent och gruppreservationer
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-105 border-2">
            <CardHeader className="text-center">
              <Clock className="w-10 h-10 mx-auto mb-3 text-primary" />
              <CardTitle className="text-lg font-semibold text-card-foreground">Snabb & Enkel</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                Konfirmera din bokning direkt och få bekräftelse via e-post
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {BOOKING_OPTIONS.map((option) => (
            <Card key={option.title} className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-2 flex flex-col">
              <div className="relative">
                <img
                  src={option.image}
                  alt={option.title}
                  loading="lazy"
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  style={option.imagePosition ? { objectPosition: option.imagePosition } : undefined}
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-1">{option.title}</h3>
                <p className="text-secondary font-semibold mb-3">{option.price}</p>
                {option.description && (
                  <p className="text-muted-foreground text-sm mb-3">{option.description}</p>
                )}
                <ul className="space-y-2 mb-6 flex-1">
                  {[option.players, option.duration].map((f) => (
                    <li key={f} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant="bowling" className="w-full group" asChild>
                  <a {...bookingLinkProps(option.activity)}>
                    {option.cta}
                    <Calendar className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Padel bokas via{" "}
            <a href="https://playtomic.com/clubs/padel-i-markaryd-markaryd" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-secondary/80 underline font-medium">
              Playtomic
            </a>
          </p>
          <p className="mt-6 text-muted-foreground">
            Har du frågor om bokningen? 
            <a href="tel:+46730740600" className="text-secondary hover:text-secondary/80 underline ml-1 font-medium">
              Ring oss på 0730-740 600
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
