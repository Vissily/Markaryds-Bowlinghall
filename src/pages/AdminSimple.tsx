import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeText, isValidUrl, isValidContentLength } from '@/utils/security';
import { auditLog } from '@/utils/authSecurity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, LogOut } from 'lucide-react';
import MenuManager from '@/components/admin/MenuManager';
import OpeningHoursManager from '@/components/admin/OpeningHoursManager';
import EventsManager from '@/components/admin/EventsManager';
import LivestreamsManager from '@/components/admin/LivestreamsManager';
import GalleryManager from '@/components/admin/GalleryManager';
import PriceManager from '@/components/admin/PriceManager';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import AdvancedAnalyticsInfo from '@/components/admin/AdvancedAnalyticsInfo';
import AdminFAQ from '@/components/admin/AdminFAQ';
import AdvancedAnalyticsLive from '@/components/admin/AdvancedAnalyticsLive';

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
      // Validate inputs
      if (!isValidContentLength(content.description || '', 2000)) {
        toast({
          title: "Fel",
          description: "Beskrivningen är för lång (max 2000 tecken)",
          variant: "destructive",
        });
        return;
      }

      if (content.button_link && !isValidUrl(content.button_link) && !content.button_link.startsWith('#')) {
        toast({
          title: "Fel",
          description: "Ogiltig knapplänk",
          variant: "destructive",
        });
        return;
      }

      // Sanitize inputs
      const sanitizedContent = {
        section_key: 'hero',
        title: sanitizeText(content.title || ''),
        subtitle: sanitizeText(content.subtitle || ''),
        description: sanitizeText(content.description || ''),
        button_text: sanitizeText(content.button_text || ''),
        button_link: content.button_link || '',
      };

      const { error } = await supabase
        .from('site_content')
        .upsert(sanitizedContent);

      if (error) throw error;

      auditLog({
        action: 'SITE_CONTENT_UPDATED',
        userId: user?.id,
        details: { section: 'hero' }
      });

      toast({
        title: "Sparat!",
        description: "Startsidan har uppdaterats",
      });
    } catch (error) {
      console.error('Error saving:', error);
      auditLog({
        action: 'SITE_CONTENT_UPDATE_FAILED',
        userId: user?.id,
        details: { section: 'hero', error: error instanceof Error ? error.message : 'Unknown error' }
      });
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
      if (!user?.id) {
        toast({
          title: "Fel",
          description: "Användare inte inloggad",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.rpc('secure_promote_to_admin_v2', { 
        _target_user_id: user.id 
      });
      
      if (error) throw error;
      
      const result = data as { success: boolean; message: string } | null;
      
      if (result?.success) {
        toast({
          title: "Admin-rättigheter",
          description: result.message,
        });
        // Reload page to check new role
        window.location.reload();
      } else {
        toast({
          title: "Fel",
          description: result?.message || "Kunde inte bevilja admin-rättigheter",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Fel",
        description: "Ett fel uppstod vid befordran",
        variant: "destructive",
      });
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
      <div className="container mx-auto px-4 py-4 lg:py-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 lg:mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Admin Panel</h1>
            <p className="text-sm lg:text-base text-muted-foreground">Hantera hemsida, meny och öppettider</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <Button variant="outline" asChild size="sm" className="w-full">
            <a href="/">Se startsidan</a>
          </Button>
          <Button variant="outline" asChild size="sm" className="w-full">
            <a href="/menu">Se menyn</a>
          </Button>
          <Button variant="outline" onClick={signOut} size="sm" className="w-full sm:col-span-2 lg:col-span-1">
            <LogOut className="w-4 h-4 mr-2" />
            Logga ut
          </Button>
        </div>

        <Tabs defaultValue="analytics" className="space-y-4 lg:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-10 h-auto lg:h-10 gap-1 p-1">
            <TabsTrigger value="analytics" className="text-xs lg:text-sm px-2 lg:px-3 py-2">Statistik</TabsTrigger>
            <TabsTrigger value="advanced-analytics" className="text-xs lg:text-sm px-2 lg:px-3 py-2">Avancerad Statistik</TabsTrigger>
            <TabsTrigger value="faq" className="text-xs lg:text-sm px-2 lg:px-3 py-2">FAQ</TabsTrigger>
            <TabsTrigger value="content" className="text-xs lg:text-sm px-2 lg:px-3 py-2">Hemsida</TabsTrigger>
            <TabsTrigger value="gallery" className="text-xs lg:text-sm px-2 lg:px-3 py-2">Galleri</TabsTrigger>
            <TabsTrigger value="menu" className="text-xs lg:text-sm px-2 lg:px-3 py-2">Meny</TabsTrigger>
            <TabsTrigger value="prices" className="text-xs lg:text-sm px-2 lg:px-3 py-2">Priser</TabsTrigger>
            <TabsTrigger value="hours" className="text-xs lg:text-sm px-2 lg:px-3 py-2">Öppet</TabsTrigger>
            <TabsTrigger value="events" className="text-xs lg:text-sm px-2 lg:px-3 py-2">Event</TabsTrigger>
            <TabsTrigger value="livestreams" className="text-xs lg:text-sm px-2 lg:px-3 py-2">Stream</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="advanced-analytics">
            <div className="space-y-6">
              <AdvancedAnalyticsLive />
              <AdvancedAnalyticsInfo />
            </div>
          </TabsContent>

          <TabsContent value="faq">
            <AdminFAQ />
          </TabsContent>

          <TabsContent value="content" className="mt-4 lg:mt-6">
            <Card className="max-w-none lg:max-w-2xl lg:mx-auto">
              <CardHeader className="px-4 lg:px-6">
                <CardTitle className="text-lg lg:text-xl">Startsida - Hero-sektion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 lg:space-y-6 px-4 lg:px-6">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  <Button onClick={saveContent} disabled={saving} className="w-full sm:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Sparar...' : 'Spara ändringar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="mt-4 lg:mt-6">
            <Card>
              <CardHeader className="px-4 lg:px-6">
                <CardTitle className="text-lg lg:text-xl">Hantera Galleri</CardTitle>
              </CardHeader>
              <CardContent className="px-4 lg:px-6">
                <GalleryManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="mt-4 lg:mt-6">
            <MenuManager />
          </TabsContent>

          <TabsContent value="prices" className="mt-4 lg:mt-6">
            <Card>
              <CardHeader className="px-4 lg:px-6">
                <CardTitle className="text-lg lg:text-xl">Hantera Prislista</CardTitle>
              </CardHeader>
              <CardContent className="px-4 lg:px-6">
                <PriceManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours" className="mt-4 lg:mt-6">
            <OpeningHoursManager />
          </TabsContent>

          <TabsContent value="events" className="mt-4 lg:mt-6">
            <EventsManager />
          </TabsContent>

          <TabsContent value="livestreams" className="mt-4 lg:mt-6">
            <LivestreamsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSimple;