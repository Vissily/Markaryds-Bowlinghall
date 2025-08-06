import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, LogOut } from 'lucide-react';

interface SiteContent {
  title?: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  button_link?: string;
}

const AdminSimple = () => {
  const { user, userRole, signOut } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState<SiteContent>({
    title: '',
    subtitle: '',
    description: '',
    button_text: '',
    button_link: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && userRole === 'admin') {
      loadContent();
    }
  }, [user, userRole]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('section_key', 'hero')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setContent({
          title: data.title || '',
          subtitle: data.subtitle || '',
          description: data.description || '',
          button_text: data.button_text || '',
          button_link: data.button_link || ''
        });
      }
    } catch (error) {
      console.error('Error loading content:', error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda innehåll",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({
          section_key: 'hero',
          title: content.title,
          subtitle: content.subtitle,
          description: content.description,
          button_text: content.button_text,
          button_link: content.button_link,
        });

      if (error) throw error;

      toast({
        title: "Sparat!",
        description: "Startsidan har uppdaterats",
      });
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Fel",
        description: "Kunde inte spara ändringar",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const promoteToAdmin = async () => {
    try {
      const { error } = await supabase.rpc('promote_first_user_to_admin');
      if (error) throw error;
      
      toast({
        title: "Admin-rättigheter",
        description: "Första användaren fick admin-rättigheter",
      });
      
      // Reload page to check new role
      window.location.reload();
    } catch (error) {
      console.error('Error promoting user:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Laddar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Logga in först</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <a href="/auth">Gå till inloggning</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Inte admin än</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm">Inloggad som: <strong>{user.email}</strong></p>
            <p className="text-sm">Din roll: <strong>{userRole || 'vanlig användare'}</strong></p>
            
            <Button onClick={promoteToAdmin} className="w-full">
              Bli admin (första användaren)
            </Button>
            
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <a href="/">Tillbaka hem</a>
              </Button>
              <Button variant="outline" onClick={signOut} className="w-full">
                Logga ut
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Redigera startsidan</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Logga ut
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Startsida - Hero-sektion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Huvudtitel</Label>
              <Input
                id="title"
                value={content.title}
                onChange={(e) => setContent({...content, title: e.target.value})}
                placeholder="t.ex. Markaryds Bowlinghall"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Underrubrik</Label>
              <Input
                id="subtitle"
                value={content.subtitle}
                onChange={(e) => setContent({...content, subtitle: e.target.value})}
                placeholder="t.ex. Sedan 2013"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beskrivning</Label>
              <Textarea
                id="description"
                value={content.description}
                onChange={(e) => setContent({...content, description: e.target.value})}
                placeholder="Beskriv er verksamhet..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="button_text">Knapptext</Label>
                <Input
                  id="button_text"
                  value={content.button_text}
                  onChange={(e) => setContent({...content, button_text: e.target.value})}
                  placeholder="t.ex. Boka Nu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="button_link">Knapplänk</Label>
                <Input
                  id="button_link"
                  value={content.button_link}
                  onChange={(e) => setContent({...content, button_link: e.target.value})}
                  placeholder="t.ex. #booking"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={saveContent} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Sparar...' : 'Spara ändringar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <a href="/">Se resultat på startsidan</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSimple;