import { useState, useEffect } from 'react';
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
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('site_content')
          .select('*')
          .eq('section_key', sectionKey)
          .single();

        if (supabaseError && supabaseError.code !== 'PGRST116') {
          throw supabaseError;
        }

        setContent(data);
      } catch (err) {
        console.error('Error loading content:', err);
        setError('Kunde inte ladda innehåll');
      } finally {
        setLoading(false);
      }
    };

    loadContent();

    // Subscribe to changes
    const subscription = supabase
      .channel(`site_content_${sectionKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_content',
          filter: `section_key=eq.${sectionKey}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setContent(payload.new as SiteContent);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sectionKey]);

  return { content, loading, error };
};

export default useSiteContent;