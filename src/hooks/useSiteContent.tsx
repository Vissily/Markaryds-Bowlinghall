import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SiteContent {
  id: string;
  section_key: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  button_text?: string;
  button_link?: string;
  metadata?: any;
}

export const useSiteContent = (sectionKey: string) => {
  const { data: content, isLoading: loading, error } = useQuery({
    queryKey: ['site-content', sectionKey],
    queryFn: async () => {
      const { data, error: supabaseError } = await supabase
        .from('site_content')
        .select('*')
        .eq('section_key', sectionKey)
        .maybeSingle();

      if (supabaseError) {
        throw supabaseError;
      }

      return data as SiteContent | null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - content rarely changes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });

  return { 
    content: content ?? null, 
    loading, 
    error: error ? 'Kunde inte ladda innehåll' : null 
  };
};

export default useSiteContent;
