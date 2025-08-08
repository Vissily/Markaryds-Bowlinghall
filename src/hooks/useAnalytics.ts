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
      const { width, height } = window.screen || ({} as any);
      await (supabase as any).functions.invoke('log-analytics', {
        body: {
          kind: 'page_view',
          path,
          session_id: sessionIdRef.current,
          referrer: document.referrer || null,
          ua: navigator.userAgent,
          vp: { w: width ?? null, h: height ?? null },
        },
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
      await (supabase as any).functions.invoke('log-analytics', {
        body: {
          kind: 'event',
          path: location.pathname,
          session_id: sessionIdRef.current,
          name: event_name,
          label: payload?.label ?? null,
          value: payload?.value ?? null,
          meta: payload?.metadata ?? {},
        },
      });
    } catch (e) {}
  };

  return { trackPageView, trackEvent, sessionId: sessionIdRef.current };
}
