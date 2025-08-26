import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AdminFAQ: React.FC = () => {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin FAQ</h2>
        <p className="text-muted-foreground">
          Vanliga frågor om hur du använder adminläget och vad som går att göra.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frågor & svar</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="overview">
              <AccordionTrigger>Hur fungerar adminläget i stort?</AccordionTrigger>
              <AccordionContent>
                Adminpanelen är uppdelad i flikar (Hemsida, Galleri, Meny, Priser, Öppet, Event, Stream, Statistik). 
                Du behöver vara inloggad som admin för full åtkomst. Ändringar sparas via Supabase och visas på webbplatsen direkt.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="content">
              <AccordionTrigger>Hemsida – redigera texter och knappar</AccordionTrigger>
              <AccordionContent>
                Under fliken "Hemsida" kan du uppdatera hero‑sektionens titel, underrubrik, beskrivning och knapp.
                Spara med knappen "Spara ändringar". Innehållet lagras i posttypen site_content.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="gallery">
              <AccordionTrigger>Galleri – ladda upp och hantera bilder</AccordionTrigger>
              <AccordionContent>
                Ladda upp bilder som visas i galleriet. SVG blockeras av säkerhetsskäl. Du kan ta bort/byta bilder. 
                Bilderna lagras i Supabase Storage (bucket: event‑images / gallery‑images) med publik URL.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="menu">
              <AccordionTrigger>Meny – kategorier och rätter</AccordionTrigger>
              <AccordionContent>
                Skapa/ändra kategorier och menyobjekt (namn, beskrivning, pris och ordning). Besökare ser uppdateringarna direkt på menysidan.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="prices">
              <AccordionTrigger>Priser – hantera prislistan</AccordionTrigger>
              <AccordionContent>
                Lägg till/uppdatera prisrader (kategori, namn, pris, beskrivning). Endast aktiva rader visas publikt.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="hours">
              <AccordionTrigger>Öppettider – ställ in öppet/stängt</AccordionTrigger>
              <AccordionContent>
                Ange öppet- och stängningstider per veckodag eller markera stängt. Dessa visas på webbplatsens öppettider.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="events">
              <AccordionTrigger>Event – skapa, tagga och visa i slideshow</AccordionTrigger>
              <AccordionContent>
                Skapa/ändra evenemang med titel, beskrivning, datum & tid, bild, pris, typ (t.ex. Turnering, Livematch), status m.m.
                För startsidans slideshow gäller:
                - Om "Utvald period" (start/slut) anges visas eventet under dessa datum.
                - Om ingen period anges visas event automatiskt inom 7 dagar från nu.
                På eventsidan grupperas event efter typ (tagg) i stället för en separat "Utvalda"-lista.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="livestreams">
              <AccordionTrigger>Stream – hantera livestreams</AccordionTrigger>
              <AccordionContent>
                Lägg in information om kommande eller pågående strömmar (titel, status, tider, YouTube‑ID, thumbnail). 
                Publikt visas endast strömmar som inte är inställda.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="analytics">
              <AccordionTrigger>Statistik – vad visas här?</AccordionTrigger>
              <AccordionContent>
                Fliken "Statistik" visar sammanställningar (t.ex. antal profiler, menyobjekt, event). 
                "Avancerad Statistik" ger en guidande översikt över händelsespårning, funnels, segmentering och prestandamått.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="roles">
              <AccordionTrigger>Användare & roller – admin vs editor</AccordionTrigger>
              <AccordionContent>
                Admin kan se och ändra användarnas roller. Inbjudningsknappen visar en bekräftelse – för faktiska inbjudningar används Supabase Auth panelen eller vanlig registrering följt av rollsättning.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="troubleshooting">
              <AccordionTrigger>Felsökning – vanliga problem</AccordionTrigger>
              <AccordionContent>
                - Ändringar syns inte: uppdatera sidan (Ctrl/Cmd+R). Cache kan behöva rensas.
                - Bild visas inte: kontrollera filformat/storlek och att en publik URL skapats.
                - Event saknas i slideshow: kontrollera status, datum och ev. "Utvald period".
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </section>
  );
};

export default AdminFAQ;
