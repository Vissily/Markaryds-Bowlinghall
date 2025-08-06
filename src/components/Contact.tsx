import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, ExternalLink, Clock } from "lucide-react";

const Contact = () => {
  return (
    <section id="kontakt" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Kontakta Oss
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Har du frågor eller vill göra en bokning? Vi hjälper dig gärna!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="p-8 shadow-card">
                <h3 className="text-2xl font-bold text-foreground mb-6">Kontaktinformation</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Telefon</h4>
                      <p className="text-muted-foreground">0433-123 45</p>
                      <p className="text-sm text-muted-foreground">Ring för bokning eller frågor</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">E-post</h4>
                      <p className="text-muted-foreground">info@markarydsbowling.se</p>
                      <p className="text-sm text-muted-foreground">Vi svarar inom 24 timmar</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Adress</h4>
                      <p className="text-muted-foreground">Hannabadsvägen 2F</p>
                      <p className="text-muted-foreground">285 32 Markaryd</p>
                      <p className="text-sm text-muted-foreground">Lätt att hitta mitt i Markaryd</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Öppettider</h4>
                      <p className="text-muted-foreground">Mån-Tis: 10-20</p>
                      <p className="text-muted-foreground">Ons-Tor: 10-21</p>
                      <p className="text-muted-foreground">Fre: 10-00, Lör: 15-23, Sön: 11-16</p>
                      <p className="text-muted-foreground">Lördag: 15-23 (bowling stänger 22)</p>
                      <p className="text-muted-foreground">Söndag: 11-16</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Links */}
              <Card className="p-8 shadow-card bg-gradient-primary text-primary-foreground">
                <h3 className="text-xl font-bold mb-6">Snabba Länkar</h3>
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary group justify-between"
                    asChild
                  >
                    <a href="https://secure.meriq.com/markaryd/" target="_blank" rel="noopener noreferrer">
                      <span>Boka Bowling</span>
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary group justify-between"
                    asChild
                  >
                    <a href="https://playtomic.com/clubs/padel-i-markaryd-markaryd" target="_blank" rel="noopener noreferrer">
                      <span>Boka Padel</span>
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary group justify-between"
                    asChild
                  >
                    <a href="https://livescoring.lanetalk.com/viking/index.html?uuid=74a4d364-b1cc-11e4-ab94-0050569337ac" target="_blank" rel="noopener noreferrer">
                      <span>Live Scoring</span>
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </div>
              </Card>
            </div>

            {/* Map */}
            <div>
              <Card className="p-8 shadow-card h-full">
                <h3 className="text-2xl font-bold text-foreground mb-6">Hitta Hit</h3>
                <div className="bg-muted rounded-lg aspect-video flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-lg font-semibold">Markaryds Bowlinghall</p>
                    <p>Hannabadsvägen 2F, 285 32 Markaryd</p>
                    <p className="mt-4 text-sm">
                      Beläget centralt i Markaryd med<br />
                      goda parkeringsmöjligheter
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>10 minuter från E4:an</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Gratis parkering</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Närhet till centrum</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;