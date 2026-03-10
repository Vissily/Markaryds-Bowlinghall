import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
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
        className={`w-4 h-4 ${
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
    staleTime: 60 * 60 * 1000, // 1 hour cache
    gcTime: 24 * 60 * 60 * 1000,
  });

  if (isLoading || error || !data || data.reviews.length === 0) return null;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Vad våra gäster tycker
            </h2>
            <div className="flex items-center justify-center gap-3 mb-2">
              <StarRating rating={Math.round(data.rating)} />
              <span className="text-2xl font-bold text-foreground">{data.rating.toFixed(1)}</span>
            </div>
            <p className="text-muted-foreground">
              Baserat på {data.totalReviews} recensioner på Google
            </p>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.reviews.slice(0, 5).map((review, index) => (
              <Card key={index} className="p-6 shadow-card h-full flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  {review.profilePhoto ? (
                    <img
                      src={review.profilePhoto}
                      alt={review.author}
                      className="w-10 h-10 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {review.author[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground text-sm">{review.author}</p>
                    <p className="text-xs text-muted-foreground">{review.relativeTime}</p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
                {review.text && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-4 flex-1">
                    "{review.text}"
                  </p>
                )}
              </Card>
            ))}
          </div>

          {/* Google Attribution */}
          <div className="text-center mt-8">
            <a
              href="https://www.google.com/maps/place/Markaryds+Bowlinghall/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
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
