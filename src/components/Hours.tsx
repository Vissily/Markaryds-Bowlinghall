import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, ExternalLink, AlertCircle } from "lucide-react";

const Hours = () => {
  const schedule = [
    { day: "Måndag - Tisdag", hours: "10:00 - 20:00" },
    { day: "Onsdag - Torsdag", hours: "10:00 - 21:00" },
    { day: "Fredag", hours: "10:00 - 00:00", note: "Bowlingbanorna stänger 22:00" },
    { day: "Lördag", hours: "15:00 - 23:00", note: "Bowlingbanorna stänger 22:00" },
    { day: "Söndag", hours: "11:00 - 16:00" }
  ];

  return (
    <section id="oppettider" className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-accent rounded-full px-4 py-2 mb-6">
              <Clock className="w-4 h-4 text-accent-foreground" />
              <span className="text-accent-foreground font-medium">Öppettider</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Öppet 7 Dagar i Veckan
            </h2>
            <p className="text-xl text-muted-foreground">
              Nästan 70 timmars öppettid för maximal flexibilitet
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Schedule Card */}
            <Card className="p-8 shadow-card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Öppettider</h3>
              </div>

              <div className="space-y-4">
                {schedule.map((item, index) => (
                  <div key={index} className="flex justify-between items-start py-3 border-b border-border last:border-b-0">
                    <div>
                      <div className="font-semibold text-foreground">{item.day}</div>
                      {item.note && (
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {item.note}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-foreground">{item.hours}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-accent/50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-accent-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-accent-foreground">
                    <strong>Observera:</strong> Vid låg beläggning kan hallen stänga tidigare än angivna tider.
                  </p>
                </div>
              </div>
            </Card>

            {/* Booking Card */}
            <Card className="p-8 shadow-card bg-gradient-primary text-primary-foreground">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4">Boka Din Tid</h3>
                <p className="mb-8 opacity-90">
                  Säkra din tid på bowlingbanan eller padelcourten. 
                  Snabb och enkel bokning online.
                </p>

                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary group"
                    asChild
                  >
                    <a href="https://secure.meriq.com/markaryd/" target="_blank" rel="noopener noreferrer">
                      Boka Bowling
                      <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>

                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary group"
                    asChild
                  >
                    <a href="https://playtomic.com/clubs/padel-i-markaryd-markaryd" target="_blank" rel="noopener noreferrer">
                      Boka Padel
                      <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </div>

                <div className="mt-6 text-sm opacity-75">
                  Ring oss för bokning av minigolf, dart eller shuffleboard
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hours;