import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, PieChart, TrendingUp, Utensils, Leaf, Drumstick, Fish, ChefHat, Calendar, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { dinnerDishes } from "@/data/dishes";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from "date-fns";
import { de } from "date-fns/locale";

interface CookingStats {
  totalCooked: number;
  meatDishes: number;
  veggieDishes: number;
  fishDishes: number;
  categoryCounts: Record<string, number>;
  cuisineCounts: Record<string, number>;
  topDishes: { name: string; count: number }[];
}

interface MonthlyData {
  month: string;
  count: number;
  topDish: string;
}

interface PeriodComparison {
  current: number;
  previous: number;
  change: number;
}

// Categories that are typically meat-based
const MEAT_CATEGORIES = ['meat', 'chicken'];
const FISH_CATEGORIES = ['fish', 'seafood'];
const VEGGIE_CATEGORIES = ['vegetable', 'salad'];

export default function Statistics() {
  const { t, language, translateField } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<CookingStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [periodComparison, setPeriodComparison] = useState<PeriodComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStatistics();
    }
  }, [user]);

  const loadStatistics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load all meal plans for this user with week_start_date for timeline
      const { data: mealPlans, error } = await supabase
        .from('meal_plans')
        .select('dish_name, user_dish_id, is_leftover, week_start_date')
        .eq('user_id', user.id)
        .eq('is_leftover', false);

      if (error) throw error;

      // Load user dishes to get their categories
      const { data: userDishes } = await supabase
        .from('user_dishes')
        .select('id, name, category, cuisine')
        .eq('user_id', user.id);

      const userDishMap = new Map((userDishes || []).map(d => [d.id, d]));

      // Count dishes
      const dishCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};
      const cuisineCounts: Record<string, number> = {};
      let meatCount = 0;
      let veggieCount = 0;
      let fishCount = 0;

      (mealPlans || []).forEach((plan) => {
        const dishName = plan.dish_name;
        dishCounts[dishName] = (dishCounts[dishName] || 0) + 1;

        // Find dish info
        let category = '';
        let cuisine = '';

        if (plan.user_dish_id && userDishMap.has(plan.user_dish_id)) {
          const userDish = userDishMap.get(plan.user_dish_id)!;
          category = userDish.category.toLowerCase();
          cuisine = userDish.cuisine;
        } else {
          // Look in default dishes
          const defaultDish = dinnerDishes.find(d => d.name === dishName);
          if (defaultDish) {
            category = defaultDish.category.toLowerCase();
            cuisine = defaultDish.cuisine;
          }
        }

        if (category) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          
          if (MEAT_CATEGORIES.includes(category)) {
            meatCount++;
          } else if (FISH_CATEGORIES.includes(category)) {
            fishCount++;
          } else if (VEGGIE_CATEGORIES.includes(category)) {
            veggieCount++;
          }
        }

        if (cuisine) {
          cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
        }
      });

      // Get top dishes
      const topDishes = Object.entries(dishCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      setStats({
        totalCooked: mealPlans?.length || 0,
        meatDishes: meatCount,
        veggieDishes: veggieCount,
        fishDishes: fishCount,
        categoryCounts,
        cuisineCounts,
        topDishes
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="py-8 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-muted-foreground">{t('common.loading')}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="py-8 px-4">
          <div className="max-w-7xl mx-auto text-center space-y-4">
            <h1 className="text-3xl font-bold">{language === 'de' ? 'Statistiken' : 'Statistics'}</h1>
            <p className="text-muted-foreground">{t('emptyState.loginRequired.description')}</p>
            <Link to="/auth">
              <Button>{t('nav.login')}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate percentages for the pie chart visualization
  const totalTyped = (stats?.meatDishes || 0) + (stats?.veggieDishes || 0) + (stats?.fishDishes || 0);
  const meatPercent = totalTyped > 0 ? Math.round((stats?.meatDishes || 0) / totalTyped * 100) : 0;
  const veggiePercent = totalTyped > 0 ? Math.round((stats?.veggieDishes || 0) / totalTyped * 100) : 0;
  const fishPercent = totalTyped > 0 ? Math.round((stats?.fishDishes || 0) / totalTyped * 100) : 0;

  // Sort categories by count
  const sortedCategories = Object.entries(stats?.categoryCounts || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Sort cuisines by count
  const sortedCuisines = Object.entries(stats?.cuisineCounts || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const maxCategoryCount = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;
  const maxCuisineCount = sortedCuisines.length > 0 ? sortedCuisines[0][1] : 1;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              {language === 'de' ? 'Essen-Statistiken' : 'Food Statistics'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === 'de' 
                ? 'Deine persönliche Kochstatistik auf einen Blick' 
                : 'Your personal cooking statistics at a glance'}
            </p>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-12">{t('common.loading')}</div>
          ) : stats && stats.totalCooked > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Total Cooked */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ChefHat className="h-5 w-5 text-primary" />
                    {language === 'de' ? 'Gesamt gekocht' : 'Total Cooked'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">{stats.totalCooked}</div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'de' ? 'Gerichte geplant' : 'dishes planned'}
                  </p>
                </CardContent>
              </Card>

              {/* Meat vs Veggie vs Fish */}
              <Card className="md:col-span-2 lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <PieChart className="h-5 w-5 text-primary" />
                    {language === 'de' ? 'Fleisch vs. Vegetarisch vs. Fisch' : 'Meat vs. Veggie vs. Fish'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-6">
                    {/* Visual Bar Representation */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="h-8 rounded-full overflow-hidden flex bg-muted">
                        {meatPercent > 0 && (
                          <div 
                            className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                            style={{ width: `${meatPercent}%` }}
                          >
                            {meatPercent > 10 && `${meatPercent}%`}
                          </div>
                        )}
                        {veggiePercent > 0 && (
                          <div 
                            className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                            style={{ width: `${veggiePercent}%` }}
                          >
                            {veggiePercent > 10 && `${veggiePercent}%`}
                          </div>
                        )}
                        {fishPercent > 0 && (
                          <div 
                            className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                            style={{ width: `${fishPercent}%` }}
                          >
                            {fishPercent > 10 && `${fishPercent}%`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <Drumstick className="h-5 w-5 text-red-500" />
                        <span className="text-sm">
                          <span className="font-semibold">{stats.meatDishes}</span>
                          {' '}{language === 'de' ? 'Fleisch' : 'Meat'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-green-500" />
                        <span className="text-sm">
                          <span className="font-semibold">{stats.veggieDishes}</span>
                          {' '}{language === 'de' ? 'Vegetarisch' : 'Veggie'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Fish className="h-5 w-5 text-blue-500" />
                        <span className="text-sm">
                          <span className="font-semibold">{stats.fishDishes}</span>
                          {' '}{language === 'de' ? 'Fisch' : 'Fish'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Dishes */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {language === 'de' ? 'Beliebteste Gerichte' : 'Most Popular Dishes'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.topDishes.length > 0 ? (
                    <div className="space-y-3">
                      {stats.topDishes.map((dish, index) => (
                        <div key={dish.name} className="flex items-center gap-3">
                          <Badge 
                            variant={index === 0 ? "default" : "secondary"}
                            className="w-6 h-6 rounded-full flex items-center justify-center p-0"
                          >
                            {index + 1}
                          </Badge>
                          <div className="flex-1 truncate text-sm">{dish.name}</div>
                          <Badge variant="outline">{dish.count}x</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {language === 'de' ? 'Noch keine Daten' : 'No data yet'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Categories Distribution */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Utensils className="h-5 w-5 text-primary" />
                    {language === 'de' ? 'Nach Kategorie' : 'By Category'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sortedCategories.length > 0 ? (
                    <div className="space-y-2">
                      {sortedCategories.map(([category, count]) => (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{translateField('category', category)}</span>
                            <span className="text-muted-foreground">{count}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {language === 'de' ? 'Noch keine Daten' : 'No data yet'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Cuisines Distribution */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ChefHat className="h-5 w-5 text-primary" />
                    {language === 'de' ? 'Nach Küche' : 'By Cuisine'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sortedCuisines.length > 0 ? (
                    <div className="space-y-2">
                      {sortedCuisines.map(([cuisine, count]) => (
                        <div key={cuisine} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{translateField('cuisine', cuisine)}</span>
                            <span className="text-muted-foreground">{count}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div 
                              className="h-full bg-accent rounded-full transition-all"
                              style={{ width: `${(count / maxCuisineCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {language === 'de' ? 'Noch keine Daten' : 'No data yet'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="max-w-md mx-auto">
              <CardContent className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === 'de' ? 'Noch keine Statistiken' : 'No statistics yet'}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {language === 'de' 
                    ? 'Plane Gerichte in deinem Wochenkalender, um Statistiken zu sehen.'
                    : 'Plan dishes in your weekly calendar to see statistics.'}
                </p>
                <Link to="/weekly-calendar">
                  <Button>{language === 'de' ? 'Zum Wochenplaner' : 'Go to Weekly Planner'}</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}