import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw } from "lucide-react";

interface SiteContent {
  id: string;
  section_key: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  button_text?: string;
  button_link?: string;
  metadata?: any;
}

interface ContentEditorProps {
  sectionKey: string;
  sectionTitle: string;
}

const ContentEditor = ({ sectionKey, sectionTitle }: ContentEditorProps) => {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadContent();
  }, [sectionKey]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('section_key', sectionKey)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setContent(data || {
        id: '',
        section_key: sectionKey,
        title: '',
        subtitle: '',
        description: '',
        image_url: '',
        button_text: '',
        button_link: '',
        metadata: {}
      });
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
    if (!content) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({
          ...content,
          section_key: sectionKey,
        });

      if (error) throw error;

      toast({
        title: "Sparat!",
        description: "Innehållet har uppdaterats",
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Fel",
        description: "Kunde inte spara innehåll",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Laddar {sectionTitle}...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{sectionTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`title-${sectionKey}`}>Titel</Label>
            <Input
              id={`title-${sectionKey}`}
              value={content?.title || ''}
              onChange={(e) => setContent(prev => prev ? {...prev, title: e.target.value} : null)}
              placeholder="Rubrik för sektionen"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`subtitle-${sectionKey}`}>Underrubrik</Label>
            <Input
              id={`subtitle-${sectionKey}`}
              value={content?.subtitle || ''}
              onChange={(e) => setContent(prev => prev ? {...prev, subtitle: e.target.value} : null)}
              placeholder="Underrubrik"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`description-${sectionKey}`}>Beskrivning</Label>
          <Textarea
            id={`description-${sectionKey}`}
            value={content?.description || ''}
            onChange={(e) => setContent(prev => prev ? {...prev, description: e.target.value} : null)}
            placeholder="Beskrivning av sektionen"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`button-text-${sectionKey}`}>Knapptext</Label>
            <Input
              id={`button-text-${sectionKey}`}
              value={content?.button_text || ''}
              onChange={(e) => setContent(prev => prev ? {...prev, button_text: e.target.value} : null)}
              placeholder="Text på knappen"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`button-link-${sectionKey}`}>Knapplänk</Label>
            <Input
              id={`button-link-${sectionKey}`}
              value={content?.button_link || ''}
              onChange={(e) => setContent(prev => prev ? {...prev, button_link: e.target.value} : null)}
              placeholder="Länk för knappen"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`image-url-${sectionKey}`}>Bild-URL</Label>
          <Input
            id={`image-url-${sectionKey}`}
            value={content?.image_url || ''}
            onChange={(e) => setContent(prev => prev ? {...prev, image_url: e.target.value} : null)}
            placeholder="URL till bild"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={saveContent}
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Sparar...' : 'Spara ändringar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentEditor;