import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dinnerDishes, convertUserDishToDish, type Dish } from "@/data/dishes";
import { ArrowLeft, Calendar, Plus, X, Search, Save, LogIn, Users, BookmarkPlus, Heart, Star, RefreshCw, ChefHat, Clock, Gauge, Tag, Trash2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

type WeeklyMeals = {
  [key: string]: {
    dish: Dish | null;
    isLeftover: boolean;
    leftoverOf?: string;
  };
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
    monday: { dish: null, isLeftover: false },
    tuesday: { dish: null, isLeftover: false },
    wednesday: { dish: null, isLeftover: false },
    thursday: { dish: null, isLeftover: false },
    friday: { dish: null, isLeftover: false },
    saturday: { dish: null, isLeftover: false },
    sunday: { dish: null, isLeftover: false }
  });

  const [showDishSelector, setShowDishSelector] = useState<string | null>(null);
  const [showLeftoverSelector, setShowLeftoverSelector] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("all");
  const [saving, setSaving] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [userDishes, setUserDishes] = useState<Dish[]>([]);
  const [profiles, setProfiles] = useState<{ [key: string]: string }>({});
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [dishRatings, setDishRatings] = useState<Map<string, { avg: number, count: number, userRating?: number }>>(new Map());

  const allDishes = [...dinnerDishes, ...userDishes];
  const cuisines = Array.from(new Set(allDishes.map(dish => dish.cuisine))).sort();

  // Load groups and user dishes when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      loadGroups();
      loadUserDishes();
      loadUserFavorites();
      loadDishRatings();
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

  // Setup realtime for favorites
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-favorites-calendar')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_favorites',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadUserFavorites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Setup realtime for ratings
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('dish-ratings-calendar')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dish_ratings'
        },
        () => {
          loadDishRatings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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

  const loadUserDishes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_dishes')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        setUserDishes(data.map(convertUserDishToDish));
      }
    } catch (error) {
      console.error('Error loading user dishes:', error);
    }
  };

  const loadProfiles = async (userIds: string[]) => {
    if (userIds.length === 0) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);
      
      if (error) throw error;
      
      if (data) {
        const profilesMap: { [key: string]: string } = {};
        data.forEach(profile => {
          profilesMap[profile.id] = profile.display_name || 'Unknown';
        });
        setProfiles(prev => ({ ...prev, ...profilesMap }));
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const loadUserFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('dish_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        setUserFavorites(new Set(data.map(f => f.dish_id)));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (dishId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: t('favorites.loginRequired'),
        variant: "destructive"
      });
      return;
    }

    const isFavorited = userFavorites.has(dishId);
    
    setUserFavorites(prev => {
      const newSet = new Set(prev);
      if (isFavorited) {
        newSet.delete(dishId);
      } else {
        newSet.add(dishId);
      }
      return newSet;
    });

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user!.id)
          .eq('dish_id', dishId);
        
        if (error) throw error;
        
        toast({
          title: t('favorites.removed')
        });
      } else {
        const isUserDish = userDishes.some(d => d.id === dishId);
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user!.id,
            dish_id: dishId,
            is_user_dish: isUserDish
          });
        
        if (error) throw error;
        
        toast({
          title: t('favorites.added')
        });
      }
    } catch (error) {
      setUserFavorites(prev => {
        const newSet = new Set(prev);
        if (isFavorited) {
          newSet.add(dishId);
        } else {
          newSet.delete(dishId);
        }
        return newSet;
      });
      
      toast({
        title: t('favorites.error'),
        variant: "destructive"
      });
    }
  };

  const loadDishRatings = async () => {
    if (!user) return;

    const { data: allRatings, error } = await supabase
      .from('dish_ratings')
      .select('*');

    if (error) {
      console.error('Error loading ratings:', error);
      return;
    }

    const ratingsMap = new Map<string, { avg: number, count: number, userRating?: number }>();
    const dishGroups = new Map<string, { total: number, count: number, userRating?: number }>();

    allRatings?.forEach(rating => {
      const key = rating.dish_id;
      if (!dishGroups.has(key)) {
        dishGroups.set(key, { total: 0, count: 0 });
      }
      const group = dishGroups.get(key)!;
      group.total += rating.rating;
      group.count += 1;
      if (rating.user_id === user.id) {
        group.userRating = rating.rating;
      }
    });

    dishGroups.forEach((value, key) => {
      ratingsMap.set(key, {
        avg: value.total / value.count,
        count: value.count,
        userRating: value.userRating
      });
    });

    setDishRatings(ratingsMap);
  };

  const rateDish = async (dishId: string, isUserDish: boolean, rating: number) => {
    if (!user) {
      toast({
        title: t('rating.loginRequired'),
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('dish_ratings')
      .upsert({
        user_id: user.id,
        dish_id: dishId,
        is_user_dish: isUserDish,
        rating: rating
      }, {
        onConflict: 'user_id,dish_id'
      });

    if (error) {
      console.error('Error rating dish:', error);
      toast({
        title: "Fehler beim Bewerten",
        variant: "destructive",
      });
      return;
    }

    await loadDishRatings();
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
          monday: { dish: null, isLeftover: false },
          tuesday: { dish: null, isLeftover: false },
          wednesday: { dish: null, isLeftover: false },
          thursday: { dish: null, isLeftover: false },
          friday: { dish: null, isLeftover: false },
          saturday: { dish: null, isLeftover: false },
          sunday: { dish: null, isLeftover: false }
        };

        // Load profiles for added_by users
        const userIds = [...new Set(data.map(mp => mp.added_by).filter(Boolean))];
        if (userIds.length > 0) {
          loadProfiles(userIds);
        }

        data.forEach(mealPlan => {
          let dish = dinnerDishes.find(d => d.name === mealPlan.dish_name);
          
          // If not found in standard dishes, check user dishes
          if (!dish && mealPlan.user_dish_id) {
            dish = allDishes.find(d => d.id === mealPlan.user_dish_id);
          }
          
          if (dish) {
            loadedMeals[mealPlan.day_of_week as keyof WeeklyMeals] = {
              dish: {
                ...dish,
                addedBy: mealPlan.added_by,
                isUserDish: !!mealPlan.user_dish_id
              } as any,
              isLeftover: mealPlan.is_leftover || false,
              leftoverOf: mealPlan.leftover_of_dish || undefined
            };
          }
        });

        setWeeklyMeals(loadedMeals);
      }
    } catch (error) {
      // Error loading meal plan - fail silently
    }
  };

  const filteredDishes = allDishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine = selectedCuisine === "all" || dish.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  }).sort((a, b) => {
    // Sort favorites first
    const aFav = userFavorites.has(a.id) ? 1 : 0;
    const bFav = userFavorites.has(b.id) ? 1 : 0;
    return bFav - aFav;
  });

  const assignDishToDay = async (day: string, dish: Dish, isLeftover: boolean = false, leftoverOf?: string) => {
    setWeeklyMeals(prev => ({
      ...prev,
      [day]: { dish, isLeftover, leftoverOf }
    }));
    setShowDishSelector(null);
    setShowLeftoverSelector(null);

    // Log activity if in group mode
    if (selectedGroupId && user) {
      try {
        const weekStart = getWeekStartDate();
        const weekStartString = weekStart.toISOString().split('T')[0];
        
        await supabase.from('group_activities').insert({
          group_id: selectedGroupId,
          user_id: user.id,
          activity_type: 'dish_added',
          dish_name: dish.name,
          day_of_week: day,
          week_start_date: weekStartString
        });
      } catch (error) {
        console.error('Error logging activity:', error);
      }
    }
  };

  const removeDishFromDay = async (day: string) => {
    const removedDish = weeklyMeals[day].dish;
    
    setWeeklyMeals(prev => ({
      ...prev,
      [day]: { dish: null, isLeftover: false }
    }));

    // Log activity if in group mode
    if (selectedGroupId && user && removedDish) {
      try {
        const weekStart = getWeekStartDate();
        const weekStartString = weekStart.toISOString().split('T')[0];
        
        await supabase.from('group_activities').insert({
          group_id: selectedGroupId,
          user_id: user.id,
          activity_type: 'dish_removed',
          dish_name: removedDish.name,
          day_of_week: day,
          week_start_date: weekStartString
        });
      } catch (error) {
        console.error('Error logging activity:', error);
      }
    }
  };

  const addDishToLibrary = async (dish: Dish) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.from('user_dishes').insert({
        user_id: user.id,
        name: dish.name,
        tags: dish.tags,
        cooking_time: dish.cookingTime,
        difficulty: dish.difficulty,
        cuisine: dish.cuisine,
        category: dish.category
      });

      if (error) throw error;

      toast({
        title: language === 'de' ? "Hinzugefügt!" : "Added!",
        description: language === 'de' 
          ? `${dish.name} wurde zu deiner Gerichtesammlung hinzugefügt.`
          : `${dish.name} has been added to your dish library.`
      });

      // Reload user dishes
      await loadUserDishes();
    } catch (error) {
      toast({
        title: language === 'de' ? "Fehler" : "Error",
        description: language === 'de'
          ? "Das Gericht konnte nicht hinzugefügt werden."
          : "Failed to add dish to your library.",
        variant: "destructive"
      });
    }
  };

  const isDishInLibrary = (dishName: string) => {
    return userDishes.some(d => d.name === dishName) || dinnerDishes.some(d => d.name === dishName);
  };

  const clearWeek = async () => {
    if (!isAuthenticated) return;
    
    const newMeals = {
      monday: { dish: null, isLeftover: false },
      tuesday: { dish: null, isLeftover: false },
      wednesday: { dish: null, isLeftover: false },
      thursday: { dish: null, isLeftover: false },
      friday: { dish: null, isLeftover: false },
      saturday: { dish: null, isLeftover: false },
      sunday: { dish: null, isLeftover: false }
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
        .filter(([_, mealData]) => mealData.dish !== null)
        .map(([day, mealData]) => {
          // Check if this is a user dish
          const userDish = userDishes.find(ud => ud.name === mealData.dish!.name);
          
          return {
            user_id: user!.id,
            week_start_date: weekStartString,
            day_of_week: day,
            dish_name: mealData.dish!.name,
            group_id: selectedGroupId,
            added_by: user!.id,
            user_dish_id: userDish?.id || null,
            is_leftover: mealData.isLeftover,
            leftover_of_dish: mealData.leftoverOf || null
          };
        });

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
    const plannedDays = Object.values(weeklyMeals).filter(mealData => mealData.dish !== null).length;
    return Math.round((plannedDays / 7) * 100);
  };
  
  // Allow all dishes to be marked as leftovers, not just those in the weekly plan
  const availableLeftovers = allDishes;


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
                  {weeklyMeals[day.key].dish ? (
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
                        <div className={`bg-gradient-card p-3 rounded-lg ${
                          weeklyMeals[day.key].isLeftover ? 'border-l-4 border-l-blue-400' : ''
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm text-foreground line-clamp-2">
                              {weeklyMeals[day.key].dish!.name}
                            </h4>
                            {weeklyMeals[day.key].isLeftover && (
                              <Badge variant="secondary" className="text-xs">
                                <RefreshCw className="w-3 h-3 mr-1" />
                                {t('leftovers.title')}
                              </Badge>
                            )}
                          </div>
                          {weeklyMeals[day.key].isLeftover && weeklyMeals[day.key].leftoverOf && (
                            <div className="text-xs text-muted-foreground mb-2">
                              {t('leftovers.from')}: {weeklyMeals[day.key].leftoverOf}
                            </div>
                          )}
                          <div className="space-y-1">
                            <Badge variant="secondary" className="text-xs">
                              {translateField('cuisine', weeklyMeals[day.key].dish!.cuisine)}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {translateField('cookingTime', weeklyMeals[day.key].dish!.cookingTime)}
                            </div>
                            {selectedGroupId && (weeklyMeals[day.key].dish as any).addedBy && (
                              <div className="text-xs text-muted-foreground">
                                {language === 'de' ? 'Hinzugefügt von' : 'Added by'}: {profiles[(weeklyMeals[day.key].dish as any).addedBy] || 'Loading...'}
                              </div>
                            )}
                            {selectedGroupId && (weeklyMeals[day.key].dish as any).isUserDish && 
                             !isDishInLibrary(weeklyMeals[day.key].dish!.name) && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addDishToLibrary(weeklyMeals[day.key].dish!);
                                }}
                              >
                                <BookmarkPlus className="h-3 w-3 mr-1" />
                                {language === 'de' ? 'Zu meiner Sammlung' : 'Add to my library'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        className="w-full h-16 border-2 border-dashed border-muted hover:border-primary hover:bg-primary/5 flex items-center justify-center gap-2"
                        onClick={() => setShowDishSelector(day.key)}
                      >
                        <Plus className="h-5 w-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {language === 'de' ? 'Gericht hinzufügen' : 'Add Dish'}
                        </span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setShowLeftoverSelector(day.key)}
                        disabled={availableLeftovers.length === 0}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        {t('leftovers.add')}
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
                    {filteredDishes.map(dish => {
                      const isFavorited = userFavorites.has(dish.id);
                      return (
                        <div
                          key={dish.id}
                          className={`p-3 border rounded-lg hover:bg-accent cursor-pointer relative ${
                            isFavorited ? 'border-amber-400/60 bg-amber-50/50' : 'border-border'
                          }`}
                          onClick={() => assignDishToDay(showDishSelector, dish)}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`absolute top-2 right-2 h-7 w-7 transition-all duration-300 ${
                              isFavorited 
                                ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-100' 
                                : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-50'
                            }`}
                            onClick={(e) => toggleFavorite(dish.id, e)}
                          >
                            <Heart 
                              className={`h-4 w-4 transition-all duration-300 ${isFavorited ? 'fill-amber-500' : ''}`}
                            />
                          </Button>
                           <div className="flex items-center justify-between pr-8">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{dish.name}</h4>
                              <div className="flex gap-2 mt-1 items-center">
                                <Badge variant="secondary" className="text-xs">
                                  {translateField('cuisine', dish.cuisine)}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {translateField('difficulty', dish.difficulty)}
                                </Badge>
                                {/* Rating Display */}
                                {dishRatings.get(dish.id || dish.name) && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs text-muted-foreground">
                                      {dishRatings.get(dish.id || dish.name)!.avg.toFixed(1)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Leftover Selector Dialog */}
          {showLeftoverSelector && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-primary" />
                      {t('leftovers.select')}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowLeftoverSelector(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availableLeftovers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('leftovers.none')}
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {availableLeftovers.map(dish => (
                        <div
                          key={dish.id}
                          className="p-3 border-2 border-blue-400/50 hover:border-blue-400 rounded-lg cursor-pointer transition-all hover:bg-blue-50/50"
                          onClick={() => showLeftoverSelector && assignDishToDay(showLeftoverSelector, dish, true, dish.name)}
                        >
                          <div className="flex items-center gap-3">
                            <RefreshCw className="w-4 h-4 text-blue-500" />
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{dish.name}</h4>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {translateField('cuisine', dish.cuisine)}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {translateField('cookingTime', dish.cookingTime)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
