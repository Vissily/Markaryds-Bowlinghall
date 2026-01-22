import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, ArrowUp, Pencil, Plus, Save, Trash2, X } from "lucide-react";

type SerieRow = {
  id: string;
  name: string;
  schedule: string;
  url: string;
  sort_order: number | null;
};

const isValidHttpUrl = (value: string) => {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const normalizeUrl = (value: string) => {
  const v = value.trim();
  if (!v) return v;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
};

const MarkarydsliganManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [series, setSeries] = useState<SerieRow[]>([]);

  const [newName, setNewName] = useState("");
  const [newSchedule, setNewSchedule] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSchedule, setEditSchedule] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const sortedSeries = useMemo(() => {
    return [...series].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [series]);

  const loadSeries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("markarydsligan_series")
        .select("id,name,schedule,url,sort_order")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setSeries((data as SerieRow[]) ?? []);
    } catch (e) {
      console.error("Error loading markarydsligan series:", e);
      toast({
        title: "Fel",
        description: "Kunde inte ladda serier",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSeries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (row: SerieRow) => {
    setEditingId(row.id);
    setEditName(row.name);
    setEditSchedule(row.schedule);
    setEditUrl(row.url);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditSchedule("");
    setEditUrl("");
  };

  const validateInputs = (name: string, schedule: string, url: string) => {
    if (!name.trim()) {
      toast({ title: "Fel", description: "Namn krävs", variant: "destructive" });
      return false;
    }
    if (!schedule.trim()) {
      toast({ title: "Fel", description: "Speltid krävs", variant: "destructive" });
      return false;
    }
    const normalized = normalizeUrl(url);
    if (!normalized || !isValidHttpUrl(normalized)) {
      toast({
        title: "Fel",
        description: "SBHF-länk måste vara en giltig http/https-länk",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const addSerie = async () => {
    const urlNormalized = normalizeUrl(newUrl);
    if (!validateInputs(newName, newSchedule, urlNormalized)) return;

    setSaving(true);
    try {
      const nextSort = (sortedSeries.at(-1)?.sort_order ?? 0) + 1;
      const { error } = await supabase.from("markarydsligan_series").insert({
        name: newName.trim(),
        schedule: newSchedule.trim(),
        url: urlNormalized,
        sort_order: nextSort,
      });
      if (error) throw error;

      setNewName("");
      setNewSchedule("");
      setNewUrl("");
      toast({ title: "Sparat!", description: "Serie tillagd" });
      await loadSeries();
    } catch (e) {
      console.error("Error adding serie:", e);
      toast({ title: "Fel", description: "Kunde inte lägga till serie", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async (id: string) => {
    const urlNormalized = normalizeUrl(editUrl);
    if (!validateInputs(editName, editSchedule, urlNormalized)) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("markarydsligan_series")
        .update({ name: editName.trim(), schedule: editSchedule.trim(), url: urlNormalized })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Sparat!", description: "Serie uppdaterad" });
      cancelEdit();
      await loadSeries();
    } catch (e) {
      console.error("Error updating serie:", e);
      toast({ title: "Fel", description: "Kunde inte uppdatera serie", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteSerie = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("markarydsligan_series").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Borttagen", description: "Serie borttagen" });
      await loadSeries();
    } catch (e) {
      console.error("Error deleting serie:", e);
      toast({ title: "Fel", description: "Kunde inte ta bort serie", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const move = async (id: string, direction: "up" | "down") => {
    const idx = sortedSeries.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= sortedSeries.length) return;

    const a = sortedSeries[idx];
    const b = sortedSeries[swapWith];

    setSaving(true);
    try {
      const { error: e1 } = await supabase.from("markarydsligan_series").update({ sort_order: b.sort_order ?? 0 }).eq("id", a.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("markarydsligan_series").update({ sort_order: a.sort_order ?? 0 }).eq("id", b.id);
      if (e2) throw e2;

      await loadSeries();
    } catch (e) {
      console.error("Error reordering series:", e);
      toast({ title: "Fel", description: "Kunde inte sortera", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[240px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p>Laddar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lägg till serie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Namn</Label>
              <Input id="new-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="t.ex. Serie A" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-schedule">Speltid</Label>
              <Input
                id="new-schedule"
                value={newSchedule}
                onChange={(e) => setNewSchedule(e.target.value)}
                placeholder="t.ex. Måndag 18:30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-url">SBHF-länk</Label>
              <Input
                id="new-url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={addSerie} disabled={saving}>
              <Plus className="w-4 h-4 mr-2" />
              Lägg till
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Serier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedSeries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Inga serier ännu.</p>
          ) : (
            <div className="space-y-3">
              {sortedSeries.map((row, index) => {
                const isEditing = editingId === row.id;
                return (
                  <div key={row.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{row.name}</div>
                        <div className="text-sm text-muted-foreground">{row.schedule}</div>
                        <a
                          className="text-sm underline underline-offset-4 break-all"
                          href={row.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {row.url}
                        </a>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => move(row.id, "up")}
                          disabled={saving || index === 0}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => move(row.id, "down")}
                          disabled={saving || index === sortedSeries.length - 1}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        {!isEditing ? (
                          <Button variant="outline" size="sm" onClick={() => startEdit(row)} disabled={saving}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Ändra
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={cancelEdit} disabled={saving}>
                            <X className="w-4 h-4 mr-2" />
                            Avbryt
                          </Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => deleteSerie(row.id)} disabled={saving}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Ta bort
                        </Button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Namn</Label>
                          <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Speltid</Label>
                          <Input value={editSchedule} onChange={(e) => setEditSchedule(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>SBHF-länk</Label>
                          <Input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
                        </div>
                        <div className="lg:col-span-3 flex justify-end">
                          <Button onClick={() => saveEdit(row.id)} disabled={saving}>
                            <Save className="w-4 h-4 mr-2" />
                            Spara
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MarkarydsliganManager;
