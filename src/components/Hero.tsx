
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Calendar } from "lucide-react";
import heroImage from "@/assets/hero-bowling.jpg";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";

interface HeroVideo {
  id: string;
  title: string;
  file_path: string;
  mime_type: string;
}

const Hero = () => {
  const { content } = useSiteContent('hero');
  const [heroVideos, setHeroVideos] = useState<HeroVideo[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [videoStarted, setVideoStarted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Fetch hero videos from database - only load first 3 initially for performance
  useEffect(() => {
    const fetchHeroVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('id, title, file_path, mime_type')
          .eq('show_in_hero', true)
          .like('mime_type', 'video/%')
          .order('sort_order', { ascending: true })
          .limit(3); // Only load 3 videos for better performance

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedVideos = data.map(video => ({
            ...video,
            file_path: supabase.storage.from('gallery-images').getPublicUrl(video.file_path).data.publicUrl
          }));
          setHeroVideos(formattedVideos);
        }
      } catch (error) {
        console.error('Error fetching hero videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroVideos();
  }, []);

  // Detect user interaction to start video playback (saves bandwidth on mobile)
  useEffect(() => {
    const handleInteraction = () => {
      setUserInteracted(true);
      // Remove listeners after first interaction
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    // Start video after 2 seconds even without interaction (for desktop)
    const timer = setTimeout(() => setUserInteracted(true), 2000);

    window.addEventListener('scroll', handleInteraction, { passive: true });
    window.addEventListener('click', handleInteraction, { passive: true });
    window.addEventListener('touchstart', handleInteraction, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Auto-rotate videos with longer interval
  useEffect(() => {
    if (heroVideos.length <= 1 || !videoStarted) return;
    
    const interval = setInterval(() => {
      requestAnimationFrame(() => {
        setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length);
      });
    }, 15000); // Longer interval = fewer video loads

    return () => clearInterval(interval);
  }, [heroVideos.length, videoStarted]);

  const handleVideoCanPlay = useCallback(() => {
    setVideoStarted(true);
  }, []);

  // Default values
  const title = content?.title || 'Markaryds Bowlinghall';
  const subtitle = content?.subtitle || 'Sedan 2013';
  const description = content?.description || 'Mer än bara bowling – upplev padel, minigolf, dart och shuffleboard i Smålands modernaste aktivitetshall';
  const stats = content?.metadata?.stats || [
    { icon: "Users", value: "450", label: "Spelare per vecka" },
    { icon: "Calendar", value: "70", label: "Öppettimmar per vecka" },
    { icon: "Star", value: "5", label: "Olika aktiviteter" }
  ];

  return (
    <section 
      data-hero-section 
      className="relative h-[80vh] min-h-[600px] flex items-center justify-center"
    >
      {/* Background - Show image first, then video on interaction */}
      <div className="absolute inset-0 z-0">
        {/* Always show image as base layer for instant loading */}
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
            videoStarted ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
        {/* Only load video after user interaction */}
        {userInteracted && !loading && heroVideos.length > 0 && (
          <>
            {/* Current video */}
            <video 
              key={heroVideos[currentVideoIndex]?.id}
              autoPlay 
              loop 
              muted 
              playsInline
              preload="metadata"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                videoStarted ? 'opacity-100' : 'opacity-0'
              }`}
              onCanPlay={handleVideoCanPlay}
              onError={(e) => {
                console.log('Hero video failed to load');
                const target = e.target as HTMLVideoElement;
                target.style.display = 'none';
              }}
            >
              <source 
                src={heroVideos[currentVideoIndex]?.file_path} 
                type={heroVideos[currentVideoIndex]?.mime_type} 
              />
            </video>
            
            {/* Preload next video in background */}
            {heroVideos.length > 1 && (
              <link 
                rel="preload" 
                as="video" 
                href={heroVideos[(currentVideoIndex + 1) % heroVideos.length]?.file_path}
              />
            )}
          </>
        )}
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-background/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/20">
            <Star className="w-4 h-4 text-secondary" />
            <span className="text-white font-medium">{subtitle}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
            {title.split(' ')[0]}
            <span className="block text-secondary">{title.split(' ').slice(1).join(' ')}</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <Button 
              size="xl" 
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
              asChild
            >
              <a 
                href="https://secure.meriq.com/markaryd/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Boka Nu
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button variant="outline" size="xl" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-primary" asChild>
              <a href="/prislista">
                Prislista
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon === 'Users' ? Users : stat.icon === 'Calendar' ? Calendar : Star;
              return (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <IconComponent className="w-5 h-5 text-secondary mr-1" />
                    <span className="text-2xl md:text-3xl font-bold text-white">{stat.value}</span>
                  </div>
                  <p className="text-sm md:text-base text-white/80">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-4 lg:left-10 w-4 h-4 bg-secondary rounded-full animate-float opacity-60"></div>
      <div className="absolute top-40 right-4 lg:right-20 w-6 h-6 bg-white rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-40 left-4 lg:left-20 w-3 h-3 bg-secondary rounded-full animate-float opacity-50" style={{animationDelay: '2s'}}></div>
    </section>
  );
};

export default Hero;
