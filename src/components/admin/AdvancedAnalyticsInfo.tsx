import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MousePointerClick, Flame, Route, Goal, Target, GitBranch, Zap, Gauge, Timer, Monitor, BarChart3
} from "lucide-react";

const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

const Item = ({
  title,
  what,
  why,
}: {
  title: string;
  what: string;
  why: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <h4 className="font-semibold">{title}</h4>
      <Badge variant="secondary">Rekommenderas</Badge>
    </div>
    <div className="grid gap-2 md:grid-cols-2">
      <div>
        <p className="text-sm text-muted-foreground">Vad det är</p>
        <p>{what}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Varför det är intressant</p>
        <p>{why}</p>
      </div>
    </div>
    <Separator />
  </div>
);

const AdvancedAnalyticsInfo = () => {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Avancerad Statistik & Analys</h2>
        <p className="text-muted-foreground">Översikt över mätpunkter som hjälper er att förstå beteenden, optimera konvertering och förbättra prestanda.</p>
      </div>

      <div className="grid gap-6">
        <Section title="1. Beteendeanalys" icon={Route}>
          <Item
            title="Händelsespårning (Event Tracking)"
            what="Mäter specifika interaktioner som klick på knappar, formulärsteg, videostart/stopp m.m."
            why="Visar vad besökare faktiskt gör – hjälper att prioritera rätt CTA, placering och innehåll."
          />
          <Item
            title="Värmekartor & Klickkartor (Heatmaps/Click maps)"
            what="Visuella kartor över klick, musrörelser och scrollbeteende på sidor."
            why="Avslöjar vad som fångar uppmärksamhet och vad som missas; visar förväntade klick på icke‑länkar."
          />
          <Item
            title="Användarflöden / Sökvägsanalys"
            what="Vanliga vägar genom webbplatsen – från landning till utgång/konvertering."
            why="Identifierar ‘gyllene stigar’ och återvändsgränder för att förbättra navigation och budskap."
          />
        </Section>

        <Section title="2. Konverterings- och Affärsmålsanalys" icon={Goal}>
          <Item
            title="Konverteringstrattar (Conversion Funnels)"
            what="Definierade steg mot mål (t.ex. varukorg → kassa → betalning)."
            why="Visar exakt var ni tappar besökare och var åtgärder ger störst effekt."
          />
          <Item
            title="Attributionsmodellering"
            what="Fördelar konverteringskred mellan kanaler (första/sista klick, linjär, positionsbaserad)."
            why="Ger en rättvis bild av hela kundresan – inte bara sista klicket."
          />
          <Item
            title="Mikrokonverteringar"
            what="Delmål som nyhetsbrevsanmälan, PDF‑nedladdning eller kontoskapande."
            why="Mäter engagemang även när makromål inte sker direkt och bygger pipeline."
          />
        </Section>

        <Section title="3. Målgruppsanalys" icon={Target}>
          <Item
            title="Kohortanalys"
            what="Grupperar användare per första besöksdatum och följer beteende/retention över tid."
            why="Svarar på om ni behåller användare och vilka kampanjer/perioder som ger lojalitet."
          />
          <Item
            title="Beteendesegmentering"
            what="Segment som ‘Engagerade’ (>5 sidor), ‘Bloggläsare’, ‘Prisintresserade’ m.m."
            why="Möjliggör riktad kommunikation och erbjudanden baserat på faktiskt beteende."
          />
        </Section>

        <Section title="4. Teknisk Prestanda" icon={Gauge}>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> LCP
                </CardTitle>
              </CardHeader>
              <CardContent>
                Största elementets laddtid – optimera bilder, hero‑innehåll och caching.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Timer className="w-4 h-4 text-primary" /> FID
                </CardTitle>
              </CardHeader>
              <CardContent>
                Första interaktionsfördröjning – minimera JS‑blockering och tunga skript.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-primary" /> CLS
                </CardTitle>
              </CardHeader>
              <CardContent>
                Layoutskift under laddning – reservera utrymme och lazy‑loada korrekt.
              </CardContent>
            </Card>
          </div>
        </Section>

        <Card>
          <CardHeader>
            <CardTitle>Rekommenderade verktyg</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="list-disc pl-5 space-y-1">
              <li>Google Analytics 4 – händelser, funnels och sökvägar</li>
              <li>Microsoft Clarity eller Hotjar – värmekartor och sessioner</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AdvancedAnalyticsInfo;
