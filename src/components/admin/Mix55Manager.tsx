import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Trash2, Download, RotateCcw, CalendarDays, ArrowUp, ArrowDown } from "lucide-react";
import {
  buildStandings,
  buildRoundDates,
  buildSessionSchedule,
  calculateRoundPoints,
  formatPoints,
  formatRoundDay,
  isThursday,
  SERIES_PER_ROUND,
  type Mix55Score,
  type Mix55Settings,
  type Mix55Team,
} from "@/lib/mix55";

const Mix55Manager = () => {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Mix55Team[]>([]);
  const [scores, setScores] = useState<Mix55Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [round, setRound] = useState(1);
  const [draft, setDraft] = useState<Record<string, { pins: string; series: string }>>({});
  const [newTeam, setNewTeam] = useState({ name: "", player1: "", player2: "" });
  const [settings, setSettings] = useState<Mix55Settings | null>(null);
  const [startDate, setStartDate] = useState("");
  const [roundsCount, setRoundsCount] = useState("10");
  const [pauseAfterRound, setPauseAfterRound] = useState("");
  const [resumeDate, setResumeDate] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [teamsRes, scoresRes, settingsRes] = await Promise.all([
        supabase
          .from("mix55_teams")
          .select("id,name,player1,player2,sort_order")
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true }),
        supabase.from("mix55_scores").select("id,team_id,round_number,pins,series"),
        supabase.from("mix55_settings").select("id,start_date,rounds_count,pause_after_round,resume_date").limit(1).maybeSingle(),
      ]);
      if (teamsRes.error) throw teamsRes.error;
      if (scoresRes.error) throw scoresRes.error;
      if (settingsRes.error) throw settingsRes.error;
      setTeams((teamsRes.data as Mix55Team[]) ?? []);
      setScores((scoresRes.data as Mix55Score[]) ?? []);
      const s = (settingsRes.data as Mix55Settings | null) ?? null;
      setSettings(s);
      if (s) {
        setStartDate(s.start_date);
        setRoundsCount(String(s.rounds_count));
        setPauseAfterRound(s.pause_after_round != null ? String(s.pause_after_round) : "");
        setResumeDate(s.resume_date ?? "");
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Fel", description: "Kunde inte ladda Mix 55+ data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const next: Record<string, { pins: string; series: string }> = {};
    for (const team of teams) {
      const existing = scores.find((s) => s.team_id === team.id && s.round_number === round);
      next[team.id] = {
        pins: existing ? String(existing.pins) : "",
        series: existing ? String(existing.series) : "",
      };
    }
    setDraft(next);
  }, [teams, scores, round]);

  const previewPoints = useMemo(() => {
    const entries = teams
      .filter((t) => draft[t.id]?.pins !== "" && draft[t.id]?.pins != null)
      .map((t) => ({ team_id: t.id, pins: Number(draft[t.id].pins) || 0 }));
    return calculateRoundPoints(entries, Math.max(teams.length, 1));
  }, [teams, draft]);

  const pauseAfter = useMemo(
    () => (pauseAfterRound ? Math.max(1, Number(pauseAfterRound) || 0) : null),
    [pauseAfterRound],
  );

  const scheduleRounds = useMemo(
    () =>
      buildRoundDates(
        startDate,
        Math.max(1, Number(roundsCount) || 0),
        pauseAfter,
        resumeDate || null,
      ),
    [startDate, roundsCount, pauseAfter, resumeDate],
  );

  const savedRounds = useMemo(
    () => new Set(scores.map((s) => s.round_number)),
    [scores],
  );

  const roundOptions = useMemo(() => {
    const maxRounds = Math.max(1, Number(roundsCount) || 1);
    const highest = Math.max(maxRounds, round, ...Array.from(savedRounds, (r) => r));
    return Array.from({ length: highest }, (_, i) => i + 1);
  }, [roundsCount, round, savedRounds]);

  const addTeam = async () => {
    if (!newTeam.name.trim()) {
      toast({ title: "Fel", description: "Lagnamn krävs", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("mix55_teams").insert({
      name: newTeam.name.trim(),
      player1: newTeam.player1.trim(),
      player2: newTeam.player2.trim(),
      sort_order: teams.length,
    });
    if (error) {
      toast({ title: "Fel", description: "Kunde inte lägga till laget", variant: "destructive" });
      return;
    }
    setNewTeam({ name: "", player1: "", player2: "" });
    await loadData();
    toast({ title: "Sparat", description: "Laget har lagts till" });
  };

  const updateTeam = async (team: Mix55Team) => {
    const { error } = await supabase
      .from("mix55_teams")
      .update({ name: team.name, player1: team.player1, player2: team.player2 })
      .eq("id", team.id);
    if (error) {
      toast({ title: "Fel", description: "Kunde inte spara laget", variant: "destructive" });
      return;
    }
    toast({ title: "Sparat", description: "Laget har uppdaterats" });
  };

  const deleteTeam = async (id: string) => {
    if (!window.confirm("Ta bort laget och alla dess resultat?")) return;
    const { error } = await supabase.from("mix55_teams").delete().eq("id", id);
    if (error) {
      toast({ title: "Fel", description: "Kunde inte ta bort laget", variant: "destructive" });
      return;
    }
    await loadData();
    toast({ title: "Borttaget", description: "Laget är borttaget" });
  };

  const saveRound = async () => {
    setSaving(true);
    try {
      const rows = teams
        .filter((t) => draft[t.id]?.pins !== "" && draft[t.id]?.pins != null)
        .map((t) => ({
          team_id: t.id,
          round_number: round,
          pins: Number(draft[t.id].pins) || 0,
          series: SERIES_PER_ROUND,
        }));

      if (rows.length === 0) {
        toast({ title: "Inget att spara", description: "Fyll i minst ett resultat" });
        return;
      }

      const { error } = await supabase
        .from("mix55_scores")
        .upsert(rows, { onConflict: "team_id,round_number" });
      if (error) throw error;

      await loadData();
      const savedRound = round;
      const maxRounds = Math.max(1, Number(roundsCount) || 1);
      if (savedRound < maxRounds) {
        setRound(savedRound + 1);
        toast({
          title: "Sparat",
          description: `Omgång ${savedRound} har sparats. Omgång ${savedRound + 1} är nu öppen – du kan alltid gå tillbaka och redigera.`,
        });
      } else {
        toast({ title: "Sparat", description: `Omgång ${savedRound} har sparats` });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Fel", description: "Kunde inte spara omgången", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const clearRound = async () => {
    if (!window.confirm(`Rensa alla resultat för omgång ${round}? Detta kan inte ångras.`)) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("mix55_scores").delete().eq("round_number", round);
      if (error) throw error;
      await loadData();
      toast({ title: "Rensat", description: `Alla resultat för omgång ${round} är borttagna` });
    } catch (e) {
      console.error(e);
      toast({ title: "Fel", description: "Kunde inte rensa omgången", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };


  const saveSettings = async () => {
    if (!startDate) {
      toast({ title: "Fel", description: "Välj startdatum", variant: "destructive" });
      return;
    }
    if (!isThursday(startDate)) {
      toast({ title: "Fel", description: "Startdatumet måste vara en torsdag", variant: "destructive" });
      return;
    }
    if (pauseAfter != null && !resumeDate) {
      toast({ title: "Fel", description: "Välj datum för återstart efter pausen", variant: "destructive" });
      return;
    }
    if (resumeDate && !isThursday(resumeDate)) {
      toast({ title: "Fel", description: "Återstartsdatumet måste vara en torsdag", variant: "destructive" });
      return;
    }
    const count = Math.max(1, Number(roundsCount) || 1);
    const payload = {
      start_date: startDate,
      rounds_count: count,
      pause_after_round: pauseAfter,
      resume_date: pauseAfter != null ? resumeDate : null,
    };
    const { error } = settings
      ? await supabase.from("mix55_settings").update(payload).eq("id", settings.id)
      : await supabase.from("mix55_settings").insert(payload);
    if (error) {
      toast({ title: "Fel", description: "Kunde inte spara spelschemat", variant: "destructive" });
      return;
    }
    await loadData();
    toast({ title: "Sparat", description: "Spelschemat har uppdaterats" });
  };

  const moveTeam = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= teams.length) return;
    const next = [...teams];
    [next[index], next[target]] = [next[target], next[index]];
    setTeams(next);
    const updates = next.map((t, i) =>
      supabase.from("mix55_teams").update({ sort_order: i + 1 }).eq("id", t.id),
    );
    const results = await Promise.all(updates);
    if (results.some((r) => r.error)) {
      toast({ title: "Fel", description: "Kunde inte spara ordningen", variant: "destructive" });
    }
    await loadData();
  };

  const exportCsv = () => {
    const standings = buildStandings(teams, scores, "total");
    const header = [
      "Placering",
      "Lag",
      "Spelare 1",
      "Spelare 2",
      "Matcher",
      "Total slagning",
      "Serier",
      "Snitt",
      "Total poäng",
    ];
    const lines = standings.map((row, idx) =>
      [
        idx + 1,
        row.team.name,
        row.team.player1,
        row.team.player2,
        row.matchesPlayed,
        row.totalPins,
        row.totalSeries,
        row.average.toFixed(2),
        formatPoints(row.totalPoints),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(";"),
    );
    const csv = [header.join(";"), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "korpen-mix-55-tabell.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetScores = async () => {
    if (!window.confirm("Nollställ ALLA resultat? Lagen behålls.")) return;
    const { error } = await supabase
      .from("mix55_scores")
      .delete()
      .not("id", "is", null);
    if (error) {
      toast({ title: "Fel", description: "Kunde inte nollställa", variant: "destructive" });
      return;
    }
    await loadData();
    toast({ title: "Nollställt", description: "Alla resultat är borttagna" });
  };

  if (loading) return <p className="text-muted-foreground">Laddar...</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lag ({teams.length}/14)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <Input
              placeholder="Lagnamn"
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            />
            <Input
              placeholder="Spelare 1"
              value={newTeam.player1}
              onChange={(e) => setNewTeam({ ...newTeam, player1: e.target.value })}
            />
            <Input
              placeholder="Spelare 2"
              value={newTeam.player2}
              onChange={(e) => setNewTeam({ ...newTeam, player2: e.target.value })}
            />
            <Button onClick={addTeam}>
              <Plus className="w-4 h-4 mr-2" /> Lägg till lag
            </Button>
          </div>

          <div className="space-y-2">
            {teams.map((team, index) => (
              <React.Fragment key={team.id}>
                {index === 0 && (
                  <p className="text-sm font-semibold text-primary pt-2">Pass 1 · 14:00–15:30 (lag 1–7)</p>
                )}
                {index === 7 && (
                  <p className="text-sm font-semibold text-primary pt-2">Pass 2 · 15:30–17:00 (lag 8–14)</p>
                )}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                <div className="flex items-center gap-1">
                  <span className="w-6 text-sm text-muted-foreground tabular-nums">{index + 1}.</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={`Flytta upp ${team.name}`}
                    disabled={index === 0}
                    onClick={() => moveTeam(index, -1)}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={`Flytta ner ${team.name}`}
                    disabled={index === teams.length - 1}
                    onClick={() => moveTeam(index, 1)}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  value={team.name}
                  onChange={(e) =>
                    setTeams(teams.map((t) => (t.id === team.id ? { ...t, name: e.target.value } : t)))
                  }
                />
                <Input
                  value={team.player1}
                  onChange={(e) =>
                    setTeams(
                      teams.map((t) => (t.id === team.id ? { ...t, player1: e.target.value } : t)),
                    )
                  }
                />
                <Input
                  value={team.player2}
                  onChange={(e) =>
                    setTeams(
                      teams.map((t) => (t.id === team.id ? { ...t, player2: e.target.value } : t)),
                    )
                  }
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => updateTeam(team)}>
                    <Save className="w-4 h-4 mr-1" /> Spara
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    aria-label={`Ta bort ${team.name}`}
                    onClick={() => deleteTeam(team.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resultat per omgång</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Omgång</Label>
            <div className="flex flex-wrap gap-2">
              {roundOptions.map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={r === round ? "default" : savedRounds.has(r) ? "secondary" : "outline"}
                  className="rounded-full"
                  onClick={() => setRound(r)}
                >
                  Omgång {r}
                  {savedRounds.has(r) && " ✓"}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {savedRounds.has(round)
                ? `Omgång ${round} är sparad – ändra siffrorna och spara igen för att korrigera.`
                : `Omgång ${round} är öppen för inmatning.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveRound} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Sparar..." : `Spara omgång ${round}`}
            </Button>
            {savedRounds.has(round) && (
              <Button variant="destructive" onClick={clearRound} disabled={saving}>
                <Trash2 className="w-4 h-4 mr-2" />
                Rensa omgång {round}
              </Button>
            )}
          </div>

          {teams.length === 0 ? (
            <p className="text-muted-foreground">Lägg till lag först.</p>
          ) : (
            <div className="space-y-2">
              {teams.map((team) => (
                <div key={team.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                  <div className="font-medium">{team.name}</div>
                  <Input
                    type="number"
                    placeholder="Slagning"
                    value={draft[team.id]?.pins ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        [team.id]: { ...draft[team.id], pins: e.target.value },
                      })
                    }
                  />
                  <div className="text-sm text-muted-foreground">
                    Serier: {SERIES_PER_ROUND} (fast)
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Poäng: {previewPoints[team.id] != null ? formatPoints(previewPoints[team.id]) : "–"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5" /> Spelschema & banor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Serien spelas varannan torsdag. Lag 1–7 spelar 14:00–15:30 och lag 8–14 spelar
            15:30–17:00 (ordningen styr du i listan ovan). Varje lag har egen bana och flyttar en
            bana per omgång.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
            <div className="space-y-1">
              <Label htmlFor="mix55-start-date">Första torsdagen</Label>
              <Input
                id="mix55-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              {startDate && !isThursday(startDate) && (
                <p className="text-xs text-destructive">Välj en torsdag</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="mix55-rounds-count">Antal omgångar</Label>
              <Input
                id="mix55-rounds-count"
                type="number"
                min={1}
                value={roundsCount}
                onChange={(e) => setRoundsCount(e.target.value)}
              />
            </div>
            <Button onClick={saveSettings}>
              <Save className="w-4 h-4 mr-2" /> Spara spelschema
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
            <div className="space-y-1">
              <Label htmlFor="mix55-pause-after">Paus efter omgång (valfritt)</Label>
              <Input
                id="mix55-pause-after"
                type="number"
                min={1}
                placeholder="T.ex. 8"
                value={pauseAfterRound}
                onChange={(e) => setPauseAfterRound(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mix55-resume-date">Återstart efter paus (torsdag)</Label>
              <Input
                id="mix55-resume-date"
                type="date"
                value={resumeDate}
                onChange={(e) => setResumeDate(e.target.value)}
              />
              {resumeDate && !isThursday(resumeDate) && (
                <p className="text-xs text-destructive">Välj en torsdag</p>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Lämna pausfälten tomma för spel varannan torsdag utan uppehåll.
          </p>

          <div className="space-y-4">
            {scheduleRounds.map((r) => (
              <React.Fragment key={r.round_number}>
                {pauseAfter != null && resumeDate && r.round_number === pauseAfter + 1 && (
                  <p className="text-sm font-semibold text-primary text-center py-1">
                    — Paus (uppehåll) —
                  </p>
                )}
              <div className="border rounded-lg p-3 space-y-3">
                <div className="font-semibold">
                  Omgång {r.round_number} – {formatRoundDay(r.date)}
                </div>
                {buildSessionSchedule(teams, r.round_number).map((group) => (
                  <div key={group.session.index} className="space-y-1">
                    <div className="text-sm font-medium text-primary">
                      {group.session.label} · {group.session.startTime}–{group.session.endTime}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {group.lanes.map((lane) => (
                        <div
                          key={lane.lane}
                          className="flex gap-2 bg-muted/40 rounded-md px-3 py-1.5 text-sm"
                        >
                          <span className="font-semibold text-primary shrink-0">Bana {lane.lane}</span>
                          <span>{lane.teams.length > 0 ? lane.teams.map((t) => t.name).join(", ") : "Ledig"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={exportCsv}>
          <Download className="w-4 h-4 mr-2" /> Exportera tabell (CSV)
        </Button>
        <Button variant="destructive" onClick={resetScores}>
          <RotateCcw className="w-4 h-4 mr-2" /> Nollställ alla resultat
        </Button>
      </div>
    </div>
  );
};

export default Mix55Manager;
