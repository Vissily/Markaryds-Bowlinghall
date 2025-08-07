import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "Hem", href: "/" },
    { name: "Aktiviteter", href: "/#aktiviteter" },
    { name: "Meny", href: "/menu" },
    { name: "Livestream", href: "/livestream" },
    { name: "Livescore", href: "/livescore" },
    { name: "Evenemang", href: "/events" },
    { name: "Öppettider", href: "/#oppettider" },
    { name: "Kontakt", href: "/#kontakt" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24 gap-4 lg:gap-6 xl:gap-8">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 min-w-0">
            <img 
              src="/lovable-uploads/d8ae05f0-bff1-4c53-91fa-49db4627300c.png" 
              alt="Markaryds Bowling" 
              className="h-8 sm:h-10 lg:h-12 xl:h-14 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 2xl:space-x-10 flex-1 justify-center max-w-2xl">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium text-sm xl:text-base whitespace-nowrap"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Contact Info */}
          <div className="hidden xl:flex items-center space-x-4 2xl:space-x-6 text-xs 2xl:text-sm text-muted-foreground flex-shrink-0 min-w-0">
            <div className="flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">0730-740 600</span>
            </div>
            <div className="flex items-center space-x-1.5 min-w-0">
              <Clock className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 flex-shrink-0" />
              <span className="truncate max-w-[160px] 2xl:max-w-[200px]">Mån-Tis 10-20, Ons-Tor 10-21, Fre 10-00</span>
            </div>
          </div>

          {/* Book Button & Mobile Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
            <Button 
              variant="hero" 
              size="sm" 
              className="hidden sm:flex text-xs lg:text-sm xl:text-base px-3 lg:px-4 xl:px-6 py-2"
              asChild
            >
              <a 
                href="https://secure.meriq.com/markaryd/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Boka Nu
              </a>
            </Button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1 text-foreground hover:text-primary transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "lg:hidden overflow-hidden transition-all duration-300",
          isMenuOpen ? "max-h-96 pb-6" : "max-h-0"
        )}>
          <nav className="flex flex-col space-y-4 pt-4 border-t border-border">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>0730-740 600</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Mån-Tis 10-20, Ons-Tor 10-21, Fre 10-00</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Markaryd</span>
              </div>
            </div>
            <Button 
              variant="hero" 
              size="lg" 
              className="mt-4"
              asChild
            >
              <a 
                href="https://secure.meriq.com/markaryd/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
              >
                Boka Nu
              </a>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;