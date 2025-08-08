import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from "web-vitals";
import { supabase } from "@/integrations/supabase/client";

const sendVital = async (name: string, value: number, rating?: string) => {
  try {
    await (supabase as any).from('analytics_web_vitals').insert({
      session_id: localStorage.getItem('mb_session') || 'unknown',
      path: location.pathname,
      name,
      value,
      rating: rating || null,
    });
  } catch {}
};

export default function AnalyticsInit() {
  const { pathname } = useLocation();
  const { trackPageView, trackEvent } = useAnalytics();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest('[data-analytics]') as HTMLElement | null;
      if (el) {
        const name = el.getAttribute('data-analytics') || 'click';
        const label = el.getAttribute('data-analytics-label') || undefined;
        trackEvent(name, { label });
      }
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [trackEvent]);

  useEffect(() => {
    const send = (metric: Metric) => sendVital(metric.name, metric.value, metric.rating as any);
    onLCP(send);
    onCLS(send);
    onINP(send);
    onFCP(send);
    onTTFB(send);
  }, []);

  return null;
}
