import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getLastActivity, isSessionExpired, updateLastActivity, SESSION_TIMEOUT_MS } from '@/utils/authSecurity';

export function useSessionTimeout() {
  const { signOut } = useAuth();

  useEffect(() => {
    const update = () => updateLastActivity();
    const events = ['mousemove', 'keydown', 'visibilitychange', 'click'];
    events.forEach((e) => window.addEventListener(e, update, { passive: true }));

    const interval = setInterval(() => {
      const last = getLastActivity();
      if (isSessionExpired(last)) {
        // Cleanly sign out on inactivity
        signOut();
      }
    }, 60 * 1000); // check every minute

    return () => {
      events.forEach((e) => window.removeEventListener(e, update));
      clearInterval(interval);
    };
  }, [signOut]);
}
