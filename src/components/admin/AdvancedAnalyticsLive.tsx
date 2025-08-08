import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, MousePointerClick, Activity, Globe } from "lucide-react";

interface EventCount { name: string; count: number }
interface VitalAvg { name: string; avg: number }

const AdvancedAnalyticsLive: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [totalPV, setTotalPV] = useState(0);
  const [events, setEvents] = useState<EventCount[]>([]);
  const [vitals, setVitals] = useState<VitalAvg[]>([]);
  const [topIPs, setTopIPs] = useState<{ ip: string; count: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const since = new Date();
        since.setDate(since.getDate() - 7);
        const sinceIso = since.toISOString();

        // Page views count (last 7d)
        const { count: pvCount } = await (supabase as any)
          .from('analytics_page_views')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sinceIso);
        setTotalPV(pvCount || 0);

        // Top IPs by page views (last 7d)
        const { data: pvRows } = await (supabase as any)
          .from('analytics_page_views')
          .select('ip_address, created_at')
          .gte('created_at', sinceIso)
          .limit(5000);
        const ipMap: Record<string, number> = {};
        (pvRows || []).forEach((r: any) => {
          const ip = r.ip_address as string | null;
          if (ip) ipMap[ip] = (ipMap[ip] || 0) + 1;
        });
        setTopIPs(
          Object.entries(ipMap)
            .map(([ip, count]) => ({ ip, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        );

        // Events (last 7d)
        const { data: evData } = await (supabase as any)
          .from('analytics_events')
          .select('event_name, created_at')
          .gte('created_at', sinceIso)
          .limit(1000);
        const map: Record<string, number> = {};
        (evData || []).forEach((r: any) => {
          map[r.event_name] = (map[r.event_name] || 0) + 1;
        });
        setEvents(Object.entries(map).map(([name, count]) => ({ name, count })).sort((a,b)=>b.count-a.count));

        // Web vitals average (last 7d)
        const { data: vitData } = await (supabase as any)
          .from('analytics_web_vitals')
          .select('name, value')
          .gte('created_at', sinceIso)
          .limit(5000);
        const agg: Record<string, { sum: number; n: number }> = {};
        (vitData || []).forEach((r: any) => {
          if (!agg[r.name]) agg[r.name] = { sum: 0, n: 0 };
          agg[r.name].sum += Number(r.value) || 0;
          agg[r.name].n += 1;
        });
        setVitals(Object.entries(agg).map(([name, v]) => ({ name, avg: v.sum / Math.max(v.n,1) })));        
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Avancerad Statistik (live)</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Laddar...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Sidvisningar (7 dagar)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPV}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointerClick className="w-5 h-5 text-primary" /> Topp‑events (7 dagar)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {events.slice(0,5).map((e) => (
                <div key={e.name} className="flex justify-between text-sm">
                  <span>{e.name}</span>
                  <Badge variant="secondary">{e.count}</Badge>
                </div>
              ))}
              {events.length === 0 && <p className="text-muted-foreground text-sm">Inga events än</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Web Vitals (medel)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vitals.map((v) => (
                <div key={v.name} className="flex justify-between text-sm">
                  <span>{v.name}</span>
                  <span className="font-medium">{v.avg.toFixed(2)}</span>
                </div>
              ))}
              {vitals.length === 0 && <p className="text-muted-foreground text-sm">Inga mätvärden än</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> Topp IP‑adresser (7 dagar)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topIPs.map((row) => (
                <div key={row.ip} className="flex justify-between text-sm">
                  <span className="font-mono">{row.ip}</span>
                  <Badge variant="secondary">{row.count}</Badge>
                </div>
              ))}
              {topIPs.length === 0 && <p className="text-muted-foreground text-sm">Ingen IP‑data än</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsLive;
