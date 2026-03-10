import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

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
        className={`w-3 h-3 ${
          star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
        }`}
      />
    ))}
  </div>
);

const ReviewsSection = () => {
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

  if (isLoading || error || !data || data.reviews.length === 0) return null;

  return (
    <section className="py-10 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Compact header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            <span className="font-bold text-foreground">{data.rating.toFixed(1)}</span>
            <StarRating rating={Math.round(data.rating)} />
            <span className="text-xs text-muted-foreground">
              ({data.totalReviews} recensioner)
            </span>
          </div>

          {/* Static grid of reviews */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {data.reviews.slice(0, 5).map((review, index) => (
              <div
                key={index}
                className="bg-card border border-border/40 rounded-lg p-4 text-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  {review.profilePhoto ? (
                    <img
                      src={review.profilePhoto}
                      alt={review.author}
                      className="w-7 h-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {review.author[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-xs truncate">{review.author}</p>
                    <StarRating rating={review.rating} />
                  </div>
                </div>
                {review.text && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {review.text}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <a
              href="https://www.google.com/maps/place/Markaryds+Bowlinghall/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Se alla recensioner på Google →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
