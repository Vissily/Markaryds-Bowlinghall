import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqItems = [
  {
    question: "Vad kostar det att bowla på Markaryds Bowlinghall?",
    answer: "Priserna varierar beroende på tid och dag. Se vår kompletta prislista på hemsidan under 'Prislista'. Vi erbjuder både drop-in och förbokning.",
  },
  {
    question: "Hur bokar jag bowling eller padel?",
    answer: "Bowling bokas enkelt online via vårt bokningssystem på secure.meriq.com/markaryd. Padel bokas via Playtomic. Du kan även ringa oss på 0433-123 45.",
  },
  {
    question: "Vilka aktiviteter erbjuder ni förutom bowling?",
    answer: "Vi erbjuder padel (2 utomhusbanor med tak), 18-håls minigolf, dart, shuffleboard och en restaurang. Vi har även livesändningar av sport på storskärm.",
  },
  {
    question: "Vilka öppettider har Markaryds Bowlinghall?",
    answer: "Vi har öppet 7 dagar i veckan med nästan 70 timmars öppettid. Se aktuella öppettider på hemsidan. Observera att vi vid låg beläggning kan stänga tidigare.",
  },
  {
    question: "Kan man boka fajitasbuffé hos er?",
    answer: "Ja! Vi erbjuder fajitasbuffé för grupper om minst 15 personer. Priset är 145 kr/vuxen och 95 kr/barn (exkl. dricka). Förbokning krävs – ring oss för att boka.",
  },
  {
    question: "Kan man spela padel på vintern?",
    answer: "Ja, våra 2 padelbanor har tak vilket gör att du kan spela nästan hela året. Boka via Playtomic.",
  },
  {
    question: "Vad är Markarydsligan?",
    answer: "Markarydsligan är vår lokala bowlingserie med fem divisioner (Serie A–E) för alla nivåer. Markaryds Bowlingklubb spelar med 2 lag i nationella serien och 4 lag i pensionärsserien.",
  },
  {
    question: "Finns det parkering vid bowlinghallen?",
    answer: "Ja, det finns gratis parkering direkt utanför bowlinghallen.",
  },
];

// Generate FAQPage JSON-LD structured data
export const createFAQJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-accent rounded-full px-4 py-2 mb-6">
              <HelpCircle className="w-4 h-4 text-accent-foreground" />
              <span className="text-accent-foreground font-medium">Vanliga frågor</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Frågor & Svar
            </h2>
            <p className="text-xl text-muted-foreground">
              Hitta svar på de vanligaste frågorna om Markaryds Bowlinghall
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="bg-card border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
