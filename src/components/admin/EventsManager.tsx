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
import { Calendar as DateCalendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
  featured_start_date: string | null;
  featured_end_date: string | null;
  has_big_screen: boolean;
  registration_form_enabled: boolean;
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
  featured_start_date: null,
  featured_end_date: null,
  has_big_screen: false,
  registration_form_enabled: false,
  image_url: null
};

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data: eventsRes, error: eventsErr } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (eventsErr) throw eventsErr;
      const evts = eventsRes || [];
      setEvents(evts);

      // Fetch interest counts via secure RPC in parallel (admin-only)
      const entries = await Promise.all(
        evts.map(async (e) => {
          try {
            const { data, error } = await supabase.rpc('get_event_interest_count', { _event_id: e.id });
            if (error) throw error;
            return [e.id, Number(data) || 0] as const;
          } catch (err) {
            console.warn('Count fetch failed for event', e.id, err);
            return [e.id, 0] as const;
          }
        })
      );
      setInterestCounts(Object.fromEntries(entries));
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
        featured_start_date: toISO((eventData as any).featured_start_date),
        featured_end_date: toISO((eventData as any).featured_end_date),
        has_big_screen: !!(eventData as any).has_big_screen,
        registration_form_enabled: !!(eventData as any).registration_form_enabled,
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
                  <div className="w-24 h-32 rounded border bg-muted overflow-hidden">
                    <img
                      src={event.image_url}
                      alt={`Flyer för ${event.title}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
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

  type EventRegistration = {
    id: string;
    company_name: string;
    contact_person: string;
    phone_number: string;
    team_members: string | null;
    created_at: string;
  };
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);

  useEffect(() => {
    const id = (event as any).id as string | undefined;
    if (!id) { setRegistrations([]); return; }
    (async () => {
      const { data } = await (supabase as any)
        .from('event_registrations')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: false });
      setRegistrations(data || []);
    })();
  }, [event]);

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
          <div className="w-28 h-44 rounded border bg-muted overflow-hidden">
            <img
              src={formData.image_url}
              alt={`Flyer för ${formData.title || 'evenemang'}`}
              className="w-full h-full object-cover"
            />
          </div>
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

      {/* Utvald period (valfri) */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Utvald period (start)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !(formData as any).featured_start_date && "text-muted-foreground")}
              >
                {(formData as any).featured_start_date ? (
                  format(new Date((formData as any).featured_start_date), 'PPP')
                ) : (
                  <span>Välj startdatum</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DateCalendar
                mode="single"
                selected={(formData as any).featured_start_date ? new Date((formData as any).featured_start_date) : undefined}
                onSelect={(date) => {
                  if (!date) { updateField('featured_start_date' as any, null); return; }
                  const d = new Date(date); d.setHours(0,0,0,0);
                  updateField('featured_start_date' as any, d.toISOString());
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label>Utvald period (slut)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !(formData as any).featured_end_date && "text-muted-foreground")}
              >
                {(formData as any).featured_end_date ? (
                  format(new Date((formData as any).featured_end_date), 'PPP')
                ) : (
                  <span>Välj slutdatum</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DateCalendar
                mode="single"
                selected={(formData as any).featured_end_date ? new Date((formData as any).featured_end_date) : undefined}
                onSelect={(date) => {
                  if (!date) { updateField('featured_end_date' as any, null); return; }
                  const d = new Date(date); d.setHours(23,59,59,999);
                  updateField('featured_end_date' as any, d.toISOString());
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Status och växlar */}
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
        <div className="flex flex-col justify-start space-y-3 pt-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={!!formData.featured}
              onCheckedChange={(checked) => updateField('featured', checked)}
            />
            <Label htmlFor="featured">Utvalt evenemang</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="has_big_screen"
              checked={!!(formData as any).has_big_screen}
              onCheckedChange={(checked) => updateField('has_big_screen', checked)}
            />
            <Label htmlFor="has_big_screen">Storbildsskärm</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="registration_form_enabled"
              checked={!!(formData as any).registration_form_enabled}
              onCheckedChange={(checked) => updateField('registration_form_enabled' as any, checked)}
            />
            <Label htmlFor="registration_form_enabled">Aktivera anmälningsformulär</Label>
          </div>
        </div>
      </div>

      {(formData as any).registration_form_enabled && ('id' in formData) && (
        <div className="border-t pt-4">
          <Label>Inkomna anmälningar</Label>
          <div className="mt-2 space-y-2">
            {registrations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Inga anmälningar ännu.</p>
            ) : (
              registrations.map((r) => (
                <div key={r.id} className="p-3 rounded border">
                  <div className="font-medium">{r.company_name}</div>
                  <div className="text-sm text-muted-foreground">Kontakt: {r.contact_person} • {r.phone_number}</div>
                  {r.team_members && <div className="text-sm mt-1 whitespace-pre-wrap">{r.team_members}</div>}
                  <div className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString('sv-SE')}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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