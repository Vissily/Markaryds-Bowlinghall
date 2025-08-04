import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Calendar } from "lucide-react";

const Livestream = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      
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
                  Live Stream
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">Ingen pågående stream</h3>
                    <p className="text-muted-foreground">
                      Vi streamar live under turneringar och särskilda evenemang
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Öppna i nytt fönster
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Kommande Streams */}
            <Card className="shadow-card">
              <CardHeader className="bg-gradient-secondary text-secondary-foreground">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Kommande Streams
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-foreground">Nationella Serien - Omgång 5</h3>
                      <span className="text-sm text-muted-foreground">15:00</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">
                      Markaryds Bowlingklubb möter Växjö BK i en avgörande match
                    </p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Lördag 8 februari</span>
                    </div>
                  </div>
                  
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-foreground">Pensionärsserien - Final</h3>
                      <span className="text-sm text-muted-foreground">13:00</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">
                      Spännande final mellan våra pensionärslag
                    </p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Söndag 16 februari</span>
                    </div>
                  </div>

                  <div className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-foreground">Ungdomsturnering</h3>
                      <span className="text-sm text-muted-foreground">10:00</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">
                      Våra unga talanger tävlar om årets titel
                    </p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Lördag 22 februari</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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

      <Footer />
    </main>
  );
};

export default Livestream;