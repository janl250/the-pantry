import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dinnerDishes, type Dish } from "@/data/dishes";
import { ArrowLeft, Calendar, Plus, X, Search, Save } from "lucide-react";
import { Link } from "react-router-dom";

type WeeklyMeals = {
  [key: string]: Dish | null;
};

const daysOfWeek = [
  { key: 'monday', label: 'Montag' },
  { key: 'tuesday', label: 'Dienstag' },
  { key: 'wednesday', label: 'Mittwoch' },
  { key: 'thursday', label: 'Donnerstag' },
  { key: 'friday', label: 'Freitag' },
  { key: 'saturday', label: 'Samstag' },
  { key: 'sunday', label: 'Sonntag' }
];

export default function WeeklyCalendar() {
  const [weeklyMeals, setWeeklyMeals] = useState<WeeklyMeals>({
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null
  });

  const [showDishSelector, setShowDishSelector] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("all");

  const cuisines = Array.from(new Set(dinnerDishes.map(dish => dish.cuisine))).sort();

  const filteredDishes = dinnerDishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine = selectedCuisine === "all" || dish.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  const assignDishToDay = (day: string, dish: Dish) => {
    setWeeklyMeals(prev => ({
      ...prev,
      [day]: dish
    }));
    setShowDishSelector(null);
  };

  const removeDishFromDay = (day: string) => {
    setWeeklyMeals(prev => ({
      ...prev,
      [day]: null
    }));
  };

  const clearWeek = () => {
    setWeeklyMeals({
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
      sunday: null
    });
  };

  const saveMealPlan = () => {
    // This would normally save to a database
    // For now, we'll show a message about needing Supabase
    alert("Um Ihren Wochenplan zu speichern, müssen Sie Supabase verbinden. Klicken Sie auf den grünen Supabase-Button oben rechts.");
  };

  const getWeekProgress = () => {
    const plannedDays = Object.values(weeklyMeals).filter(meal => meal !== null).length;
    return Math.round((plannedDays / 7) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">Wochenplaner</h1>
              <p className="text-muted-foreground mt-2">
                Planen Sie Ihre Mahlzeiten für die ganze Woche
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearWeek}>
                Woche löschen
              </Button>
              <Button onClick={saveMealPlan} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Speichern
              </Button>
            </div>
          </div>

          {/* Progress Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Wochenfortschritt</h3>
                  <p className="text-muted-foreground">
                    {Object.values(weeklyMeals).filter(meal => meal !== null).length} von 7 Tagen geplant
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{getWeekProgress()}%</div>
                  <div className="w-20 h-2 bg-muted rounded-full mt-2">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${getWeekProgress()}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Calendar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {daysOfWeek.map(day => (
              <Card key={day.key} className="h-64">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-center">
                    {day.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 h-full">
                  {weeklyMeals[day.key] ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => removeDishFromDay(day.key)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="bg-gradient-card p-3 rounded-lg">
                          <h4 className="font-medium text-sm text-foreground mb-2 line-clamp-2">
                            {weeklyMeals[day.key]!.name}
                          </h4>
                          <div className="space-y-1">
                            <Badge variant="secondary" className="text-xs">
                              {weeklyMeals[day.key]!.cuisine}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {weeklyMeals[day.key]!.cookingTime === 'quick' && 'Schnell'}
                              {weeklyMeals[day.key]!.cookingTime === 'medium' && 'Mittel'}  
                              {weeklyMeals[day.key]!.cookingTime === 'long' && 'Lang'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center">
                      <Button
                        variant="ghost"
                        className="w-full h-full border-2 border-dashed border-muted hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-2"
                        onClick={() => setShowDishSelector(day.key)}
                      >
                        <Plus className="h-6 w-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Gericht hinzufügen</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dish Selector Modal */}
          {showDishSelector && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Gericht für {daysOfWeek.find(d => d.key === showDishSelector)?.label} auswählen
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowDishSelector(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search and Filter */}
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Gerichte suchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Küche" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Küchen</SelectItem>
                        {cuisines.map(cuisine => (
                          <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dish List */}
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredDishes.map(dish => (
                      <div
                        key={dish.id}
                        className="p-3 border border-border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => assignDishToDay(showDishSelector, dish)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">{dish.name}</h4>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {dish.cuisine}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {dish.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Save Notice */}
          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Calendar className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Wochenplan speichern
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Um Ihren Wochenplan dauerhaft zu speichern und von überall darauf zugreifen zu können, 
                    verbinden Sie Ihr Projekt mit Supabase. Klicken Sie dazu auf den grünen Supabase-Button 
                    oben rechts in der Benutzeroberfläche.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mit Supabase können Sie Ihre Mahlzeitenpläne speichern, bearbeiten und mit anderen teilen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}