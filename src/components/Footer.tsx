import { Button } from "@/components/ui/button";
import { ExternalLink, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-primary rounded-full"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold">Markaryds</h3>
                <p className="text-sm opacity-80 -mt-1">Bowlinghall</p>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed mb-6">
              Smålands modernaste aktivitetshall med bowling, padel, minigolf och mer. 
              Öppet 7 dagar i veckan sedan 2013.
            </p>
            <div className="text-xs opacity-60">
              EST. 2013
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Snabblänkar</h4>
            <div className="space-y-2 text-sm">
              <a href="/#aktiviteter" className="block opacity-80 hover:opacity-100 transition-opacity">
                Aktiviteter
              </a>
              <a href="/#oppettider" className="block opacity-80 hover:opacity-100 transition-opacity">
                Öppettider
              </a>
              <a href="/#kontakt" className="block opacity-80 hover:opacity-100 transition-opacity">
                Kontakt
              </a>
              <a href="/menu" className="block opacity-80 hover:opacity-100 transition-opacity">
                Meny
              </a>
            </div>
          </div>

          {/* Booking Links */}
          <div>
            <h4 className="font-semibold mb-4">Bokningar</h4>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs bg-transparent border-background/30 text-background hover:bg-background hover:text-foreground group"
                asChild
              >
                <a href="https://secure.meriq.com/markaryd/" target="_blank" rel="noopener noreferrer">
                  <span>Bowling</span>
                  <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs bg-transparent border-background/30 text-background hover:bg-background hover:text-foreground group"
                asChild
              >
                <a href="https://playtomic.com/clubs/padel-i-markaryd-markaryd" target="_blank" rel="noopener noreferrer">
                  <span>Padel</span>
                  <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Kontakt</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 opacity-80">
                <Phone className="w-4 h-4" />
                <span>0730-740 600</span>
              </div>
              <div className="flex items-center space-x-2 opacity-80">
                <Mail className="w-4 h-4" />
                <span>info@markarydsbowling.se</span>
              </div>
              <div className="flex items-start space-x-2 opacity-80">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <div>Hannabadsvägen 2F</div>
                  <div>285 32 Markaryd</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm opacity-60">
          <div>
            © 2024 Markaryds Bowlinghall. Alla rättigheter förbehållna.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:opacity-100 transition-opacity">GDPR</a>
            <a href="/prislista" className="hover:opacity-100 transition-opacity">Prislista</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Markarydsligan</a>
            <a href="/auth" className="hover:opacity-100 transition-opacity">Admin</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;