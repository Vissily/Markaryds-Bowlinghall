import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import padelImage from "@/assets/padel-court.jpg";
import minigolfImage from "@/assets/minigolf.jpg";
import bowlingImage from "@/assets/bowling-action.jpg";

const Activities = () => {
  const activities = [
    {
      title: "Bowling",
      description: "Professionella bowlingbanor med modern utrustning. Perfekt för familj, vänner eller företag.",
      image: bowlingImage,
      features: ["Professionella banor", "Modern utrustning", "Skor ingår", "Barnrännor"],
      bookingUrl: "https://secure.meriq.com/markaryd/",
      gradient: "from-primary to-primary-glow"
    },
    {
      title: "Padel",
      description: "2 utomhusbanor med tak som gör att du kan spela hela året runt, oavsett väder.",
      image: padelImage,
      features: ["2 banor", "Tak över banorna", "Året runt-spel", "Rackets uthyres"],
      bookingUrl: "https://playtomic.com/clubs/padel-i-markaryd-markaryd",
      gradient: "from-secondary to-orange-400"
    },
    {
      title: "Minigolf",
      description: "Rolig minigolfbana inomhus med kreativa hinder och utmaningar för hela familjen.",
      image: minigolfImage,
      features: ["Inomhus", "Familjevänligt", "Kreativa hinder", "Utrustning ingår"],
      bookingUrl: "#kontakt",
      gradient: "from-green-500 to-emerald-400"
    }
  ];

  const otherActivities = [
    {
      title: "Dart",
      description: "Elektroniska darttavlor för tävlingar och roligt spel",
      icon: "🎯"
    },
    {
      title: "Shuffleboard",
      description: "Klassiskt shuffleboard-spel för alla åldrar",
      icon: "🏒"
    },
    {
      title: "Barnkalas",
      description: "Specialpaket för barnkalas med bowling och mat",
      icon: "🎂"
    }
  ];

  return (
    <section id="aktiviteter" className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Våra Aktiviteter
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upplev Smålands modernaste aktivitetshall med något för alla åldrar och intressen
          </p>
        </div>

        {/* Main Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {activities.map((activity, index) => (
            <Card key={activity.title} className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-2">
                <div className="relative">
                <img 
                  src={activity.image} 
                  alt={activity.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${activity.gradient} opacity-60`}></div>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-3">{activity.title}</h3>
                <p className="text-muted-foreground mb-4">{activity.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {activity.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button variant="bowling" className="w-full group" asChild>
                  <a href={activity.bookingUrl} target="_blank" rel="noopener noreferrer">
                    Boka {activity.title}
                    <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Other Activities */}
        <div>
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">Övriga Aktiviteter</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherActivities.map((activity) => (
              <Card key={activity.title} className="p-6 text-center hover:shadow-card transition-shadow">
                <div className="text-4xl mb-4">{activity.icon}</div>
                <h4 className="text-xl font-semibold text-foreground mb-2">{activity.title}</h4>
                <p className="text-muted-foreground">{activity.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Activities;
