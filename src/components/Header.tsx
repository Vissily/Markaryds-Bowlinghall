import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Clock, MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const dayNamesShort: Record<number, string> = { 0: 'Sön', 1: 'Mån', 2: 'Tis', 3: 'Ons', 4: 'Tor', 5: 'Fre', 6: 'Lör' };

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [livescoreOpen, setLivescoreOpen] = useState(false);
  const [ligaOpen, setLigaOpen] = useState(false);
  const [oppettiderOpen, setOppettiderOpen] = useState(false);
  const livescoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ligaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const oppettiderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch today's opening hours dynamically
  const { data: openingHours } = useQuery({
    queryKey: ['opening-hours-header'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opening_hours')
        .select('*')
        .order('day_of_week', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const todayHoursText = useMemo(() => {
    if (!openingHours?.length) return 'Laddar...';
    // JS getDay(): 0=Sunday, which matches our DB
    const jsDay = new Date().getDay();
    const today = openingHours.find(h => h.day_of_week === jsDay);
    if (!today) return 'Idag: Se öppettider';
    if (today.is_closed) return `Idag (${dayNamesShort[jsDay]}): Stängt`;
    const open = today.open_time?.slice(0, 5) || '';
    const close = today.close_time?.slice(0, 5) || '';
    return `Idag (${dayNamesShort[jsDay]}): ${open}–${close}`;
  }, [openingHours]);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('http')) return; // external link, let default behavior
    e.preventDefault();
    setIsMenuOpen(false);
    
    if (href.includes('#')) {
      const [path, hash] = href.split('#');
      const targetPath = path || '/';
      
      if (location.pathname === targetPath) {
        // Same page, just scroll
        const el = document.getElementById(hash);
        el?.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Navigate to page then scroll
        navigate(targetPath);
        setTimeout(() => {
          const el = document.getElementById(hash);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(href);
    }
  }, [navigate, location.pathname]);

  const navigation = [
    { name: "Hem", href: "/" },
    { name: "Aktiviteter", href: "/#aktiviteter" },
    { name: "Meny", href: "/menu" },
    { name: "Evenemang", href: "/events" },
    { name: "Kontakt", href: "/#kontakt" },
  ];

  const oppettiderItems = [
    { name: "Öppettider", href: "/#oppettider" },
    { name: "Prislista", href: "/prislista" },
  ];

  const livescoreItems = [
    { name: "Livescore", href: "/livescore" },
    { name: "Livestream", href: "/livestream" },
  ];

  const ligaItems = [
    { name: "Markarydsligan", href: "/markarydsligan" },
    { name: "Dartligan", href: "https://seriespel.markarydsbowling.se/dart/main" },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled || isMenuOpen
        ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
        : "bg-transparent border-b border-transparent"
    )}>
      <div className="container mx-auto px-6 sm:px-8 lg:px-10 xl:px-16">
        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-20 gap-6 lg:gap-8 xl:gap-10 2xl:gap-14">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 w-32 sm:w-40 lg:w-48 xl:w-56 pr-2 lg:pr-4">
            <img 
              src="/lovable-uploads/d8ae05f0-bff1-4c53-91fa-49db4627300c.png" 
              alt="Markaryds Bowling" 
              className="h-8 sm:h-10 lg:h-12 xl:h-14 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 2xl:space-x-10 flex-1 justify-center max-w-2xl px-2 ml-4 lg:ml-6 xl:ml-8 2xl:ml-10">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={cn(
                  "hover:text-primary transition-colors font-medium text-sm xl:text-base whitespace-nowrap cursor-pointer",
                  scrolled ? "text-foreground" : "text-white"
                )}
              >
                {item.name}
              </a>
            ))}
            
            {/* Öppettider Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => {
                  if (oppettiderTimeoutRef.current) clearTimeout(oppettiderTimeoutRef.current);
                  setOppettiderOpen(true);
                }}
                onMouseLeave={() => {
                  oppettiderTimeoutRef.current = setTimeout(() => setOppettiderOpen(false), 150);
                }}
                className={cn("flex items-center hover:text-primary transition-colors font-medium text-sm xl:text-base whitespace-nowrap", scrolled ? "text-foreground" : "text-white")}
              >
                Öppettider
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {oppettiderOpen && (
                <div
                  onMouseEnter={() => {
                    if (oppettiderTimeoutRef.current) clearTimeout(oppettiderTimeoutRef.current);
                    setOppettiderOpen(true);
                  }}
                  onMouseLeave={() => {
                    oppettiderTimeoutRef.current = setTimeout(() => setOppettiderOpen(false), 150);
                  }}
                  className="absolute top-full left-0 mt-0.5 w-40 bg-background border border-border rounded-md shadow-lg z-50"
                >
                  {oppettiderItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className="block px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors cursor-pointer"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Livescore Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => {
                  if (livescoreTimeoutRef.current) {
                    clearTimeout(livescoreTimeoutRef.current);
                  }
                  setLivescoreOpen(true);
                }}
                onMouseLeave={() => {
                  livescoreTimeoutRef.current = setTimeout(() => {
                    setLivescoreOpen(false);
                  }, 150);
                }}
                className={cn("flex items-center hover:text-primary transition-colors font-medium text-sm xl:text-base whitespace-nowrap", scrolled ? "text-foreground" : "text-white")}
              >
                Livescore
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {livescoreOpen && (
                <div
                  onMouseEnter={() => {
                    if (livescoreTimeoutRef.current) {
                      clearTimeout(livescoreTimeoutRef.current);
                    }
                    setLivescoreOpen(true);
                  }}
                  onMouseLeave={() => {
                    livescoreTimeoutRef.current = setTimeout(() => {
                      setLivescoreOpen(false);
                    }, 150);
                  }}
                  className="absolute top-full left-0 mt-0.5 w-40 bg-background border border-border rounded-md shadow-lg z-50"
                >
                  {livescoreItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className="block px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors cursor-pointer"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Liga Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => {
                  if (ligaTimeoutRef.current) {
                    clearTimeout(ligaTimeoutRef.current);
                  }
                  setLigaOpen(true);
                }}
                onMouseLeave={() => {
                  ligaTimeoutRef.current = setTimeout(() => {
                    setLigaOpen(false);
                  }, 150);
                }}
                className={cn("flex items-center hover:text-primary transition-colors font-medium text-sm xl:text-base whitespace-nowrap", scrolled ? "text-foreground" : "text-white")}
              >
                Ligor
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {ligaOpen && (
                <div
                  onMouseEnter={() => {
                    if (ligaTimeoutRef.current) {
                      clearTimeout(ligaTimeoutRef.current);
                    }
                    setLigaOpen(true);
                  }}
                  onMouseLeave={() => {
                    ligaTimeoutRef.current = setTimeout(() => {
                      setLigaOpen(false);
                    }, 150);
                  }}
                  className="absolute top-full left-0 mt-0.5 w-40 bg-background border border-border rounded-md shadow-lg z-50"
                >
                  {ligaItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="block px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors cursor-pointer"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Contact Info */}
          <div className={cn("hidden xl:flex items-center space-x-4 2xl:space-x-6 text-xs 2xl:text-sm flex-shrink-0 min-w-0 pl-4 xl:pl-6", scrolled ? "text-muted-foreground" : "text-white/80")}>
            <div className="flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">0730-740 600</span>
            </div>
            <div className="flex items-center space-x-1.5 min-w-0">
              <Clock className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 flex-shrink-0" />
              <span className="truncate max-w-[200px] 2xl:max-w-[250px]">{todayHoursText}</span>
            </div>
          </div>

          {/* Book Button & Mobile Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0 ml-2 xl:ml-4">
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
              className={cn("lg:hidden p-1 hover:text-primary transition-colors", scrolled ? "text-foreground" : "text-white")}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "lg:hidden overflow-hidden transition-all duration-300",
          isMenuOpen ? "max-h-[600px] pb-6" : "max-h-0"
        )}>
          <nav className="flex flex-col space-y-4 pt-4 border-t border-border">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium py-2 cursor-pointer"
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {item.name}
              </a>
            ))}
            
            {/* Mobile Öppettider Section */}
            <div className="space-y-2">
              <div className="text-foreground font-medium py-2 text-sm text-muted-foreground">Öppettider</div>
              {oppettiderItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors pl-4 py-1 block cursor-pointer"
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Mobile Livescore Section */}
            <div className="space-y-2">
              <div className="text-foreground font-medium py-2 text-sm text-muted-foreground">Livescore</div>
              {livescoreItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors pl-4 py-1 block cursor-pointer"
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Mobile Liga Section */}
            <div className="space-y-2">
              <div className="text-foreground font-medium py-2 text-sm text-muted-foreground">Ligor</div>
              {ligaItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-foreground hover:text-primary transition-colors pl-4 py-1 block cursor-pointer"
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.name}
                </a>
              ))}
            </div>
            <div className="pt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>0730-740 600</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{todayHoursText}</span>
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