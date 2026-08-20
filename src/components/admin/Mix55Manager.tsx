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
        supabase.from("mix55_settings").select("id,start_date,rounds_count").limit(1).maybeSingle(),
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
          series: Number(draft[t.id].series) || 0,
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
      toast({ title: "Sparat", description: `Omgång ${round} har sparats` });
    } catch (e) {
      console.error(e);
      toast({ title: "Fel", description: "Kunde inte spara omgången", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };


  const addRound = async () => {
    const num = Number(newRound.round_number);
    if (!num || num < 1 || !newRound.play_at) {
      toast({
        title: "Fel",
        description: "Ange omgångsnummer samt datum och tid",
        variant: "destructive",
      });
      return;
    }
    const { error } = await supabase.from("mix55_rounds").insert({
      round_number: num,
      play_at: new Date(newRound.play_at).toISOString(),
      note: newRound.note.trim() || null,
    });
    if (error) {
      toast({
        title: "Fel",
        description: "Kunde inte spara speltillfället (finns omgången redan?)",
        variant: "destructive",
      });
      return;
    }
    setNewRound({ round_number: "", play_at: "", note: "" });
    await loadData();
    toast({ title: "Sparat", description: "Speltillfället har lagts till" });
  };

  const updateRound = async (r: Mix55Round) => {
    const { error } = await supabase
      .from("mix55_rounds")
      .update({ play_at: new Date(r.play_at).toISOString(), note: r.note })
      .eq("id", r.id);
    if (error) {
      toast({ title: "Fel", description: "Kunde inte spara ändringen", variant: "destructive" });
      return;
    }
    toast({ title: "Sparat", description: `Omgång ${r.round_number} uppdaterad` });
  };

  const deleteRound = async (id: string) => {
    if (!window.confirm("Ta bort speltillfället?")) return;
    const { error } = await supabase.from("mix55_rounds").delete().eq("id", id);
    if (error) {
      toast({ title: "Fel", description: "Kunde inte ta bort", variant: "destructive" });
      return;
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
          <CardTitle className="text-lg">Lag ({teams.length}/16)</CardTitle>
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
            {teams.map((team) => (
              <div key={team.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
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
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resultat per omgång</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="mix55-round">Omgång</Label>
              <Input
                id="mix55-round"
                type="number"
                min={1}
                className="w-28"
                value={round}
                onChange={(e) => setRound(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
            <Button onClick={saveRound} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Sparar..." : `Spara omgång ${round}`}
            </Button>
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
                  <Input
                    type="number"
                    placeholder="Serier"
                    value={draft[team.id]?.series ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        [team.id]: { ...draft[team.id], series: e.target.value },
                      })
                    }
                  />
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
            Alla 16 lag spelar samma dag på 8 banor (2 lag per bana). Banorna roterar automatiskt ett
            steg per omgång – lag som spelade på bana 1 spelar på bana 2 nästa omgång.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
            <div className="space-y-1">
              <Label htmlFor="mix55-new-round">Omgång</Label>
              <Input
                id="mix55-new-round"
                type="number"
                min={1}
                value={newRound.round_number}
                onChange={(e) => setNewRound({ ...newRound, round_number: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mix55-new-date">Datum & tid</Label>
              <Input
                id="mix55-new-date"
                type="datetime-local"
                value={newRound.play_at}
                onChange={(e) => setNewRound({ ...newRound, play_at: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mix55-new-note">Notering (valfri)</Label>
              <Input
                id="mix55-new-note"
                value={newRound.note}
                onChange={(e) => setNewRound({ ...newRound, note: e.target.value })}
              />
            </div>
            <Button onClick={addRound}>
              <Plus className="w-4 h-4 mr-2" /> Lägg till omgång
            </Button>
          </div>

          <div className="space-y-4">
            {rounds.map((r) => (
              <div key={r.id} className="border rounded-lg p-3 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                  <div className="font-semibold">Omgång {r.round_number}</div>
                  <Input
                    type="datetime-local"
                    value={toLocalInput(r.play_at)}
                    onChange={(e) =>
                      setRounds(
                        rounds.map((x) =>
                          x.id === r.id
                            ? { ...x, play_at: new Date(e.target.value).toISOString() }
                            : x,
                        ),
                      )
                    }
                  />
                  <Input
                    placeholder="Notering"
                    value={r.note ?? ""}
                    onChange={(e) =>
                      setRounds(rounds.map((x) => (x.id === r.id ? { ...x, note: e.target.value } : x)))
                    }
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => updateRound(r)}>
                      <Save className="w-4 h-4 mr-1" /> Spara
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      aria-label={`Ta bort omgång ${r.round_number}`}
                      onClick={() => deleteRound(r.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{formatRoundDate(r.play_at)}</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {buildLaneSchedule(teams, r.round_number).map((lane) => (
                    <div key={lane.lane} className="flex gap-2 bg-muted/40 rounded-md px-3 py-1.5 text-sm">
                      <span className="font-semibold text-primary shrink-0">Bana {lane.lane}</span>
                      <span>{lane.teams.length > 0 ? lane.teams.map((t) => t.name).join(" – ") : "Ledig"}</span>
                    </div>
                  ))}
                </div>
              </div>
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
