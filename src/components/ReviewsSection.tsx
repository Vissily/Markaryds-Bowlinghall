import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Review {
  author: string;
  profilePhoto: string | null;
  rating: number;
  text: string;
  relativeTime: string;
}

interface ReviewsData {
  name: string;
  rating: number;
  totalReviews: number;
  reviews: Review[];
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-3.5 h-3.5 ${
          star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
        }`}
      />
    ))}
  </div>
);

const ReviewsSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const { data, isLoading, error } = useQuery<ReviewsData>({
    queryKey: ["google-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("google-reviews");
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  // Auto-scroll animation
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !data?.reviews?.length) return;

    let animationId: number;
    let scrollPos = 0;
    const speed = 0.5; // pixels per frame

    const animate = () => {
      if (!isPaused && container) {
        scrollPos += speed;
        // Reset when we've scrolled through the first set of duplicated items
        const halfScroll = container.scrollWidth / 2;
        if (scrollPos >= halfScroll) {
          scrollPos = 0;
        }
        container.scrollLeft = scrollPos;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, data]);

  if (isLoading || error || !data || data.reviews.length === 0) return null;

  // Duplicate reviews for seamless loop
  const loopedReviews = [...data.reviews, ...data.reviews];

  return (
    <section className="py-14 bg-muted/20 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5"
            />
            <span className="text-lg font-bold text-foreground">{data.rating.toFixed(1)}</span>
            <StarRating rating={Math.round(data.rating)} />
          </div>
          <span className="text-sm text-muted-foreground">
            {data.totalReviews} recensioner på Google
          </span>
        </div>
      </div>

      {/* Scrolling reviews ticker */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-hidden cursor-grab"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {loopedReviews.map((review, index) => (
          <div
            key={`${review.author}-${index}`}
            className="flex-shrink-0 w-[320px] md:w-[380px] bg-card border border-border/50 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              {review.profilePhoto ? (
                <img
                  src={review.profilePhoto}
                  alt={review.author}
                  className="w-9 h-9 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {review.author[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{review.author}</p>
                <p className="text-xs text-muted-foreground">{review.relativeTime}</p>
              </div>
              <div className="ml-auto">
                <StarRating rating={review.rating} />
              </div>
            </div>
            {review.text && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {review.text}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <a
          href="https://www.google.com/maps/place/Markaryds+Bowlinghall/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Se alla recensioner på Google →
        </a>
      </div>
    </section>
  );
};

export default ReviewsSection;
