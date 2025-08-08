import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Star } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";

interface Event {
  id: string;
  title: string;
  event_date: string;
  image_url: string | null;
  featured: boolean;
  status: string;
}

const FeaturedEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id,title,event_date,image_url,featured,status')
        .eq('featured', true)
        .in('status', ['upcoming','ongoing'])
        .order('event_date', { ascending: true })
        .limit(3);
      if (!error && data) setEvents(data);
    };
    load();
  }, []);

  if (events.length === 0) return null;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <div className="flex items-center gap-4 justify-center">
            <Separator className="flex-1 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-primary" />
              <h3 className="text-2xl md:text-3xl font-bold text-center">Utvalda Evenemang</h3>
            </div>
            <Separator className="flex-1 hidden sm:block" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((e) => (
            <Card key={e.id} className="overflow-hidden shadow-card">
              {e.image_url && (
                <AspectRatio ratio={9/16}>
                  <img
                    src={e.image_url}
                    alt={`Affisch för ${e.title}`}
                    className="h-full w-full object-contain bg-muted"
                    loading="lazy"
                  />
                </AspectRatio>
              )}
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" /> {e.title}
                </CardTitle>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(e.event_date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <Badge variant="secondary">Utvald</Badge>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/events">Läs mer</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;
