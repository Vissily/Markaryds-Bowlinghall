import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { CalendarPlus, Edit2, Trash2, Trophy, Users, Heart, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  registration_deadline: string | null;
  registration_url: string | null;
  registration_email: string | null;
  registration_phone: string | null;
  max_participants: number | null;
  current_participants: number;
  price: number | null;
  event_type: string;
  status: string;
  featured: boolean;
  image_url: string | null;
}

const EventsManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [interestCounts, setInterestCounts] = useState<Record<string, number>>({});

const emptyEvent: Omit<Event, 'id'> = {
  title: '',
  description: '',
  event_date: '',
  registration_deadline: null,
  registration_url: '',
  registration_email: '',
  registration_phone: '',
  max_participants: null,
  current_participants: 0,
  price: null,
  event_type: 'tournament',
  status: 'upcoming',
  featured: false,
  image_url: null
};

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const [eventsRes, countsRes] = await Promise.all([
        supabase.from('events').select('*').order('event_date', { ascending: true }),
        supabase.from('event_interest_counts' as any).select('*')
      ]);

      if (eventsRes.error) throw eventsRes.error;
      const evts = eventsRes.data || [];
      setEvents(evts);

      if (!countsRes.error && countsRes.data) {
        const map: Record<string, number> = {};
        (countsRes.data as any[]).forEach((row: any) => {
          map[row.event_id] = Number(row.interest_count) || 0;
        });
        setInterestCounts(map);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Kunde inte ladda evenemang');
    } finally {
      setLoading(false);
    }
  };

  const saveEvent = async (eventData: Omit<Event, 'id'> | Event) => {
    setSaving(true);
    try {
      const toISO = (v: string | null | undefined) => {
        if (!v) return null;
        return v.endsWith('Z') ? v : new Date(v).toISOString();
      };

      const base = {
        title: (eventData as any).title,
        description: (eventData as any).description || null,
        event_date: toISO((eventData as any).event_date) as string,
        registration_deadline: toISO((eventData as any).registration_deadline),
        registration_url: (eventData as any).registration_url || null,
        registration_email: (eventData as any).registration_email || null,
        registration_phone: (eventData as any).registration_phone || null,
        max_participants: (eventData as any).max_participants ?? null,
        current_participants: (eventData as any).current_participants ?? 0,
        price: (eventData as any).price ?? null,
        event_type: (eventData as any).event_type || 'tournament',
        status: (eventData as any).status || 'upcoming',
        featured: !!(eventData as any).featured,
        image_url: (eventData as any).image_url || null,
      };

      if (!base.event_date) {
        throw new Error('Datum & tid krävs.');
      }

      if ('id' in eventData) {
        const { error } = await supabase.from('events').update(base).eq('id', (eventData as Event).id);
        if (error) throw error;
        toast.success('Evenemang uppdaterat!');
      } else {
        const { error } = await supabase.from('events').insert([base]);
        if (error) throw error;
        toast.success('Evenemang skapat!');
      }

      await loadEvents();
      setIsDialogOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Kunde inte spara evenemang');
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort detta evenemang?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Evenemang borttaget!');
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Kunde inte ta bort evenemang');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      upcoming: 'default',
      ongoing: 'secondary',
      completed: 'outline',
      cancelled: 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('sv-SE');
  };

  if (loading) {
    return <div className="p-6 text-center">Laddar evenemang...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Hantera Evenemang</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingEvent(null)}>
              <CalendarPlus className="w-4 h-4 mr-2" />
              Nytt Evenemang
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Redigera Evenemang' : 'Skapa Nytt Evenemang'}
              </DialogTitle>
            </DialogHeader>
            <EventForm
              event={editingEvent || emptyEvent}
              onSave={saveEvent}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingEvent(null);
              }}
              saving={saving}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    {event.title}
                    {event.featured && <Badge variant="secondary">Utvald</Badge>}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    {getStatusBadge(event.status)}
                    <Badge variant="outline">{event.event_type}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingEvent(event);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteEvent(event.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {event.image_url && (
                <div className="mb-4">
                  <AspectRatio ratio={16/9}>
                    <img
                      src={event.image_url}
                      alt={`Flyer för ${event.title}`}
                      className="h-full w-full object-cover rounded"
                      loading="lazy"
                    />
                  </AspectRatio>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Datum:</strong> {formatDateTime(event.event_date)}</p>
                  {event.registration_deadline && (
                    <p><strong>Anmälan senast:</strong> {formatDateTime(event.registration_deadline)}</p>
                  )}
                  {event.price && <p><strong>Pris:</strong> {event.price} kr</p>}
                </div>
                <div>
                  {event.max_participants && (
                    <p className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.current_participants}/{event.max_participants} deltagare
                    </p>
                  )}
                  {event.registration_email && (
                    <p><strong>Anmälan:</strong> {event.registration_email}</p>
                  )}
                  {event.registration_phone && (
                    <p><strong>Telefon:</strong> {event.registration_phone}</p>
                  )}
                  <p className="flex items-center gap-1 mt-1">
                    <Heart className="w-4 h-4" />
                    Intresse: {interestCounts[event.id] ?? 0}
                  </p>
                </div>
              </div>
              {event.description && (
                <p className="mt-3 text-muted-foreground">{event.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
        
        {events.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Inga evenemang än. Skapa ditt första evenemang!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

interface EventFormProps {
  event: Omit<Event, 'id'> | Event;
  onSave: (event: Omit<Event, 'id'> | Event) => void;
  onCancel: () => void;
  saving: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState(event);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Du måste vara inloggad');
        return;
      }
      const ext = file.name.split('.').pop();
      const path = `${user.id}/events/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('event-images').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: publicData } = await supabase.storage.from('event-images').getPublicUrl(path);
      updateField('image_url', publicData.publicUrl);
      toast.success('Bild uppladdad!');
    } catch (err) {
      console.error(err);
      toast.error('Kunde inte ladda upp bild');
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Titel *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="event_type">Typ</Label>
          <Select value={formData.event_type} onValueChange={(value) => updateField('event_type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tournament">Turnering</SelectItem>
              <SelectItem value="competition">Tävling</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="league">Liga</SelectItem>
              <SelectItem value="livematch">Livematch</SelectItem>
              <SelectItem value="course">Kurs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Beskrivning</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
        />
      </div>

      {formData.image_url ? (
        <div className="space-y-2">
          <Label>Flyer-bild</Label>
          <AspectRatio ratio={16/9}>
            <img
              src={formData.image_url}
              alt={`Flyer för ${formData.title || 'evenemang'}`}
              className="h-full w-full object-cover rounded border"
            />
          </AspectRatio>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => updateField('image_url', null)}>
              Ta bort bild
            </Button>
            <Button type="button" variant="outline" onClick={() => document.getElementById('flyer-upload')?.click()}>
              <ImageIcon className="w-4 h-4 mr-2" />Byt bild
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="flyer-upload">Flyer-bild</Label>
          <Input
            id="flyer-upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="event_date">Datum & Tid *</Label>
          <Input
            id="event_date"
            type="datetime-local"
            value={formData.event_date ? formData.event_date.slice(0, 16) : ''}
            onChange={(e) => updateField('event_date', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="registration_deadline">Anmälan senast</Label>
          <Input
            id="registration_deadline"
            type="datetime-local"
            value={formData.registration_deadline ? formData.registration_deadline.slice(0, 16) : ''}
            onChange={(e) => updateField('registration_deadline', e.target.value || null)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Pris (kr)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price || ''}
            onChange={(e) => updateField('price', e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div>
          <Label htmlFor="max_participants">Max deltagare</Label>
          <Input
            id="max_participants"
            type="number"
            value={formData.max_participants || ''}
            onChange={(e) => updateField('max_participants', e.target.value ? Number(e.target.value) : null)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="registration_url">Anmälningslänk</Label>
          <Input
            id="registration_url"
            type="url"
            value={formData.registration_url || ''}
            onChange={(e) => updateField('registration_url', e.target.value || null)}
          />
        </div>
        <div>
          <Label htmlFor="registration_email">Anmälnings-email</Label>
          <Input
            id="registration_email"
            type="email"
            value={formData.registration_email || ''}
            onChange={(e) => updateField('registration_email', e.target.value || null)}
          />
        </div>
        <div>
          <Label htmlFor="registration_phone">Anmälningstelefon</Label>
          <Input
            id="registration_phone"
            value={formData.registration_phone || ''}
            onChange={(e) => updateField('registration_phone', e.target.value || null)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Kommande</SelectItem>
              <SelectItem value="ongoing">Pågående</SelectItem>
              <SelectItem value="completed">Avslutad</SelectItem>
              <SelectItem value="cancelled">Inställd</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) => updateField('featured', checked)}
          />
          <Label htmlFor="featured">Utvalt evenemang</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Avbryt
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Sparar...' : 'Spara'}
        </Button>
      </div>
    </form>
  );
};

export default EventsManager;