import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Trophy, Star, Gift } from "lucide-react";

const Events = () => {
  const events = [
    {
      title: "Mixtävling 55+",
      date: "26-29 December",
      time: "Olika tider",
      description: "Vår populära mixtävling för spelare 55+ är tillbaka! Anmälan öppen med begränsat antal platser.",
      icon: Trophy,
      status: "Anmälan öppen",
      color: "bg-gradient-primary"
    },
    {
      title: "Nyårsturnering",
      date: "2 Januari",
      time: "18:00",
      description: "Starta det nya året med bowling! Alla nivåer välkomna.",
      icon: Star,
      status: "Kommande",
      color: "bg-gradient-secondary"
    },
    {
      title: "Företagsturnering",
      date: "15 Februari",
      time: "17:00",
      description: "Perfekt aktivitet för teambuilding och företagsfester.",
      icon: Users,
      status: "Anmälan öppnar snart",
      color: "bg-gradient-primary"
    },
    {
      title: "Barnkalas Special",
      date: "Helger",
      time: "Efter överenskommelse",
      description: "Specialpaket för barnkalas med bowling, mat och överraskningar.",
      icon: Gift,
      status: "Bokningsbar",
      color: "bg-gradient-secondary"
    }
  ];

  const regularEvents = [
    {
      title: "Nationella Serien",
      description: "Våra 2 lag tävlar varje vecka i nationella bowlingserien",
      schedule: "Varje lördag 15:00"
    },
    {
      title: "Pensionärsserien", 
      description: "3 lag från Markaryds Bowlingklubb i pensionärsserien",
      schedule: "Torsdagar 13:00"
    },
    {
      title: "Ungdomsträning",
      description: "Träning för våra unga bowlare",
      schedule: "Onsdagar 17:00"
    },
    {
      title: "Klubbkväll",
      description: "Öppen träning för alla medlemmar",
      schedule: "Fredagar 19:00"
    }
  ];

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Evenemang
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upptäck våra turneringar, aktiviteter och speciella event
            </p>
          </div>

          {/* Kommande Evenemang */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Kommande Evenemang</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {events.map((event, index) => {
                const IconComponent = event.icon;
                return (
                  <Card key={index} className="overflow-hidden shadow-card hover:shadow-elegant transition-shadow">
                    <CardHeader className={`${event.color} text-primary-foreground`}>
                      <CardTitle className="flex items-center gap-3">
                        <IconComponent className="w-6 h-6" />
                        {event.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        <p className="text-foreground">{event.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm px-3 py-1 bg-accent text-accent-foreground rounded-full">
                            {event.status}
                          </span>
                          <Button variant="outline" size="sm">
                            Läs mer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Regelbundna Aktiviteter */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Regelbundna Aktiviteter</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {regularEvents.map((event, index) => (
                <Card key={index} className="shadow-card">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-3">{event.title}</h3>
                    <p className="text-muted-foreground mb-4">{event.description}</p>
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <Clock className="w-4 h-4" />
                      <span>{event.schedule}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Event Information */}
          <Card className="shadow-card">
            <CardHeader className="bg-gradient-primary text-primary-foreground">
              <CardTitle className="text-2xl font-bold">Anordna Ditt Eget Event</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-foreground">
                  Markaryds Bowlinghall är den perfekta platsen för ditt nästa event! 
                  Vi erbjuder skräddarsydda paket för:
                </p>
                <ul className="grid md:grid-cols-2 gap-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Företagsfester
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Barnkalas
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Studentfester
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Föreningsaktiviteter
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Privata fester
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Teambuilding
                  </li>
                </ul>
                <div className="pt-4">
                  <Button className="mr-4">
                    Kontakta oss för offert
                  </Button>
                  <Button variant="outline">
                    Se paketpriser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Events;