import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import React, { useEffect, useMemo, useState } from "react";
import { markarydsliganDefaultSeries } from "@/data/markarydsliganDefaults";

const Markarydsligan = () => {
  // SEO optimization for markarydsligan page
  useSEO({
    title: "Markarydsligan - Bowlingserier | Markaryds Bowlinghall",
    description: "Följ Markarydsligan med våra 5 bowlingserier - Serie A, B, C, D och E. Se tabeller, resultat och anmäl ditt lag för säsongen.",
    keywords: "markarydsligan, bowlingserier, serie a, serie b, serie c, bowling liga, markaryd, bowlinghall",
    canonical: "https://markarydsbowling.se/markarydsligan"
  });

  type SerieRow = {
    id: string;
    name: string;
    schedule: string;
    url: string;
    sort_order: number | null;
  };

  const [dbSeries, setDbSeries] = useState<SerieRow[] | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("markarydsligan_series")
          .select("id,name,schedule,url,sort_order")
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true });

        if (error) throw error;
        if (!active) return;
        setDbSeries((data as SerieRow[]) ?? []);
      } catch (e) {
        console.error("Error loading markarydsligan series (public):", e);
        if (!active) return;
        setDbSeries([]);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const series = useMemo(() => {
    if (dbSeries && dbSeries.length > 0) return dbSeries;
    // Fallback: om DB är tom eller inte laddad än, visa nuvarande default-serier
    return markarydsliganDefaultSeries.map((s, idx) => ({
      id: `default-${idx}-${s.name}`,
      name: s.name,
      schedule: s.schedule,
      url: s.url,
      sort_order: idx,
    }));
  }, [dbSeries]);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Markarydsligan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Välkommen till Markarydsligan - vår lokala bowlingserie med fem divisioner för alla nivåer
            </p>
          </div>

          {/* Series Buttons with Schedule */}
          <div className="max-w-4xl mx-auto space-y-6">
            {series.map((serie) => (
              <div key={serie.id} className="flex flex-col sm:flex-row items-center justify-between bg-card p-6 rounded-lg border">
                <div className="text-center sm:text-left mb-4 sm:mb-0">
                  <h2 className="text-2xl font-bold text-foreground mb-2">{serie.name}</h2>
                  <p className="text-lg text-muted-foreground">{serie.schedule}</p>
                </div>
                <Button 
                  size="lg" 
                  className="rounded-full px-8 py-3 font-semibold"
                  asChild
                >
                  <a href={serie.url} target="_blank" rel="noopener noreferrer">
                    Se tabell & resultat
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Markarydsligan;