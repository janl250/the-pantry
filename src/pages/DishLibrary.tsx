import { useState, useMemo, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { dinnerDishes, convertUserDishToDish, type Dish } from "@/data/dishes";
import { ArrowLeft, Search, Filter, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { AddDishDialog } from "@/components/AddDishDialog";
import { EditDishDialog } from "@/components/EditDishDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function DishLibrary() {
  const { t, translateField } = useLanguage();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("all");
  const [selectedCookingTime, setSelectedCookingTime] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [userDishes, setUserDishes] = useState<Dish[]>([]);
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingDish, setEditingDish] = useState<{ id: string; dish: Dish } | null>(null);

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
    }
  }, [isAuthenticated]);

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

    // Sort favorites first
    return dishes.sort((a, b) => {
      const aFav = userFavorites.has(a.id) ? 1 : 0;
      const bFav = userFavorites.has(b.id) ? 1 : 0;
      return bFav - aFav;
    });
  }, [searchTerm, selectedCuisine, selectedCookingTime, selectedDifficulty, selectedCategory, showFavoritesOnly, allDishes, userFavorites]);

  const clearFilters = () => {
    setSelectedCuisine("all");
    setSelectedCookingTime("all");
    setSelectedDifficulty("all");
    setSelectedCategory("all");
    setSearchTerm("");
    setShowFavoritesOnly(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{t('dishLibrary.title')}</h1>
                <p className="text-muted-foreground mt-2">{allDishes.length} {t('dishLibrary.results')}</p>
              </div>
            </div>
            <AddDishDialog onDishAdded={loadUserDishes} />
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
                  <SelectItem value="all">{t('dishLibrary.filters.all')}</SelectItem>
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
                  <SelectItem value="all">{t('dishLibrary.filters.all')}</SelectItem>
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
                  <SelectItem value="all">{t('dishLibrary.filters.all')}</SelectItem>
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
                  <SelectItem value="all">{t('dishLibrary.filters.all')}</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
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

      <Footer />
    </div>
  );
}