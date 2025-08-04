import { Card } from "@/components/ui/card";
import { Trophy, Users, Calendar, Sparkles } from "lucide-react";

const About = () => {
  const stats = [
    {
      icon: Calendar,
      number: "2013",
      label: "Grundat år",
      description: "Över 10 års erfarenhet"
    },
    {
      icon: Users,
      number: "450",
      label: "Spelare per vecka",
      description: "Växande community"
    },
    {
      icon: Trophy,
      number: "5",
      label: "Lag i serier",
      description: "2 nationella + 3 pensionärs"
    },
    {
      icon: Sparkles,
      number: "70",
      label: "Öppettimmar",
      description: "7 dagar i veckan"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center space-x-2 bg-accent rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
              <span className="text-accent-foreground font-medium">Vår Historia</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Mer än bara bowling
            </h2>

            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">1 februari 2013</strong> öppnade vi dörrarna till Markaryds första bowlinghall. 
                Men tanken fanns där många år tidigare när Markaryds Bowlingklubb bildades och ca 20 personer 
                spelade i grannbyn Osby.
              </p>

              <p>
                När hallen öppnades fylldes den snabbt och idag, över 10 år senare, spelar ca <strong className="text-foreground">450 personer i veckan</strong>. 
                Markaryds Bowlingklubb spelar nu med 2 lag i nationella serien och 3 lag i pensionärsserien.
              </p>

              <p>
                Markaryds Bowlinghall är idag <strong className="text-foreground">mer än en bowlinghall</strong>. Vi har förutom bowling 
                även minigolf, shufflebord, dart och 2 padelbanor utomhus med tak som gör att man i princip 
                kan spela hela året runt.
              </p>

              <p>
                Bowlinghallen har öppet <strong className="text-foreground">7 dagar i veckan</strong> med nästan 70 timmars öppettid.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-6 text-center hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.number}</div>
                <div className="text-sm font-semibold text-muted-foreground mb-1">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;