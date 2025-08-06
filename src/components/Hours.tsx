import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, ExternalLink, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OpeningHour {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

const Hours = () => {
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOpeningHours = async () => {
      try {
        const { data, error } = await supabase
          .from('opening_hours')
          .select('*')
          .order('day_of_week');

        if (error) throw error;
        setOpeningHours(data || []);
      } catch (error) {
        console.error('Error loading opening hours:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOpeningHours();
  }, []);

  const getDayName = (dayOfWeek: number) => {
    const days = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
    return days[dayOfWeek];
  };

  const getCurrentDayOfWeek = () => {
    return new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  };

  const getTodaysHours = () => {
    const today = getCurrentDayOfWeek();
    return openingHours.find(hour => hour.day_of_week === today);
  };

  const formatTime = (time: string | null) => {
    if (!time) return '';
    if (time === '24:00' || time === '00:00:00') return '00:00';
    // Remove seconds from time format (e.g., "10:00:00" -> "10:00")
    return time.substring(0, 5);
  };

  if (loading) {
    return (
      <section id="oppettider" className="py-20 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p>Laddar öppettider...</p>
          </div>
        </div>
      </section>
    );
  }

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
            
          {/* Today's Hours Highlight */}
          {(() => {
            const todaysHours = getTodaysHours();
            if (todaysHours) {
              return (
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-4 bg-primary/10 rounded-lg px-6 py-4 border border-primary/20">
                    <div className="text-sm text-muted-foreground">
                      <strong>Idag ({getDayName(todaysHours.day_of_week)})</strong>
                    </div>
                    <div className="font-mono text-xl font-bold text-primary">
                      {todaysHours.is_closed ? 'Stängt' : `${formatTime(todaysHours.open_time)} - ${formatTime(todaysHours.close_time)}`}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-4 bg-muted rounded-lg px-6 py-4">
                  <div className="text-sm text-muted-foreground">
                    <strong>Öppetider laddas...</strong>
                  </div>
                </div>
              </div>
            );
          })()}
          
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
                {openingHours.map((hour) => (
                  <div key={hour.day_of_week} className="flex justify-between items-start py-3 border-b border-border last:border-b-0">
                    <div>
                      <div className="font-semibold text-foreground">{getDayName(hour.day_of_week)}</div>
                      {(hour.day_of_week === 5 || hour.day_of_week === 6) && (
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Bowlingbanorna stänger 22:00
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-foreground">
                        {hour.is_closed ? 'Stängt' : `${formatTime(hour.open_time)} - ${formatTime(hour.close_time)}`}
                      </div>
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