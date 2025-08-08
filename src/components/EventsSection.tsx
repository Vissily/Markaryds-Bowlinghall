import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Calendar, Clock, Users, Trophy, Star, MapPin, Phone, Mail, ExternalLink, PlayCircle, Monitor } from "lucide-react";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  registration_deadline: string | null;
  registration_url: string | null;
  registration_email: string | null;
  registration_phone: string | null;
  max_participants: number | null;
  current_participants: number;
  price: number | null;
  event_type: string;
  status: string;
  featured: boolean;
  has_big_screen: boolean;
  image_url: string | null;
}

const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [interested, setInterested] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .in('status', ['upcoming', 'ongoing'])
        .order('event_date', { ascending: true });

      if (error) throw error;
      
      const allEvents = data || [];
      setEvents(allEvents);
      // featuredEvents borttaget - vi visar kategorier istället
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      upcoming: 'default',
      ongoing: 'secondary',
      completed: 'outline',
      cancelled: 'destructive'
    };
    
    const labels: Record<string, string> = {
      upcoming: 'Kommande',
      ongoing: 'Pågående',
      completed: 'Avslutad',
      cancelled: 'Inställd'
    };
    
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'tournament':
        return Trophy;
      case 'competition':
        return Star;
      case 'livematch':
        return PlayCircle;
      default:
        return Calendar;
    }
  };
  const isRegistrationOpen = (event: Event) => {
    if (!event.registration_deadline) return true;
    return new Date(event.registration_deadline) > new Date();
  };

  const registerInterest = async (eventId: string) => {
    try {
      const { error, data } = await supabase.functions.invoke('register-interest', {
        body: { eventId },
      });
      if (error) throw error;
      setInterested(prev => ({ ...prev, [eventId]: true }));
      toast.success('Tack! Vi har registrerat ditt intresse.');
    } catch (err) {
      console.error('Interest error', err);
      toast.error('Kunde inte registrera intresse. Försök igen senare.');
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p>Laddar evenemang...</p>
          </div>
        </div>
      </section>
    );
  }

  const groupedByType = events.reduce<Record<string, Event[]>>((acc, e) => {
    const key = e.event_type || 'övrigt';
    (acc[key] ||= []).push(e);
    return acc;
  }, {});

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Kommande Evenemang
            </h2>
            <p className="text-xl text-muted-foreground">
              Upptäck våra turneringar och aktiviteter
            </p>
          </div>


          {/* Alla evenemang per kategori */}
          {events.length > 0 && (
            <div className="mb-16">
              {Object.entries(groupedByType).map(([type, list]) => {
                const typeLabels: Record<string, string> = { livematch: 'Livematch', tournament: 'Turnering', competition: 'Tävling' };
                const label = typeLabels[type] || type;
                const IconComponent = getEventTypeIcon(type);
                return (
                  <div key={type} className="mb-12">
                    <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
                      <IconComponent className="w-5 h-5 text-primary" /> {label}
                    </h3>
                    <div className="grid gap-4">
                      {list.map((event) => (
                        <Card key={event.id} className="shadow-card overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              <div className="w-full md:w-1/3">
                                {event.image_url && (
                                  <AspectRatio ratio={9/16}>
                                    <img
                                      src={event.image_url}
                                      alt={`Affisch för ${event.title}`}
                                      className="h-full w-full object-contain bg-muted rounded"
                                      loading="lazy"
                                    />
                                  </AspectRatio>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <IconComponent className="w-5 h-5 text-primary" />
                                      <h4 className="text-xl font-semibold text-foreground">{event.title}</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(event.event_date)}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {formatTime(event.event_date)}
                                      </span>
                                      {event.max_participants && (
                                        <span className="flex items-center gap-1">
                                          <Users className="w-4 h-4" />
                                          {event.current_participants}/{event.max_participants}
                                        </span>
                                      )}
                                      {event.price && (
                                        <span className="font-semibold text-primary">{event.price} kr</span>
                                      )}
                                      {event.has_big_screen && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                          <Monitor className="w-3.5 h-3.5" />
                                          Storbildsskärm
                                        </Badge>
                                      )}
                                    </div>
                                    {event.description && (
                                      <p className="text-foreground mb-3">{event.description}</p>
                                    )}
                                    <div className="flex gap-2 flex-wrap">
                                      {event.registration_email && (
                                        <span className="flex items-center gap-1">
                                          <Mail className="w-4 h-4" />
                                          {event.registration_email}
                                        </span>
                                      )}
                                      {event.registration_phone && (
                                        <span className="flex items-center gap-1">
                                          <Phone className="w-4 h-4" />
                                          {event.registration_phone}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2 p-2">
                                    {getStatusBadge(event.status)}
                                    {event.registration_url && isRegistrationOpen(event) && (
                                      <Button variant="outline" size="sm" asChild>
                                        <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                                          Anmäl dig
                                          <ExternalLink className="w-4 h-4 ml-1" />
                                        </a>
                                      </Button>
                                    )}
                                    <Button
                                      variant="default"
                                      size="sm"
                                      disabled={!!interested[event.id]}
                                      onClick={() => registerInterest(event.id)}
                                    >
                                      {interested[event.id] ? 'Intresse registrerat' : 'Jag är intresserad'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Events */}
          {events.length === 0 && (
            <Card className="shadow-card">
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Inga kommande evenemang</h3>
                <p className="text-muted-foreground mb-6">
                  Vi planerar nya evenemang kontinuerligt. Kom tillbaka snart!
                </p>
                <Button variant="outline" asChild>
                  <a href="#kontakt">Kontakta oss för förslag</a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          <Card className="bg-gradient-primary text-primary-foreground shadow-elegant">
            <CardContent className="p-8 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Vill du arrangera ett evenemang?</h3>
              <p className="text-lg mb-6 opacity-90">
                Vi hjälper dig att skapa minnesvärda upplevelser för dina gäster
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary">
                  Kontakta oss
                </Button>
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary">
                  Se paketpriser
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;