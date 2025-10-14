import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dinnerDishes, type Dish } from "@/data/dishes";
import { ArrowLeft, Calendar, Plus, X, Search, Save, LogIn, Users } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

type WeeklyMeals = {
  [key: string]: Dish | null;
};

type Group = {
  id: string;
  name: string;
};

export default function WeeklyCalendar() {
  const { t, language, translateField } = useLanguage();
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const daysOfWeek = [
    { key: 'monday', label: t('weeklyCalendar.days.monday') },
    { key: 'tuesday', label: t('weeklyCalendar.days.tuesday') },
    { key: 'wednesday', label: t('weeklyCalendar.days.wednesday') },
    { key: 'thursday', label: t('weeklyCalendar.days.thursday') },
    { key: 'friday', label: t('weeklyCalendar.days.friday') },
    { key: 'saturday', label: t('weeklyCalendar.days.saturday') },
    { key: 'sunday', label: t('weeklyCalendar.days.sunday') }
  ];
  
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
  const [saving, setSaving] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const cuisines = Array.from(new Set(dinnerDishes.map(dish => dish.cuisine))).sort();

  // Load groups when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      loadGroups();
    }
  }, [isAuthenticated, user]);

  // Set initial group from URL params
  useEffect(() => {
    const groupParam = searchParams.get('group');
    if (groupParam) {
      setSelectedGroupId(groupParam);
    }
  }, [searchParams]);

  // Load meal plan when user or selected group changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadMealPlan();
    }
  }, [isAuthenticated, user, selectedGroupId]);

  // Setup realtime subscription for group calendars
  useEffect(() => {
    if (!selectedGroupId) return;

    const channel = supabase
      .channel('meal-plans-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_plans',
          filter: `group_id=eq.${selectedGroupId}`
        },
        () => {
          loadMealPlan();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedGroupId]);

  const loadGroups = async () => {
    if (!user) return;
    
    try {
      const { data: memberships, error } = await supabase
        .from('group_members')
        .select(`
          groups (
            id,
            name
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      if (memberships) {
        const groupsList = memberships
          .map((m: any) => ({
            id: m.groups.id,
            name: m.groups.name
          }));
        setGroups(groupsList);
      }
    } catch (error) {
      // Error loading groups - fail silently
    }
  };

  const getWeekStartDate = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(today.setDate(diff));
  };

  const loadMealPlan = async () => {
    if (!user) return;
    
    const weekStart = getWeekStartDate();
    const weekStartString = weekStart.toISOString().split('T')[0];
    
    try {
      let query = supabase
        .from('meal_plans')
        .select('*')
        .eq('week_start_date', weekStartString);

      if (selectedGroupId) {
        query = query.eq('group_id', selectedGroupId);
      } else {
        query = query.eq('user_id', user.id).is('group_id', null);
      }

      const { data, error } = await query;

      if (error) {
        return;
      }

      if (data) {
        const loadedMeals: WeeklyMeals = {
          monday: null,
          tuesday: null,
          wednesday: null,
          thursday: null,
          friday: null,
          saturday: null,
          sunday: null
        };

        data.forEach(mealPlan => {
          const dish = dinnerDishes.find(d => d.name === mealPlan.dish_name);
          if (dish) {
            loadedMeals[mealPlan.day_of_week as keyof WeeklyMeals] = dish;
          }
        });

        setWeeklyMeals(loadedMeals);
      }
    } catch (error) {
      // Error loading meal plan - fail silently
    }
  };

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

  const clearWeek = async () => {
    if (!isAuthenticated) return;
    
    const newMeals = {
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
      sunday: null
    };
    
    setWeeklyMeals(newMeals);
    
    if (user) {
      const weekStart = getWeekStartDate();
      const weekStartString = weekStart.toISOString().split('T')[0];
      
      try {
        let query = supabase
          .from('meal_plans')
          .delete()
          .eq('week_start_date', weekStartString);

        if (selectedGroupId) {
          query = query.eq('group_id', selectedGroupId);
        } else {
          query = query.eq('user_id', user.id).is('group_id', null);
        }

        const { error } = await query;

        if (error) {
          toast({
            title: language === 'de' ? "Fehler" : "Error",
            description: t('weeklyCalendar.error'),
            variant: "destructive"
          });
        } else {
          toast({
            title: language === 'de' ? "Woche gelöscht" : "Week cleared",
            description: t('weeklyCalendar.cleared')
          });
        }
      } catch (error) {
        // Error clearing week
        toast({
          title: language === 'de' ? "Fehler" : "Error",
          description: t('weeklyCalendar.error'),
          variant: "destructive"
        });
      }
    }
  };

  const saveMealPlan = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    setSaving(true);
    
    try {
      const weekStart = getWeekStartDate();
      const weekStartString = weekStart.toISOString().split('T')[0];
      
      // First, delete existing meal plans for this week
      let deleteQuery = supabase
        .from('meal_plans')
        .delete()
        .eq('week_start_date', weekStartString);

      if (selectedGroupId) {
        deleteQuery = deleteQuery.eq('group_id', selectedGroupId);
      } else {
        deleteQuery = deleteQuery.eq('user_id', user!.id).is('group_id', null);
      }

      const { error: deleteError } = await deleteQuery;

      if (deleteError) {
        throw deleteError;
      }

      // Then, insert new meal plans
      const mealPlansToInsert = Object.entries(weeklyMeals)
        .filter(([_, dish]) => dish !== null)
        .map(([day, dish]) => ({
          user_id: user!.id,
          week_start_date: weekStartString,
          day_of_week: day,
          dish_name: dish!.name,
          group_id: selectedGroupId,
          added_by: user!.id
        }));

      if (mealPlansToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('meal_plans')
          .insert(mealPlansToInsert);

        if (insertError) {
          throw insertError;
        }
      }

      toast({
        title: language === 'de' ? "Erfolgreich gespeichert!" : "Successfully saved!",
        description: t('weeklyCalendar.saved')
      });
    } catch (error) {
      toast({
        title: language === 'de' ? "Fehler" : "Error",
        description: t('weeklyCalendar.error'),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
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
              <h1 className="text-3xl font-bold text-foreground">{t('weeklyCalendar.title')}</h1>
              <p className="text-muted-foreground mt-2">
                {t('weeklyCalendar.subtitle')}
              </p>
            </div>
            <div className="flex gap-2">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" onClick={clearWeek}>
                    {t('weeklyCalendar.clear')}
                  </Button>
                  <Button onClick={saveMealPlan} className="flex items-center gap-2" disabled={saving}>
                    <Save className="h-4 w-4" />
                    {saving ? (language === 'de' ? "Wird gespeichert..." : "Saving...") : t('weeklyCalendar.save')}
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate('/auth')} className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  {language === 'de' ? 'Anmelden zum Speichern' : 'Login to Save'}
                </Button>
              )}
            </div>
          </div>

          {/* Group Selection */}
          {isAuthenticated && groups.length > 0 && (
            <Card className="mb-8">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <Select
                    value={selectedGroupId || 'personal'}
                    onValueChange={(value) => {
                      const newGroupId = value === 'personal' ? null : value;
                      setSelectedGroupId(newGroupId);
                      if (newGroupId) {
                        setSearchParams({ group: newGroupId });
                      } else {
                        setSearchParams({});
                      }
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">{t('weeklyCalendar.personal')}</SelectItem>
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedGroupId && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {language === 'de' ? 'Gruppenmodus' : 'Group Mode'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {language === 'de' ? 'Wochenfortschritt' : 'Week Progress'}
                  </h3>
                  <p className="text-muted-foreground">
                    {Object.values(weeklyMeals).filter(meal => meal !== null).length} {language === 'de' ? 'von 7 Tagen geplant' : 'of 7 days planned'}
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
                              {translateField('cuisine', weeklyMeals[day.key]!.cuisine)}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {translateField('cookingTime', weeklyMeals[day.key]!.cookingTime)}
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
                        <span className="text-sm text-muted-foreground">
                          {language === 'de' ? 'Gericht hinzufügen' : 'Add Dish'}
                        </span>
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
                      {language === 'de' ? 'Gericht für' : 'Select dish for'} {daysOfWeek.find(d => d.key === showDishSelector)?.label}
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
                        placeholder={language === 'de' ? 'Gerichte suchen...' : 'Search dishes...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder={language === 'de' ? 'Küche' : 'Cuisine'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{language === 'de' ? 'Alle Küchen' : 'All cuisines'}</SelectItem>
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
                                {translateField('cuisine', dish.cuisine)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {translateField('difficulty', dish.difficulty)}
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

          {/* Save Notice - Only show if not authenticated */}
          {!isAuthenticated && (
            <Card className="mt-8 bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <LogIn className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {t('weeklyCalendar.loginRequired')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('weeklyCalendar.connectSupabase')}
                    </p>
                    <Button onClick={() => navigate('/auth')} className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      {language === 'de' ? 'Jetzt anmelden' : 'Log in now'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
