import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useSEO, createBreadcrumbJsonLd, createWebPageJsonLd } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import {
  buildStandings,
  buildRoundDates,
  buildSessionSchedule,
  formatPoints,
  formatRoundDay,
  type Mix55Settings,
  type Mix55Score,
  type Mix55Team,
} from "@/lib/mix55";
import { Trophy, Medal, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const PLAYOFF_CUTOFF = 8;

const Mix55 = () => {
  useSEO({
    title: "Korpen Mix 55+ – Tabell & Resultat | Markaryds Bowlinghall",
    description:
      "Följ Korpen Mix 55+ i Markaryd. Se tabell, omgångarnas slagning, snitt och totalpoäng samt vilka lag som är på slutspelsplats.",
    keywords: "korpen mix 55+, bowling markaryd, mix 55 tabell, bowlingserie 55 plus",
    canonical: "https://markarydsbowling.se/mix55",
    jsonLd: [
      createBreadcrumbJsonLd([
        { name: "Hem", url: "https://markarydsbowling.se" },
        { name: "Korpen Mix 55+", url: "https://markarydsbowling.se/mix55" },
      ]),
      createWebPageJsonLd({
        name: "Korpen Mix 55+",
        description: "Tabell och resultat för Korpen Mix 55+ på Markaryds Bowlinghall.",
        url: "https://markarydsbowling.se/mix55",
      }),
    ],
  });

  const [teams, setTeams] = useState<Mix55Team[]>([]);
  const [scores, setScores] = useState<Mix55Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState<number | "total">("total");
  const [view, setView] = useState<"table" | "schedule" | "bracket">("table");
  const [settings, setSettings] = useState<Mix55Settings | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [teamsRes, scoresRes, settingsRes] = await Promise.all([
          supabase
            .from("mix55_teams")
            .select("id,name,player1,player2,sort_order")
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true }),
          supabase.from("mix55_scores").select("id,team_id,round_number,pins,series"),
          supabase.from("mix55_settings").select("id,start_date,rounds_count").limit(1).maybeSingle(),
        ]);
        if (teamsRes.error) throw teamsRes.error;
        if (scoresRes.error) throw scoresRes.error;
        if (settingsRes.error) throw settingsRes.error;
        if (!active) return;
        setTeams((teamsRes.data as Mix55Team[]) ?? []);
        setScores((scoresRes.data as Mix55Score[]) ?? []);
        setSettings((settingsRes.data as Mix55Settings | null) ?? null);
      } catch (e) {
        console.error("Error loading Mix 55+ data:", e);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const scheduleRounds = useMemo(
    () => (settings ? buildRoundDates(settings.start_date, settings.rounds_count) : []),
    [settings],
  );

  const scoredRounds = useMemo(
    () =>
      Array.from(
        new Set([...scores.map((s) => s.round_number), ...scheduleRounds.map((r) => r.round_number)]),
      ).sort((a, b) => a - b),
    [scores, scheduleRounds],
  );

  const standings = useMemo(
    () => buildStandings(teams, scores, selectedRound),
    [teams, scores, selectedRound],
  );

  const top8 = standings.slice(0, PLAYOFF_CUTOFF);
  const isTotal = selectedRound === "total";

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Korpen Mix 55+</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Bowlingturnering för 16 lag med två spelare i varje lag. Topp 8 går vidare till slutspel.
            </p>
          </div>

          {/* Filter */}
          <div className="max-w-6xl mx-auto mb-6 flex flex-wrap gap-2 justify-center">
            <Button
              variant={view === "table" && selectedRound === "total" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => {
                setView("table");
                setSelectedRound("total");
              }}
            >
              Totalt
            </Button>
            {scoredRounds.map((round) => (
              <Button
                key={round}
                variant={view === "table" && selectedRound === round ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => {
                  setView("table");
                  setSelectedRound(round);
                }}
              >
                Omgång {round}
              </Button>
            ))}
            <Button
              variant={view === "schedule" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setView(view === "schedule" ? "table" : "schedule")}
            >
              <CalendarDays className="w-4 h-4 mr-1" />
              Spelschema
            </Button>
            <Button
              variant={view === "bracket" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setView(view === "bracket" ? "table" : "bracket")}
            >
              <Trophy className="w-4 h-4 mr-1" />
              Slutspel
            </Button>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-12">Laddar tabell...</p>
          ) : teams.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Inga lag är inlagda ännu. Tabellen visas så snart serien startar.
            </p>
          ) : view === "schedule" ? (
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold text-center text-foreground">Spelschema</h2>
              <p className="text-center text-muted-foreground">
                Varannan torsdag. Lag 1–8 spelar 14:00–15:30, lag 9–16 spelar 15:30–17:00.
              </p>
              {scheduleRounds.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Spelschemat är inte inlagt ännu.
                </p>
              ) : (
                scheduleRounds.map((r) => (
                  <div key={r.round_number} className="bg-card border rounded-lg p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                      <h3 className="text-xl font-bold text-foreground">Omgång {r.round_number}</h3>
                      <span className="text-base text-muted-foreground">{formatRoundDay(r.date)}</span>
                    </div>
                    <div className="space-y-4">
                      {buildSessionSchedule(teams, r.round_number).map((group) => (
                        <div key={group.session.index}>
                          <div className="text-sm font-semibold text-primary mb-2">
                            {group.session.label} · {group.session.startTime}–{group.session.endTime}
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {group.lanes.map((lane) => (
                              <div
                                key={lane.lane}
                                className="flex items-start gap-3 bg-muted/40 rounded-md px-3 py-2"
                              >
                                <span className="text-lg font-bold text-primary shrink-0">
                                  Bana {lane.lane}
                                </span>
                                <span className="text-base text-foreground">
                                  {lane.teams.length > 0
                                    ? lane.teams.map((t) => t.name).join(", ")
                                    : "Ledig"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : view === "bracket" ? (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4 text-center text-foreground">Slutspel – Topp 8</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[0, 1, 2, 3].map((i) => {
                  const home = top8[i];
                  const away = top8[PLAYOFF_CUTOFF - 1 - i];
                  return (
                    <div key={i} className="bg-card border rounded-lg p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                        Kvartsfinal {i + 1}
                      </div>
                      <div className="flex items-center justify-between text-lg font-semibold text-foreground">
                        <span className="truncate">{home ? `${i + 1}. ${home.team.name}` : "–"}</span>
                        <span className="text-muted-foreground text-sm px-2">mot</span>
                        <span className="truncate text-right">
                          {away ? `${PLAYOFF_CUTOFF - i}. ${away.team.name}` : "–"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              {/* Desktop table */}
              <div className="hidden lg:block bg-card border rounded-lg overflow-hidden">
                <table className="w-full text-base">
                  <thead className="bg-muted/60">
                    <tr className="text-left text-sm uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-3">#</th>
                      <th className="px-3 py-3">Lag</th>
                      <th className="px-3 py-3 text-right">Matcher</th>
                      <th className="px-3 py-3 text-right">Omg. slagning</th>
                      <th className="px-3 py-3 text-right">Omg. poäng</th>
                      <th className="px-3 py-3 text-right">Total slagning</th>
                      <th className="px-3 py-3 text-right">Serier</th>
                      <th className="px-3 py-3 text-right">Snitt</th>
                      <th className="px-3 py-3 text-right">Poäng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row, idx) => (
                      <tr
                        key={row.team.id}
                        className={cn(
                          "border-t border-border",
                          idx < PLAYOFF_CUTOFF && "bg-primary/5",
                          idx === PLAYOFF_CUTOFF && "border-t-4 border-primary",
                        )}
                      >
                        <td className="px-3 py-3 font-bold tabular-nums">{idx + 1}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-semibold text-foreground">{row.team.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {[row.team.player1, row.team.player2].filter(Boolean).join(" & ")}
                              </div>
                            </div>
                            {idx < PLAYOFF_CUTOFF && (
                              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary text-xs font-semibold px-2 py-0.5">
                                <Medal className="w-3 h-3" /> Slutspel
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">{row.matchesPlayed}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{row.roundPins ?? "–"}</td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {row.roundPoints != null ? formatPoints(row.roundPoints) : "–"}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">{row.totalPins}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{row.totalSeries}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{row.average.toFixed(2)}</td>
                        <td className="px-3 py-3 text-right font-bold text-lg tabular-nums">
                          {formatPoints(row.totalPoints)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet cards */}
              <div className="lg:hidden space-y-3">
                {standings.map((row, idx) => (
                  <div key={row.team.id}>
                    {idx === PLAYOFF_CUTOFF && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="h-1 flex-1 bg-primary rounded-full" />
                        <span className="text-xs font-semibold uppercase text-primary">
                          Slutspelsgräns
                        </span>
                        <div className="h-1 flex-1 bg-primary rounded-full" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "bg-card border rounded-lg p-4",
                        idx < PLAYOFF_CUTOFF && "border-primary/40 bg-primary/5",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="text-2xl font-bold tabular-nums text-primary w-8 shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground truncate">{row.team.name}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {[row.team.player1, row.team.player2].filter(Boolean).join(" & ")}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-bold tabular-nums text-foreground">
                            {formatPoints(row.totalPoints)}
                          </div>
                          <div className="text-xs text-muted-foreground">poäng</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                        <div className="bg-muted/50 rounded-md py-2">
                          <div className="text-xs text-muted-foreground">Omg. slagning</div>
                          <div className="text-lg font-semibold tabular-nums">{row.roundPins ?? "–"}</div>
                        </div>
                        <div className="bg-muted/50 rounded-md py-2">
                          <div className="text-xs text-muted-foreground">Total slagning</div>
                          <div className="text-lg font-semibold tabular-nums">{row.totalPins}</div>
                        </div>
                        <div className="bg-muted/50 rounded-md py-2">
                          <div className="text-xs text-muted-foreground">Snitt</div>
                          <div className="text-lg font-semibold tabular-nums">
                            {row.average.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Matcher: {row.matchesPlayed} · Serier: {row.totalSeries} · Omg. poäng:{" "}
                        {row.roundPoints != null ? formatPoints(row.roundPoints) : "–"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Mix55;
