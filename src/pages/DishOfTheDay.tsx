import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDishOfTheDay } from "@/data/dishes";
import { ArrowLeft, Calendar, Clock, ChefHat, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function DishOfTheDay() {
  const todaysDish = getDishOfTheDay();
  const today = new Date().toLocaleDateString('de-DE', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const getCookingTimeText = (time: string) => {
    switch (time) {
      case 'quick': return 'Unter 30 Minuten';
      case 'medium': return '30-60 Minuten';
      case 'long': return 'Über 60 Minuten';
      default: return time;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Einfach';
      case 'medium': return 'Mittel';
      case 'hard': return 'Schwer';
      default: return difficulty;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gericht des Tages</h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {today}
              </p>
            </div>
          </div>

          {/* Featured Dish Card */}
          <Card className="shadow-card-hover border-primary/20">
            <CardHeader className="text-center pb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
                <ChefHat className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-4xl font-bold text-foreground mb-2">
                {todaysDish.name}
              </CardTitle>
              <p className="text-lg text-muted-foreground">
                Heute empfehlen wir Ihnen dieses köstliche Gericht
              </p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">Kochzeit</h3>
                  <p className="text-muted-foreground">{getCookingTimeText(todaysDish.cookingTime)}</p>
                </div>

                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <ChefHat className="h-6 w-6 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">Schwierigkeit</h3>
                  <p className="text-muted-foreground">{getDifficultyText(todaysDish.difficulty)}</p>
                </div>

                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <Globe className="h-6 w-6 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">Küche</h3>
                  <p className="text-muted-foreground">{todaysDish.cuisine}</p>
                </div>
              </div>

              {/* Category and Tags */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Kategorie</h3>
                  <Badge variant="secondary" className="text-base px-4 py-2 capitalize">
                    {todaysDish.category}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Hauptzutaten</h3>
                  <div className="flex flex-wrap gap-2">
                    {todaysDish.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-sm px-3 py-1 capitalize">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-hero p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Täglich neue Inspiration
                </h3>
                <p className="text-muted-foreground">
                  Jeden Tag wählen wir ein neues Gericht für Sie aus. Kommen Sie morgen wieder, 
                  um eine neue kulinarische Entdeckung zu machen! Das Gericht des Tages wechselt 
                  automatisch um Mitternacht.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <Link to="/ingredient-finder">
                  <Button variant="outline" size="lg">
                    Ähnliche Gerichte finden
                  </Button>
                </Link>
                <Link to="/weekly-calendar">
                  <Button size="lg">
                    Zum Wochenplan hinzufügen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Tomorrow Preview */}
          <Card className="mt-8 border-dashed border-2 border-muted">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Morgen gibt es etwas Neues!
              </h3>
              <p className="text-muted-foreground">
                Kommen Sie morgen zurück, um das nächste Gericht des Tages zu entdecken.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}