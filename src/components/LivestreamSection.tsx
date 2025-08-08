import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Play, Calendar, Clock, Youtube, Users } from "lucide-react";

interface Livestream {
  id: string;
  title: string;
  description: string | null;
  youtube_video_id: string | null;
  youtube_channel_id: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  status: string;
  is_main_stream: boolean;
  featured: boolean;
  thumbnail_url: string | null;
  viewer_count: number;
}

const LivestreamSection = () => {
  const [livestreams, setLivestreams] = useState<Livestream[]>([]);
  const [lanes14Stream, setLanes14Stream] = useState<Livestream | null>(null);
  const [lanes48Stream, setLanes48Stream] = useState<Livestream | null>(null);
  const [upcomingStreams, setUpcomingStreams] = useState<Livestream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLivestreams();
  }, []);

  const loadLivestreams = async () => {
    try {
      const { data, error } = await supabase
        .from('livestreams')
        .select('*')
        .order('scheduled_start', { ascending: true });

      if (error) throw error;
      
      const allStreams = data || [];
      setLivestreams(allStreams);
      
      // Find streams for lanes 1-4 and 5-8
      const lanes14 = allStreams.find(stream => 
        stream.title.toLowerCase().includes('bana 1-4') && 
        (stream.status === 'live' || stream.status === 'scheduled')
      );
      
      const lanes48 = allStreams.find(stream => 
        stream.title.toLowerCase().includes('bana 5-8') && 
        (stream.status === 'live' || stream.status === 'scheduled')
      );
      
      setLanes14Stream(lanes14 || null);
      setLanes48Stream(lanes48 || null);
      
      // Get upcoming scheduled streams
      const upcoming = allStreams.filter(stream => 
        stream.status === 'scheduled' && 
        new Date(stream.scheduled_start || '') > new Date()
      );
      
      setUpcomingStreams(upcoming);
    } catch (error) {
      console.error('Error loading livestreams:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('sv-SE', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      }),
      time: date.toLocaleTimeString('sv-SE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getYouTubeEmbedUrl = (videoId: string | null, channelId: string | null) => {
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
    } else if (channelId) {
      return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1`;
    }
    return null;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      scheduled: 'outline',
      live: 'default',
      ended: 'secondary',
      cancelled: 'destructive'
    };
    
    const labels: Record<string, string> = {
      scheduled: 'Schemalagd',
      live: 'Live',
      ended: 'Avslutad',
      cancelled: 'Inställd'
    };
    
    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  const renderStreamCard = (stream: Livestream | null, title: string) => {
    const embedUrl = stream ? getYouTubeEmbedUrl(stream.youtube_video_id, stream.youtube_channel_id) : null;
    
    return (
      <Card className="overflow-hidden shadow-card">
        <CardHeader className="bg-gradient-primary text-primary-foreground">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Play className="w-5 h-5" />
            {title}
            {stream && getStatusBadge(stream.status)}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="aspect-video bg-muted rounded-lg mb-4">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`YouTube Live Stream - ${title}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <h4 className="text-lg font-semibold text-foreground mb-1">Ingen stream</h4>
                  <p className="text-muted-foreground text-sm">
                    {title} är inte aktiv just nu
                  </p>
                </div>
              </div>
            )}
          </div>
          {stream && (
            <div className="space-y-3">
              {stream.description && (
                <p className="text-foreground text-sm">{stream.description}</p>
              )}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {stream.scheduled_start && (() => {
                  const dateTime = formatDateTime(stream.scheduled_start);
                  return dateTime ? (
                    <>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dateTime.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dateTime.time}
                      </span>
                    </>
                  ) : null;
                })()}
                {stream.viewer_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {stream.viewer_count} tittare
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {stream.youtube_video_id && (
                  <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                    <a 
                      href={`https://youtube.com/watch?v=${stream.youtube_video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Youtube className="w-3 h-3" />
                      Öppna på YouTube
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <p>Laddar livestreams...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Livestream
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Följ våra turneringar och matcher live från Markaryds Bowlinghall
          </p>
        </div>

        <div className="grid gap-8">
          {/* Dual Stream Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderStreamCard(lanes14Stream, "Bana 1-4")}
            {renderStreamCard(lanes48Stream, "Bana 5-8")}
          </div>

          {/* Kommande Streams */}
          {upcomingStreams.length > 0 && (
            <Card className="shadow-card">
              <CardHeader className="bg-gradient-secondary text-secondary-foreground">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Kommande Streams
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {upcomingStreams.map((stream) => {
                    const dateTime = formatDateTime(stream.scheduled_start);
                    return (
                      <div key={stream.id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-foreground">{stream.title}</h3>
                          <div className="flex items-center gap-2">
                            {stream.featured && <Badge variant="secondary">Utvald</Badge>}
                            {dateTime?.time && (
                              <span className="text-sm text-muted-foreground">{dateTime.time}</span>
                            )}
                          </div>
                        </div>
                        {stream.description && (
                          <p className="text-muted-foreground text-sm mb-3">{stream.description}</p>
                        )}
                        {dateTime && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{dateTime.date}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stream Information */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Om våra livestreams</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Vi streamar live från Markaryds Bowlinghall under viktiga matcher och turneringar. 
                  Vi har två kameror som täcker bana 1-4 och bana 5-8 för att ge er full överblick över tävlingarna.
                </p>
                <p>
                  Streamarna är gratis att titta på och ger dig möjlighet att följa spänningen 
                  hemifrån eller dela upplevelsen med vänner och familj.
                </p>
                <p>
                  För information om kommande streams och särskilda evenemang, 
                  följ oss på sociala medier eller kontakta oss direkt.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LivestreamSection;