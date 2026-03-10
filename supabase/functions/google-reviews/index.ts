const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PLACE_ID = 'ChIJdX-cNvJBUUYR4wO_TwpQtcA'; // Markaryds Bowlinghall - will be resolved if wrong

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Places API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First try to get place details directly
    let placeId = PLACE_ID;
    
    // Use Text Search to find the place and get correct Place ID
    const searchResponse = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.reviews',
        },
        body: JSON.stringify({
          textQuery: 'Markaryds Bowlinghall Markaryd',
          languageCode: 'sv',
        }),
      }
    );

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error('Google Places search error:', searchData);
      return new Response(
        JSON.stringify({ error: 'Failed to search for place', details: searchData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const place = searchData.places?.[0];
    if (!place) {
      return new Response(
        JSON.stringify({ error: 'Place not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = {
      name: place.displayName?.text || 'Markaryds Bowlinghall',
      rating: place.rating || 0,
      totalReviews: place.userRatingCount || 0,
      reviews: (place.reviews || []).map((review: any) => ({
        author: review.authorAttribution?.displayName || 'Anonym',
        profilePhoto: review.authorAttribution?.photoUri || null,
        rating: review.rating || 0,
        text: review.text?.text || '',
        relativeTime: review.relativePublishTimeDescription || '',
        publishTime: review.publishTime || '',
      })),
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching Google Reviews:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
