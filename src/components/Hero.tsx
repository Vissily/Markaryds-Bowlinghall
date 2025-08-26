
import React, { useState, useEffect } from "react";
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
  const [videosLoaded, setVideosLoaded] = useState<Set<number>>(new Set());
  const [isInView, setIsInView] = useState(false);

  // Fetch hero videos from database
  useEffect(() => {
    const fetchHeroVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('id, title, file_path, mime_type')
          .eq('show_in_hero', true)
          .like('mime_type', 'video/%')
          .order('sort_order', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Convert database videos to correct format with public URLs
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

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const heroSection = document.querySelector('[data-hero-section]');
    if (heroSection) {
      observer.observe(heroSection);
    }

    return () => observer.disconnect();
  }, []);

  // Optimized auto-rotate videos to prevent forced reflows  
  useEffect(() => {
    if (heroVideos.length <= 1 || !isInView) return;
    
    const interval = setInterval(() => {
      // Use requestAnimationFrame to batch DOM updates
      requestAnimationFrame(() => {
        setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [heroVideos.length, isInView]);

  // Handle video loading optimization
  const handleVideoLoad = (index: number) => {
    setVideosLoaded(prev => new Set([...prev, index]));
  };

  // Default values if content is not loaded yet
  const title = content?.title || 'Markaryds Bowlinghall';
  const subtitle = content?.subtitle || 'Sedan 2013';
  const description = content?.description || 'Mer än bara bowling – upplev padel, minigolf, dart och shuffleboard i Smålands modernaste aktivitetshall';
  const buttonText = content?.button_text || 'Boka Din Aktivitet';
  const buttonLink = content?.button_link || '#activities';
  const stats = content?.metadata?.stats || [
    { icon: "Users", value: "450", label: "Spelare per vecka" },
    { icon: "Calendar", value: "70", label: "Öppettimmar per vecka" },
    { icon: "Star", value: "5", label: "Olika aktiviteter" }
  ];

  return (
    <section 
      data-hero-section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Video with Fallback */}
      <div className="absolute inset-0 z-0">
        {!loading && heroVideos.length > 0 && isInView ? (
          // Show videos from gallery with lazy loading
          heroVideos.map((video, index) => (
            <video 
              key={video.id}
              autoPlay={index === currentVideoIndex && isInView} 
              loop 
              muted 
              playsInline
              preload={index === 0 ? "metadata" : "none"}
              className={`w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentVideoIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
              }`}
              onLoadedData={() => handleVideoLoad(index)}
              onError={(e) => {
                console.log('Hero video failed to load:', video.title);
                const target = e.target as HTMLVideoElement;
                target.style.display = 'none';
              }}
            >
              <source src={video.file_path} type={video.mime_type} />
              Your browser does not support the video tag.
            </video>
          ))
        ) : !loading && heroVideos.length > 0 ? (
          // Placeholder when not in view
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        ) : (
          // Fallback to default video or image
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('Default video failed to load, showing fallback image');
              const target = e.target as HTMLVideoElement;
              if (target.parentElement) {
                target.parentElement.style.backgroundImage = `url(${heroImage})`;
                target.parentElement.style.backgroundSize = 'cover';
                target.parentElement.style.backgroundPosition = 'center';
                target.style.display = 'none';
              }
            }}
          >
            <source src="https://www.markarydsbowling.se/wp-content/uploads/2022/10/markarydsbowling.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-background/20 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-white/20">
            <Star className="w-4 h-4 text-secondary" />
            <span className="text-white font-medium">{subtitle}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {title.split(' ')[0]}
            <span className="block text-secondary">{title.split(' ').slice(1).join(' ')}</span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon === 'Users' ? Users : stat.icon === 'Calendar' ? Calendar : Star;
              return (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <IconComponent className="w-6 h-6 text-secondary mr-2" />
                    <span className="text-3xl font-bold text-white">{stat.value}</span>
                  </div>
                  <p className="text-white/80">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-secondary rounded-full animate-float opacity-60"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-white rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-40 left-20 w-3 h-3 bg-secondary rounded-full animate-float opacity-50" style={{animationDelay: '2s'}}></div>
    </section>
  );
};

export default Hero;
