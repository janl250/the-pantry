import { useState, useMemo, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { dinnerDishes, convertUserDishToDish, type Dish } from "@/data/dishes";
import { ArrowLeft, Search, Filter, Heart, Star, Shuffle, CalendarPlus, BarChart3, Clock, ChefHat, X, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { AddDishDialog } from "@/components/AddDishDialog";
import { EditDishDialog } from "@/components/EditDishDialog";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function DishLibrary() {
  const { t, translateField } = useLanguage();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("all");
  const [selectedCookingTime, setSelectedCookingTime] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSortBy, setSelectedSortBy] = useState<string>("rating-desc");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [userDishes, setUserDishes] = useState<Dish[]>([]);
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingDish, setEditingDish] = useState<{ id: string; dish: Dish } | null>(null);
  const [dishRatings, setDishRatings] = useState<Map<string, { avg: number, count: number, userRating?: number }>>(new Map());
  const [randomDish, setRandomDish] = useState<Dish | null>(null);
  const [showRandomDialog, setShowRandomDialog] = useState(false);
  const [dishStats, setDishStats] = useState<Map<string, { count: number, lastCooked?: Date }>>(new Map());
  const [selectedDishForStats, setSelectedDishForStats] = useState<Dish | null>(null);

  const loadUserDishes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data, error } = await supabase
          .from('user_dishes')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        if (data) {
          setUserDishes(data.map(convertUserDishToDish));
        }
      }
    } catch (error) {
      console.error('Error loading user dishes:', error);
    } finally {
      setIsLoading(false);
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

  const loadDishRatings = async () => {
    try {
      const { data: allRatings, error } = await supabase
        .from('dish_ratings')
        .select('*');

      if (error) throw error;

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
        if (user && rating.user_id === user.id) {
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
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const rateDish = async (dishId: string, isUserDish: boolean, rating: number) => {
    if (!isAuthenticated) {
      toast({
        title: t('rating.loginRequired'),
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('dish_ratings')
      .upsert({
        user_id: user!.id,
        dish_id: dishId,
        is_user_dish: isUserDish,
        rating: rating
      }, {
        onConflict: 'user_id,dish_id'
      });

    if (error) {
      console.error('Error rating dish:', error);
      toast({
        title: "Error rating dish",
        variant: "destructive",
      });
      return;
    }

    await loadDishRatings();
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
    
    // Optimistic UI update
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
      // Rollback on error
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

  const isUserDish = (dishId: string) => {
    return userDishes.some(d => d.id === dishId);
  };

  useEffect(() => {
    loadUserDishes();
    if (isAuthenticated) {
      loadUserFavorites();
      loadDishStats();
    }
    loadDishRatings();
  }, [isAuthenticated]);

  const loadDishStats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('dish_name, week_start_date, day_of_week')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const dayOffsets: Record<string, number> = {
        'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3,
        'friday': 4, 'saturday': 5, 'sunday': 6
      };
      
      const statsMap = new Map<string, { count: number, lastCooked?: Date }>();
      data?.forEach(plan => {
        const existing = statsMap.get(plan.dish_name) || { count: 0 };
        
        // Calculate actual date from week_start_date + day_of_week offset
        const weekStart = new Date(plan.week_start_date);
        const dayOffset = dayOffsets[plan.day_of_week?.toLowerCase() || 'monday'] || 0;
        const actualDate = new Date(weekStart);
        actualDate.setDate(weekStart.getDate() + dayOffset);
        
        const isNewer = !existing.lastCooked || actualDate > existing.lastCooked;
        
        statsMap.set(plan.dish_name, {
          count: existing.count + 1,
          lastCooked: isNewer ? actualDate : existing.lastCooked
        });
      });
      setDishStats(statsMap);
    } catch (error) {
      console.error('Error loading dish stats:', error);
    }
  };
  
  // Format relative time for "last cooked" display
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return t('stats.today');
    } else if (diffDays === 1) {
      return t('stats.yesterday');
    } else if (diffDays < 7) {
      return t('stats.daysAgo').replace('{days}', diffDays.toString());
    } else if (diffDays < 14) {
      return t('stats.lastWeek');
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return t('stats.weeksAgo').replace('{weeks}', weeks.toString());
    } else if (diffDays < 60) {
      return t('stats.lastMonth');
    } else {
      const months = Math.floor(diffDays / 30);
      return t('stats.monthsAgo').replace('{months}', months.toString());
    }
  };

  const surpriseMe = () => {
    const availableDishes = filteredDishes.length > 0 ? filteredDishes : allDishes;
    const randomIndex = Math.floor(Math.random() * availableDishes.length);
    setRandomDish(availableDishes[randomIndex]);
    setShowRandomDialog(true);
  };

  const addToToday = async (dish: Dish) => {
    if (!isAuthenticated) {
      toast({
        title: t('weeklyCalendar.loginRequired'),
        variant: "destructive"
      });
      return;
    }

    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = dayNames[dayOfWeek];
    
    // Get week start date
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));
    const weekStartString = weekStart.toISOString().split('T')[0];

    try {
      const isUserDishItem = userDishes.some(d => d.id === dish.id);
      
      const { error } = await supabase
        .from('meal_plans')
        .upsert({
          user_id: user!.id,
          week_start_date: weekStartString,
          day_of_week: todayKey,
          dish_name: dish.name,
          user_dish_id: isUserDishItem ? dish.id : null,
          added_by: user!.id
        }, {
          onConflict: 'user_id,week_start_date,day_of_week,group_id'
        });

      if (error) throw error;

      toast({
        title: t('quickActions.addedToToday'),
        description: dish.name
      });
      setShowRandomDialog(false);
    } catch (error) {
      console.error('Error adding to today:', error);
      toast({
        title: t('common.error'),
        variant: "destructive"
      });
    }
  };

  // Setup realtime for favorites
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-favorites-changes')
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
    const channel = supabase
      .channel('dish-ratings-changes')
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
  }, []);

  const allDishes = [...dinnerDishes, ...userDishes];
  const cuisines = Array.from(new Set(allDishes.map(dish => dish.cuisine))).sort();
  const categories = Array.from(new Set(allDishes.map(dish => dish.category))).sort();

  const filteredDishes = useMemo(() => {
    let dishes = allDishes.filter(dish => {
      const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dish.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCuisine = selectedCuisine === "all" || dish.cuisine === selectedCuisine;
      const matchesCookingTime = selectedCookingTime === "all" || dish.cookingTime === selectedCookingTime;
      const matchesDifficulty = selectedDifficulty === "all" || dish.difficulty === selectedDifficulty;
      const matchesCategory = selectedCategory === "all" || dish.category === selectedCategory;
      const matchesFavorites = !showFavoritesOnly || userFavorites.has(dish.id);

      return matchesSearch && matchesCuisine && matchesCookingTime && matchesDifficulty && matchesCategory && matchesFavorites;
    });

    // Apply sorting
    return dishes.sort((a, b) => {
      // Favorites always first
      const aFav = userFavorites.has(a.id) ? 1 : 0;
      const bFav = userFavorites.has(b.id) ? 1 : 0;
      if (bFav !== aFav) return bFav - aFav;

      // Then apply selected sort
      switch (selectedSortBy) {
        case "rating-desc": {
          const aRating = dishRatings.get(a.id)?.avg || 0;
          const bRating = dishRatings.get(b.id)?.avg || 0;
          return bRating - aRating;
        }
        case "rating-asc": {
          const aRating = dishRatings.get(a.id)?.avg || 0;
          const bRating = dishRatings.get(b.id)?.avg || 0;
          return aRating - bRating;
        }
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "time-asc": {
          const timeOrder = { quick: 1, medium: 2, long: 3 };
          return timeOrder[a.cookingTime as keyof typeof timeOrder] - timeOrder[b.cookingTime as keyof typeof timeOrder];
        }
        case "time-desc": {
          const timeOrder = { quick: 1, medium: 2, long: 3 };
          return timeOrder[b.cookingTime as keyof typeof timeOrder] - timeOrder[a.cookingTime as keyof typeof timeOrder];
        }
        case "difficulty-asc": {
          const diffOrder = { easy: 1, medium: 2, hard: 3 };
          return diffOrder[a.difficulty as keyof typeof diffOrder] - diffOrder[b.difficulty as keyof typeof diffOrder];
        }
        case "difficulty-desc": {
          const diffOrder = { easy: 1, medium: 2, hard: 3 };
          return diffOrder[b.difficulty as keyof typeof diffOrder] - diffOrder[a.difficulty as keyof typeof diffOrder];
        }
      default:
        return 0;
    }
  });
}, [searchTerm, selectedCuisine, selectedCookingTime, selectedDifficulty, selectedCategory, selectedSortBy, showFavoritesOnly, allDishes, userFavorites, dishRatings]);

  const clearFilters = () => {
    setSelectedCuisine("all");
    setSelectedCookingTime("all");
    setSelectedDifficulty("all");
    setSelectedCategory("all");
    setSelectedSortBy("rating-desc");
    setSearchTerm("");
    setShowFavoritesOnly(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('dishLibrary.title')}</h1>
                <p className="text-muted-foreground mt-1">{allDishes.length} {t('dishLibrary.results')}</p>
              </div>
            </div>
            <div className="flex gap-2 w-full">
              <Button 
                onClick={surpriseMe} 
                variant="outline" 
                className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 hover:border-primary/50"
              >
                <Shuffle className="h-4 w-4" />
                <span className="hidden sm:inline">{t('dishLibrary.surpriseMe')}</span>
                <span className="sm:hidden">Zufällig</span>
              </Button>
              <div className="flex-1 sm:flex-none">
                <AddDishDialog onDishAdded={loadUserDishes} />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={t('dishLibrary.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Filters:</span>
              </div>

              <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('dishLibrary.filters.cuisine')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dishLibrary.filters.cuisine')}</SelectItem>
                  {cuisines.map(cuisine => (
                    <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCookingTime} onValueChange={setSelectedCookingTime}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('dishLibrary.filters.cookingTime')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dishLibrary.filters.cookingTime')}</SelectItem>
                  <SelectItem value="quick">{t('dishLibrary.filters.quick')}</SelectItem>
                  <SelectItem value="medium">{t('dishLibrary.filters.medium')}</SelectItem>
                  <SelectItem value="long">{t('dishLibrary.filters.long')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('dishLibrary.filters.difficulty')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dishLibrary.filters.difficulty')}</SelectItem>
                  <SelectItem value="easy">{t('dishLibrary.filters.easy')}</SelectItem>
                  <SelectItem value="medium">{t('dishLibrary.filters.medium')}</SelectItem>
                  <SelectItem value="hard">{t('dishLibrary.filters.hard')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('dishLibrary.filters.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dishLibrary.filters.category')}</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSortBy} onValueChange={setSelectedSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('dishLibrary.sort.label')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating-desc">{t('dishLibrary.sort.ratingDesc')}</SelectItem>
                  <SelectItem value="rating-asc">{t('dishLibrary.sort.ratingAsc')}</SelectItem>
                  <SelectItem value="name-asc">{t('dishLibrary.sort.nameAsc')}</SelectItem>
                  <SelectItem value="name-desc">{t('dishLibrary.sort.nameDesc')}</SelectItem>
                  <SelectItem value="time-asc">{t('dishLibrary.sort.timeAsc')}</SelectItem>
                  <SelectItem value="time-desc">{t('dishLibrary.sort.timeDesc')}</SelectItem>
                  <SelectItem value="difficulty-asc">{t('dishLibrary.sort.difficultyAsc')}</SelectItem>
                  <SelectItem value="difficulty-desc">{t('dishLibrary.sort.difficultyDesc')}</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters} className="hover:bg-accent">
                {t('dishLibrary.clearFilters')}
              </Button>

              <div className="flex items-center gap-2 ml-auto">
                <Checkbox 
                  id="favorites-only" 
                  checked={showFavoritesOnly}
                  onCheckedChange={(checked) => setShowFavoritesOnly(checked as boolean)}
                />
                <label 
                  htmlFor="favorites-only" 
                  className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
                >
                  {t('favorites.showOnly')}
                </label>
              </div>
            </div>
          </div>

          {/* Personalized Recommendations */}
          {isAuthenticated && (() => {
            // Find dishes the user rated highly but hasn't cooked recently
            const recommendedDishes = allDishes.filter(dish => {
              const ratingData = dishRatings.get(dish.id);
              const userRating = ratingData?.userRating || 0;
              const stats = dishStats.get(dish.name);
              const hasBeenCooked = stats && stats.count > 0;
              const lastCookedDate = stats?.lastCooked;
              
              // Only recommend if: highly rated (4+) AND (never cooked OR not cooked in last 14 days)
              if (userRating >= 4) {
                if (!hasBeenCooked) return true;
                if (lastCookedDate) {
                  const daysSinceCooked = Math.floor((new Date().getTime() - lastCookedDate.getTime()) / (1000 * 60 * 60 * 24));
                  return daysSinceCooked > 14;
                }
              }
              return false;
            }).slice(0, 4);

            if (recommendedDishes.length === 0) return null;

            const { language } = { language: translateField ? (translateField('cuisine', 'Italian') === 'Italienisch' ? 'de' : 'en') : 'de' };

            return (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    {language === 'de' ? 'Für dich empfohlen' : 'Recommended for You'}
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {language === 'de' ? 'Basierend auf deinen Bewertungen' : 'Based on your ratings'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recommendedDishes.map((dish) => {
                    const ratingData = dishRatings.get(dish.id);
                    return (
                      <Card 
                        key={dish.id}
                        className="group cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
                        onClick={() => {
                          // Scroll to the dish in the main grid or show details
                          setSearchTerm(dish.name);
                        }}
                      >
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
                            {dish.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            <span className="text-xs text-muted-foreground">
                              {ratingData?.userRating || 0}/5
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {translateField('cookingTime', dish.cookingTime)}
                            </span>
                          </div>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {translateField('cuisine', dish.cuisine)}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Results */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredDishes.length} {t('dishLibrary.results')}
            </p>
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredDishes.map((dish) => {
              const isFavorited = userFavorites.has(dish.id);
              return (
                <Card 
                  key={dish.id} 
                  className={`group overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border bg-card/50 backdrop-blur-sm relative ${
                    isFavorited ? 'border-amber-400/60 shadow-amber-400/20' : 'border-border/40'
                  } ${isUserDish(dish.id) ? 'cursor-pointer' : ''}`}
                  onClick={() => isUserDish(dish.id) && setEditingDish({ id: dish.id, dish })}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute top-2 right-2 z-10 transition-all duration-300 ${
                      isFavorited 
                        ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50' 
                        : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-50'
                    }`}
                    onClick={(e) => toggleFavorite(dish.id, e)}
                  >
                    <Heart 
                      className={`h-5 w-5 transition-all duration-300 ${isFavorited ? 'fill-amber-500' : ''}`}
                    />
                  </Button>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors pr-8">{dish.name}</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {translateField('cuisine', dish.cuisine)}
                      </Badge>
                      <Badge variant="outline" className="border-sage/30 text-sage hover:bg-sage/10">
                        {translateField('difficulty', dish.difficulty)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{translateField('cookingTime', dish.cookingTime)}</span>
                      <span>•</span>
                      <span>{translateField('category', dish.category)}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {dish.tags.slice(0, 4).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-cream/50 hover:bg-cream">
                          {translateField('ingredient', tag)}
                        </Badge>
                      ))}
                      {dish.tags.length > 4 && (
                        <Badge variant="outline" className="text-xs bg-terracotta/10 text-terracotta">
                          +{dish.tags.length - 4} more
                        </Badge>
                      )}
                    </div>

                    {/* Rating System & Stats */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const dishKey = dish.id || dish.name;
                            const ratingData = dishRatings.get(dishKey);
                            const userRating = ratingData?.userRating || 0;
                            const isFilled = star <= userRating;
                            
                            return (
                              <button
                                key={star}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  rateDish(dishKey, !!dish.id, star);
                                }}
                                className="transition-all duration-200 hover:scale-110"
                                title={t('rating.rate')}
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    isFilled
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground hover:text-yellow-400'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                        {dishRatings.get(dish.id || dish.name) && (
                          <span className="text-xs text-muted-foreground">
                            {dishRatings.get(dish.id || dish.name)!.avg.toFixed(1)} 
                            ({dishRatings.get(dish.id || dish.name)!.count})
                          </span>
                        )}
                      </div>
                      
                      {/* Quick Actions & Stats */}
                      <div className="flex items-center gap-1">
                        {dishStats.get(dish.name) ? (
                          <div 
                            className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md cursor-default"
                            title={`${t('stats.cookedTimes')}: ${dishStats.get(dish.name)?.count}x`}
                          >
                            <Clock className="h-3 w-3" />
                            <span>{formatRelativeTime(dishStats.get(dish.name)!.lastCooked!)}</span>
                            <span className="text-muted-foreground/60">•</span>
                            <span className="font-medium">{dishStats.get(dish.name)?.count}x</span>
                          </div>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToToday(dish);
                          }}
                          title={t('quickActions.addToToday')}
                        >
                          <CalendarPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>

          {editingDish && (
            <EditDishDialog
              dish={editingDish.dish}
              dishId={editingDish.id}
              open={!!editingDish}
              onOpenChange={(open) => !open && setEditingDish(null)}
              onDishUpdated={loadUserDishes}
              onDishDeleted={loadUserDishes}
            />
          )}

          {filteredDishes.length === 0 && (
            <div className="text-center py-16">
              <div className="mb-6">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto flex items-center justify-center mb-4">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('dishLibrary.noResults')}</h3>
                <p className="text-muted-foreground mb-6">{t('dishLibrary.noResultsDescription')}</p>
              </div>
              <Button variant="outline" onClick={clearFilters} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t('dishLibrary.clearFilters')}
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Random Dish Dialog */}
      <Dialog open={showRandomDialog} onOpenChange={setShowRandomDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5 text-primary" />
              {t('dishLibrary.surpriseMe')}
            </DialogTitle>
          </DialogHeader>
          {randomDish && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <h3 className="text-2xl font-bold text-foreground mb-2">{randomDish.name}</h3>
                <div className="flex justify-center gap-2 mb-3">
                  <Badge variant="secondary">{translateField('cuisine', randomDish.cuisine)}</Badge>
                  <Badge variant="outline">{translateField('difficulty', randomDish.difficulty)}</Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  {translateField('cookingTime', randomDish.cookingTime)} • {translateField('category', randomDish.category)}
                </p>
                {dishStats.get(randomDish.name) && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('stats.cookedTimes')}: {dishStats.get(randomDish.name)?.count}x
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={surpriseMe}>
                  <Shuffle className="h-4 w-4 mr-2" />
                  {t('dishLibrary.tryAnother')}
                </Button>
                <Button className="flex-1" onClick={() => addToToday(randomDish)}>
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  {t('quickActions.addToToday')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
}