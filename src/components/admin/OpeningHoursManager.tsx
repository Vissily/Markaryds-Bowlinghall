import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Clock } from 'lucide-react';

interface OpeningHour {
  id: string;
  day_of_week: number;
  open_time?: string;
  close_time?: string;
  is_closed: boolean;
}

const dayNames = [
  'Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'
];

const OpeningHoursManager = () => {
  const [hours, setHours] = useState<OpeningHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOpeningHours();
  }, []);

  const loadOpeningHours = async () => {
    try {
      const { data, error } = await supabase
        .from('opening_hours')
        .select('*')
        .order('day_of_week');

      if (error) throw error;

      setHours(data || []);
    } catch (error) {
      console.error('Error loading opening hours:', error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda öppettider",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateHour = (dayOfWeek: number, field: string, value: any) => {
    setHours(hours.map(hour => 
      hour.day_of_week === dayOfWeek 
        ? { ...hour, [field]: value }
        : hour
    ));
  };

  const saveOpeningHours = async () => {
    setSaving(true);
    try {
      const updates = hours.map(hour => ({
        id: hour.id,
        day_of_week: hour.day_of_week,
        open_time: hour.is_closed ? null : hour.open_time,
        close_time: hour.is_closed ? null : hour.close_time,
        is_closed: hour.is_closed
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('opening_hours')
          .update({
            open_time: update.open_time,
            close_time: update.close_time,
            is_closed: update.is_closed
          })
          .eq('day_of_week', update.day_of_week);

        if (error) throw error;
      }

      toast({
        title: "Sparat!",
        description: "Öppettiderna har uppdaterats",
      });
    } catch (error) {
      console.error('Error saving opening hours:', error);
      toast({
        title: "Fel",
        description: "Kunde inte spara öppettider",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Laddar öppettider...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <CardTitle>Öppettider</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5, 6, 0].map(dayOfWeek => {
            const hour = hours.find(h => h.day_of_week === dayOfWeek);
            if (!hour) return null;

            return (
              <div key={dayOfWeek} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 border rounded-lg">
                <div className="font-medium">
                  {dayNames[dayOfWeek]}
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!hour.is_closed}
                    onCheckedChange={(checked) => updateHour(dayOfWeek, 'is_closed', !checked)}
                  />
                  <Label className="text-sm">
                    {hour.is_closed ? 'Stängt' : 'Öppet'}
                  </Label>
                </div>

                {!hour.is_closed && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Öppnar</Label>
                      <Input
                        type="time"
                        value={hour.open_time || ''}
                        onChange={(e) => updateHour(dayOfWeek, 'open_time', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Stänger</Label>
                      <Input
                        type="time"
                        value={hour.close_time || ''}
                        onChange={(e) => updateHour(dayOfWeek, 'close_time', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {hour.is_closed && (
                  <div className="md:col-span-2 text-sm text-muted-foreground">
                    Stängd hela dagen
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button onClick={saveOpeningHours} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Sparar...' : 'Spara öppettider'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpeningHoursManager;