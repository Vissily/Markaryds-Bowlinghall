import React from "react";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ThankYou: React.FC = () => {
  useSEO({
    title: "Tack – Skuldfrihet | Vägen mot ett liv utan lån",
    description:
      "Tack för ditt köp! Här är en kort sammanfattning och pepp att sluta ta lån och krediter – din väg mot skuldfrihet börjar nu.",
    keywords: "skuldfrihet, tack, ekonomi, sluta ta lån, sluta ta krediter, skuldfri",
    canonical: "https://skuldfrihet.com/tack",
  });

  const summaryPoints = [
    "Du har tagit ett viktigt steg mot ekonomisk frihet.",
    "Fokusera på vana före vilja – små steg varje dag ger stora resultat.",
    "Prioritera nödvändigt, pausa onödiga utgifter och bygg en trygg buffert.",
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Tack – Skuldfrihet',
    url: 'https://skuldfrihet.com/tack',
    description:
      'Tack för ditt köp! En tack-sida från Skuldfrihet med sammanfattning och pepp att sluta ta lån och krediter.'
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-12 md:py-20">
        <article className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Tack för ditt köp – Skuldfrihet
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            Tack! Din beställning är bekräftad. Jag är tacksam för ditt förtroende – nu börjar resan mot ett lugnare och mer hållbart ekonomiskt liv.
          </p>

          <div className="mt-8 text-left rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Sammanfattning</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              {summaryPoints.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">Pepp på vägen</h3>
            <p className="mt-3 text-muted-foreground">
              Sluta ta nya lån och krediter – även små stopp gör stor skillnad över tid. Var konsekvent, var snäll mot dig själv och fira varje steg framåt.
              Ditt framtida jag kommer att tacka dig.
            </p>
          </div>

          <div className="mt-10 flex justify-center gap-3">
            <Button asChild>
              <Link to="/">Till startsidan</Link>
            </Button>
          </div>
        </article>
      </section>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
};

export default ThankYou;
