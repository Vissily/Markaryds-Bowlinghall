import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "mb_session";

function getSessionId() {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export function useAnalytics() {
  const sessionIdRef = useRef<string>(getSessionId());

  // Track a page view
  const trackPageView = async (path: string) => {
    try {
      const { data: userRes } = await (supabase as any).auth.getUser();
      const { width, height } = window.screen || ({} as any);
      await (supabase as any).from('analytics_page_views').insert({
        user_id: userRes?.user?.id ?? null,
        session_id: sessionIdRef.current,
        path,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        viewport_width: width ?? null,
        viewport_height: height ?? null,
      });
    } catch (e) {
      // silent
    }
  };

  // Track a custom event
  const trackEvent = async (
    event_name: string,
    payload?: { label?: string; value?: number; metadata?: Record<string, any> }
  ) => {
    try {
      const { data: userRes } = await (supabase as any).auth.getUser();
      await (supabase as any).from('analytics_events').insert({
        user_id: userRes?.user?.id ?? null,
        session_id: sessionIdRef.current,
        path: location.pathname,
        event_name,
        event_label: payload?.label ?? null,
        event_value: payload?.value ?? null,
        metadata: payload?.metadata ?? {},
      });
    } catch (e) {}
  };

  return { trackPageView, trackEvent, sessionId: sessionIdRef.current };
}
