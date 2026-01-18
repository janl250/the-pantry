import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getDishOfTheDay } from "@/data/dishes";
import { ArrowLeft, Calendar, Clock, ChefHat, Globe, CalendarPlus, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { startOfWeek, addDays, format } from "date-fns";
import { de, enUS } from "date-fns/locale";

export default function DishOfTheDay() {
  const { t, language, translateField } = useLanguage();
  const navigate = useNavigate();
  const todaysDish = getDishOfTheDay();
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const today = new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const getDayLabel = (day: string) => {
    const dayNames: Record<string, { de: string; en: string }> = {
      monday: { de: 'Montag', en: 'Monday' },
      tuesday: { de: 'Dienstag', en: 'Tuesday' },
      wednesday: { de: 'Mittwoch', en: 'Wednesday' },
      thursday: { de: 'Donnerstag', en: 'Thursday' },
      friday: { de: 'Freitag', en: 'Friday' },
      saturday: { de: 'Samstag', en: 'Saturday' },
      sunday: { de: 'Sonntag', en: 'Sunday' },
    };
    return dayNames[day]?.[language] || day;
  };

  const getDateForDay = (day: string) => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const dayIndex = daysOfWeek.indexOf(day);
    const date = addDays(weekStart, dayIndex);
    return format(date, 'd. MMM', { locale: language === 'de' ? de : enUS });
  };

  const handleAddToDay = async (day: string) => {
    setSelectedDay(day);
    setIsAdding(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(language === 'de' ? 'Bitte melden Sie sich an' : 'Please sign in');
        setIsAdding(false);
        return;
      }

      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekStartDate = format(weekStart, 'yyyy-MM-dd');

      // Check if dish already exists on this day
      const { data: existing } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartDate)
        .eq('day_of_week', day)
        .eq('dish_name', todaysDish.name)
        .maybeSingle();

      if (existing) {
        toast.info(
          language === 'de' 
            ? `${todaysDish.name} ist bereits für ${getDayLabel(day)} geplant` 
            : `${todaysDish.name} is already planned for ${getDayLabel(day)}`
        );
        setIsAdding(false);
        return;
      }

      // Add dish to the selected day
      const { error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          week_start_date: weekStartDate,
          day_of_week: day,
          dish_name: todaysDish.name,
          is_leftover: false
        });

      if (error) throw error;

      toast.success(
        language === 'de'
          ? `${todaysDish.name} wurde zu ${getDayLabel(day)} hinzugefügt!`
          : `${todaysDish.name} added to ${getDayLabel(day)}!`,
        {
          action: {
            label: language === 'de' ? 'Zum Kalender' : 'View Calendar',
            onClick: () => navigate('/weekly-calendar')
          }
        }
      );
      
      setShowDayPicker(false);
    } catch (error) {
      console.error('Error adding dish:', error);
      toast.error(language === 'de' ? 'Fehler beim Hinzufügen' : 'Error adding dish');
    } finally {
      setIsAdding(false);
      setSelectedDay(null);
    }
  };

  const getCookingTimeText = (time: string) => {
    const timeDesc = translateField('cookingTime', time);
    switch (time) {
      case 'quick': return `${timeDesc} (${language === 'de' ? 'unter 30 Min' : 'under 30 min'})`;
      case 'medium': return `${timeDesc} (30-60 ${language === 'de' ? 'Min' : 'min'})`;
      case 'long': return `${timeDesc} (${language === 'de' ? 'über 60 Min' : 'over 60 min'})`;
      default: return timeDesc;
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
              <h1 className="text-3xl font-bold text-foreground">{t('dishOfDay.title')}</h1>
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
                {t('dishOfDay.subtitle')}
              </p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">{t('dishOfDay.cookingTime')}</h3>
                  <p className="text-muted-foreground">{getCookingTimeText(todaysDish.cookingTime)}</p>
                </div>

                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <ChefHat className="h-6 w-6 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">{t('dishOfDay.difficulty')}</h3>
                  <p className="text-muted-foreground">{translateField('difficulty', todaysDish.difficulty)}</p>
                </div>

                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <Globe className="h-6 w-6 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">{t('dishOfDay.cuisine')}</h3>
                  <p className="text-muted-foreground">{translateField('cuisine', todaysDish.cuisine)}</p>
                </div>
              </div>

              {/* Category and Tags */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{t('dishOfDay.category')}</h3>
                  <Badge variant="secondary" className="text-base px-4 py-2">
                    {translateField('category', todaysDish.category)}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{t('dishOfDay.ingredients')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {todaysDish.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-sm px-3 py-1 capitalize">
                        {translateField('ingredient', tag)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-hero p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {language === 'de' ? 'Täglich neue Inspiration' : 'Daily Fresh Inspiration'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'de' 
                    ? 'Jeden Tag wählen wir ein neues Gericht für Sie aus. Kommen Sie morgen wieder, um eine neue kulinarische Entdeckung zu machen! Das Gericht des Tages wechselt automatisch um Mitternacht.'
                    : 'Every day we select a new dish for you. Come back tomorrow to discover a new culinary delight! The dish of the day changes automatically at midnight.'
                  }
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center flex-wrap">
                <Link to="/ingredient-finder">
                  <Button variant="outline" size="lg">
                    {language === 'de' ? 'Ähnliche Gerichte finden' : 'Find Similar Dishes'}
                  </Button>
                </Link>
                <Button size="lg" onClick={() => setShowDayPicker(true)}>
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  {language === 'de' ? 'Tag auswählen' : 'Choose Day'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tomorrow Preview */}
          <Card className="mt-8 border-dashed border-2 border-muted">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {language === 'de' ? 'Morgen gibt es etwas Neues!' : 'Something New Tomorrow!'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'de' 
                  ? 'Kommen Sie morgen zurück, um das nächste Gericht des Tages zu entdecken.'
                  : 'Come back tomorrow to discover the next dish of the day.'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Day Picker Dialog */}
      <Dialog open={showDayPicker} onOpenChange={setShowDayPicker}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {language === 'de' ? 'Tag auswählen' : 'Choose a Day'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground mb-4">
              {language === 'de' 
                ? `"${todaysDish.name}" hinzufügen zu:`
                : `Add "${todaysDish.name}" to:`
              }
            </p>
            <div className="grid grid-cols-1 gap-2">
              {daysOfWeek.map((day) => (
                <Button
                  key={day}
                  variant={selectedDay === day ? "default" : "outline"}
                  className="w-full justify-between h-12"
                  onClick={() => handleAddToDay(day)}
                  disabled={isAdding}
                >
                  <span className="font-medium">{getDayLabel(day)}</span>
                  <span className="text-muted-foreground text-sm">{getDateForDay(day)}</span>
                  {selectedDay === day && isAdding && (
                    <span className="ml-2 animate-spin">⏳</span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}