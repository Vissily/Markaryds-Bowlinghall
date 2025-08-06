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
  const [mainStream, setMainStream] = useState<Livestream | null>(null);
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
      
      // Find main stream (current live or most recent)
      const main = allStreams.find(stream => 
        stream.is_main_stream && (stream.status === 'live' || stream.status === 'scheduled')
      ) || allStreams.find(stream => stream.status === 'live');
      
      setMainStream(main || null);
      
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

  if (loading) {
    return (
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <p>Laddar livestreams...</p>
          </div>
        </div>
      </section>
    );
  }

  const embedUrl = mainStream ? getYouTubeEmbedUrl(mainStream.youtube_video_id, mainStream.youtube_channel_id) : null;

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Livestream
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Följ våra turneringar och matcher live från Markaryds Bowlinghall
          </p>
        </div>

        <div className="grid gap-8">
          {/* Live Stream Player */}
          <Card className="overflow-hidden shadow-card">
            <CardHeader className="bg-gradient-primary text-primary-foreground">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Play className="w-6 h-6" />
                {mainStream ? mainStream.title : 'Live Stream'}
                {mainStream && getStatusBadge(mainStream.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="aspect-video bg-muted rounded-lg mb-6">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube Live Stream"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">Ingen pågående stream</h3>
                      <p className="text-muted-foreground">
                        Vi streamar live under turneringar och särskilda evenemang
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {mainStream && (
                  <div className="space-y-3">
                    {mainStream.description && (
                      <p className="text-foreground">{mainStream.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {mainStream.scheduled_start && (() => {
                        const dateTime = formatDateTime(mainStream.scheduled_start);
                        return dateTime ? (
                          <>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {dateTime.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {dateTime.time}
                            </span>
                          </>
                        ) : null;
                      })()}
                      {mainStream.viewer_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {mainStream.viewer_count} tittare
                        </span>
                      )}
                    </div>
                  </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                {mainStream?.youtube_video_id && (
                  <Button variant="outline" className="flex items-center gap-2" asChild>
                    <a 
                      href={`https://youtube.com/watch?v=${mainStream.youtube_video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Youtube className="w-4 h-4" />
                      Öppna på YouTube
                    </a>
                  </Button>
                )}
                {mainStream?.youtube_channel_id && (
                  <Button variant="outline" className="flex items-center gap-2" asChild>
                    <a 
                      href={`https://youtube.com/channel/${mainStream.youtube_channel_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Youtube className="w-4 h-4" />
                      YouTube Kanal
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

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
                  Följ med när våra lag tävlar i nationella serien och pensionärsserien.
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