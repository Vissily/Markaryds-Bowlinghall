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
import { Play, Edit2, Trash2, Youtube, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Livestream {
  id: string;
  title: string;
  description: string | null;
  youtube_video_id: string | null;
  youtube_channel_id: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  status: string;
  is_main_stream: boolean;
  featured: boolean;
  thumbnail_url: string | null;
  viewer_count: number;
}

const LivestreamsManager = () => {
  const [livestreams, setLivestreams] = useState<Livestream[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingStream, setEditingStream] = useState<Livestream | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const emptyStream: Omit<Livestream, 'id'> = {
    title: '',
    description: '',
    youtube_video_id: '',
    youtube_channel_id: '',
    scheduled_start: '',
    scheduled_end: '',
    status: 'scheduled',
    is_main_stream: false,
    featured: false,
    thumbnail_url: '',
    viewer_count: 0
  };

  useEffect(() => {
    loadLivestreams();
  }, []);

  const loadLivestreams = async () => {
    try {
      const { data, error } = await supabase
        .from('livestreams')
        .select('*')
        .order('scheduled_start', { ascending: true });

      if (error) throw error;
      setLivestreams(data || []);
    } catch (error) {
      console.error('Error loading livestreams:', error);
      toast.error('Kunde inte ladda livestreams');
    } finally {
      setLoading(false);
    }
  };

  const saveLivestream = async (streamData: Omit<Livestream, 'id'> | Livestream) => {
    setSaving(true);
    try {
      if ('id' in streamData) {
        // Update existing stream
        const { error } = await supabase
          .from('livestreams')
          .update(streamData)
          .eq('id', streamData.id);
        
        if (error) throw error;
        toast.success('Livestream uppdaterad!');
      } else {
        // Create new stream
        const { error } = await supabase
          .from('livestreams')
          .insert([streamData]);
        
        if (error) throw error;
        toast.success('Livestream skapad!');
      }
      
      loadLivestreams();
      setIsDialogOpen(false);
      setEditingStream(null);
    } catch (error) {
      console.error('Error saving livestream:', error);
      toast.error('Kunde inte spara livestream');
    } finally {
      setSaving(false);
    }
  };

  const deleteLivestream = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna livestream?')) return;

    try {
      const { error } = await supabase
        .from('livestreams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Livestream borttagen!');
      loadLivestreams();
    } catch (error) {
      console.error('Error deleting livestream:', error);
      toast.error('Kunde inte ta bort livestream');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      scheduled: 'outline',
      live: 'default',
      ended: 'secondary',
      cancelled: 'destructive'
    };
    
    const labels: Record<string, string> = {
      scheduled: 'Schemalagd',
      live: 'Live',
      ended: 'Avslutad',
      cancelled: 'Inställd'
    };
    
    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Ej angiven';
    return new Date(dateString).toLocaleString('sv-SE');
  };

  const extractVideoId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return url; // Return as-is if no pattern matches
  };

  if (loading) {
    return <div className="p-6 text-center">Laddar livestreams...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Hantera Livestreams</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingStream(null)}>
              <Play className="w-4 h-4 mr-2" />
              Ny Livestream
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStream ? 'Redigera Livestream' : 'Skapa Ny Livestream'}
              </DialogTitle>
            </DialogHeader>
            <LivestreamForm
              stream={editingStream || emptyStream}
              onSave={saveLivestream}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingStream(null);
              }}
              saving={saving}
              extractVideoId={extractVideoId}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {livestreams.map((stream) => (
          <Card key={stream.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Youtube className="w-5 h-5" />
                    {stream.title}
                    {stream.is_main_stream && <Badge variant="secondary">Huvudstream</Badge>}
                    {stream.featured && <Badge variant="outline">Utvald</Badge>}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    {getStatusBadge(stream.status)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingStream(stream);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteLivestream(stream.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  {stream.scheduled_start && (
                    <p><strong>Starttid:</strong> {formatDateTime(stream.scheduled_start)}</p>
                  )}
                  {stream.scheduled_end && (
                    <p><strong>Sluttid:</strong> {formatDateTime(stream.scheduled_end)}</p>
                  )}
                  {stream.youtube_video_id && (
                    <p><strong>YouTube Video ID:</strong> {stream.youtube_video_id}</p>
                  )}
                </div>
                <div>
                  {stream.youtube_channel_id && (
                    <p><strong>YouTube Kanal ID:</strong> {stream.youtube_channel_id}</p>
                  )}
                  {stream.viewer_count > 0 && (
                    <p className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {stream.viewer_count} tittare
                    </p>
                  )}
                </div>
              </div>
              {stream.description && (
                <p className="mt-3 text-muted-foreground">{stream.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
        
        {livestreams.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Inga livestreams än. Skapa din första!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

interface LivestreamFormProps {
  stream: Omit<Livestream, 'id'> | Livestream;
  onSave: (stream: Omit<Livestream, 'id'> | Livestream) => void;
  onCancel: () => void;
  saving: boolean;
  extractVideoId: (url: string) => string;
}

const LivestreamForm: React.FC<LivestreamFormProps> = ({ 
  stream, 
  onSave, 
  onCancel, 
  saving, 
  extractVideoId 
}) => {
  const [formData, setFormData] = useState(stream);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleYouTubeUrl = (url: string, type: 'video' | 'channel') => {
    if (type === 'video') {
      const videoId = extractVideoId(url);
      updateField('youtube_video_id', videoId);
    } else {
      // Extract channel ID from URL or use as-is
      const channelId = url.includes('/channel/') 
        ? url.split('/channel/')[1].split(/[?/]/)[0]
        : url;
      updateField('youtube_channel_id', channelId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Titel *</Label>
          <div className="flex gap-2">
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              required
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => updateField('title', 'Bowling Bana 1-4')}
            >
              Bana 1-4
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => updateField('title', 'Bowling Bana 4-8')}
            >
              Bana 4-8
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Schemalagd</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="ended">Avslutad</SelectItem>
              <SelectItem value="cancelled">Inställd</SelectItem>
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

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="youtube_video_url">YouTube Video URL/ID</Label>
          <Input
            id="youtube_video_url"
            placeholder="https://youtube.com/watch?v=... eller bara video ID"
            value={formData.youtube_video_id || ''}
            onChange={(e) => handleYouTubeUrl(e.target.value, 'video')}
          />
        </div>
        <div>
          <Label htmlFor="youtube_channel_url">YouTube Kanal URL/ID</Label>
          <Input
            id="youtube_channel_url"
            placeholder="https://youtube.com/channel/... eller bara kanal ID"
            value={formData.youtube_channel_id || ''}
            onChange={(e) => handleYouTubeUrl(e.target.value, 'channel')}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="scheduled_start">Starttid</Label>
          <Input
            id="scheduled_start"
            type="datetime-local"
            value={formData.scheduled_start?.slice(0, 16) || ''}
            onChange={(e) => updateField('scheduled_start', e.target.value || null)}
          />
        </div>
        <div>
          <Label htmlFor="scheduled_end">Sluttid</Label>
          <Input
            id="scheduled_end"
            type="datetime-local"
            value={formData.scheduled_end?.slice(0, 16) || ''}
            onChange={(e) => updateField('scheduled_end', e.target.value || null)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
          <Input
            id="thumbnail_url"
            type="url"
            value={formData.thumbnail_url || ''}
            onChange={(e) => updateField('thumbnail_url', e.target.value || null)}
          />
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="is_main_stream"
            checked={formData.is_main_stream}
            onCheckedChange={(checked) => updateField('is_main_stream', checked)}
          />
          <Label htmlFor="is_main_stream">Huvudstream</Label>
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) => updateField('featured', checked)}
          />
          <Label htmlFor="featured">Utvald</Label>
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

export default LivestreamsManager;