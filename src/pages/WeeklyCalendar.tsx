import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dinnerDishes, convertUserDishToDish, type Dish } from "@/data/dishes";
import { ArrowLeft, Calendar, Plus, X, Search, Save, LogIn, Users, BookmarkPlus, Heart, Star, RefreshCw, ChefHat, Clock, Gauge, Tag, Trash2, Printer, Shuffle, ChevronLeft, ChevronRight, RotateCcw, GripVertical, StickyNote, MessageSquare, Download, Upload } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { MealAttendance } from "@/components/MealAttendance";
type WeeklyMeals = {
  [key: string]: {
    dish: Dish | null;
    isLeftover: boolean;
    leftoverOf?: string;
    notes?: string;
  };
};

type Group = {
  id: string;
  name: string;
};

// Inline Draggable Day Card Component
interface DraggableDayCardInlineProps {
  dayKey: string;
  dayLabel: string;
  isToday: boolean;
  mealData: WeeklyMeals[string];
  profiles: { [key: string]: string };
  selectedGroupId: string | null;
  onRemoveDish: (day: string) => void;
  onShowDishSelector: (day: string | null) => void;
  onShowLeftoverSelector: (day: string | null) => void;
  onAddDishToLibrary: (dish: Dish) => void;
  isDishInLibrary: (dishName: string) => boolean;
  translateField: (type: 'cuisine' | 'difficulty' | 'cookingTime' | 'category' | 'ingredient', value: string) => string;
  language: string;
  t: (key: string) => string;
  availableLeftoversCount: number;
  isDragging: boolean;
  onEditNote: (day: string) => void;
  weekStartDate: string;
  userId: string;
}

function DraggableDayCardInline({
  dayKey,
  dayLabel,
  isToday,
  mealData,
  profiles,
  selectedGroupId,
  onRemoveDish,
  onShowDishSelector,
  onShowLeftoverSelector,
  onAddDishToLibrary,
  isDishInLibrary,
  translateField,
  language,
  t,
  availableLeftoversCount,
  isDragging,
  onEditNote,
  weekStartDate,
  userId,
}: DraggableDayCardInlineProps) {
  const { attributes, listeners, setNodeRef: setDragRef, transform } = useDraggable({
    id: dayKey,
    data: { dayKey, mealData },
    disabled: !mealData.dish,
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${dayKey}`,
    data: { dayKey },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  return (
    <div ref={setDropRef} className="relative">
      <Card
        ref={setDragRef}
        style={style}
        className={cn(
          'h-64 transition-all',
          isToday && 'ring-2 ring-primary shadow-lg shadow-primary/20',
          isDragging && 'opacity-50 scale-105',
          isOver && !isDragging && 'ring-2 ring-accent bg-accent/10',
          mealData.dish && 'cursor-grab active:cursor-grabbing'
        )}
        {...(mealData.dish ? { ...attributes, ...listeners } : {})}
      >
        <CardHeader className={cn('pb-3', isToday && 'bg-primary/10')}>
          <CardTitle className="text-sm font-medium text-center flex items-center justify-center gap-2">
            {mealData.dish && (
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            )}
            {dayLabel}
            {isToday && (
              <Badge variant="default" className="text-xs">
                {t('weeklyCalendar.today')}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 h-full">
          {mealData.dish ? (
            <div className="space-y-2">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveDish(dayKey);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className={cn(
                  'bg-accent/50 border border-border p-3 rounded-lg',
                  mealData.isLeftover && 'border-l-4 border-l-blue-400'
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-foreground line-clamp-2">
                      {mealData.dish.name}
                    </h4>
                    {mealData.isLeftover && (
                      <Badge variant="secondary" className="text-xs">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        {t('leftovers.title')}
                      </Badge>
                    )}
                  </div>
                  {mealData.isLeftover && mealData.leftoverOf && (
                    <div className="text-xs text-muted-foreground mb-2">
                      {t('leftovers.from')}: {mealData.leftoverOf}
                    </div>
                  )}
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">
                      {translateField('cuisine', mealData.dish.cuisine)}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {translateField('cookingTime', mealData.dish.cookingTime)}
                    </div>
                    {selectedGroupId && (mealData.dish as any).addedBy && (
                      <div className="text-xs text-muted-foreground">
                        {language === 'de' ? 'Hinzugefügt von' : 'Added by'}: {profiles[(mealData.dish as any).addedBy] || 'Loading...'}
                      </div>
                    )}
                    {selectedGroupId && (mealData.dish as any).isUserDish &&
                      !isDishInLibrary(mealData.dish.name) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddDishToLibrary(mealData.dish!);
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <BookmarkPlus className="h-3 w-3 mr-1" />
                          {language === 'de' ? 'Zu meiner Sammlung' : 'Add to my library'}
                        </Button>
                      )}
                  </div>
                </div>
              </div>
              
              {/* Attendance section - only for groups */}
              {selectedGroupId && userId && (
                <MealAttendance
                  groupId={selectedGroupId}
                  dayKey={dayKey}
                  weekStartDate={weekStartDate}
                  userId={userId}
                  hasMeal={!!mealData.dish}
                />
              )}
              
              {/* Notes section */}
              {mealData.notes ? (
                <button
                  className="w-full text-left p-2 rounded-md bg-muted/50 border border-dashed border-muted-foreground/30 hover:bg-muted transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditNote(dayKey);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start gap-2">
                    <StickyNote className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground line-clamp-2">{mealData.notes}</span>
                  </div>
                </button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditNote(dayKey);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <StickyNote className="h-3 w-3 mr-1" />
                  {t('weeklyCalendar.addNote')}
                </Button>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <Button
                variant="ghost"
                className="w-full h-16 border-2 border-dashed border-muted hover:border-primary hover:bg-primary/5 flex items-center justify-center gap-2"
                onClick={() => onShowDishSelector(dayKey)}
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
                onClick={() => onShowLeftoverSelector(dayKey)}
                disabled={availableLeftoversCount === 0}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {t('leftovers.add')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, 1 = next week
  const [activeDragDay, setActiveDragDay] = useState<string | null>(null);
  const [editingNoteDay, setEditingNoteDay] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );
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

  // Load meal plan when user or selected group or week changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadMealPlan();
    }
  }, [isAuthenticated, user, selectedGroupId, weekOffset]);

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

  const getWeekStartDate = (offset: number = 0) => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setDate(monday.getDate() + (offset * 7));
    return monday;
  };

  const getFormattedWeekRange = () => {
    const weekStart = getWeekStartDate(weekOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const startStr = weekStart.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    const endStr = weekEnd.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    
    return `${startStr} - ${endStr}`;
  };

  const isCurrentWeek = weekOffset === 0;

  const loadMealPlan = async () => {
    if (!user) return;
    
    const weekStart = getWeekStartDate(weekOffset);
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
              leftoverOf: mealPlan.leftover_of_dish || undefined,
              notes: mealPlan.notes || undefined
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
    // Check for duplicate dishes in the week (except leftovers)
    if (!isLeftover) {
      const duplicateDay = Object.entries(weeklyMeals).find(([dayKey, meal]) => 
        dayKey !== day && 
        meal.dish?.name === dish.name && 
        !meal.isLeftover
      );
      
      if (duplicateDay) {
        const dayTranslations: Record<string, string> = {
          monday: t('monday'),
          tuesday: t('tuesday'),
          wednesday: t('wednesday'),
          thursday: t('thursday'),
          friday: t('friday'),
          saturday: t('saturday'),
          sunday: t('sunday'),
        };
        
        toast({
          title: t('weeklyCalendar.duplicateWarning'),
          description: t('weeklyCalendar.duplicateDescription').replace('{day}', dayTranslations[duplicateDay[0]]),
          variant: "default",
          duration: 4000
        });
      }
    }
    
    setWeeklyMeals(prev => ({
      ...prev,
      [day]: { dish, isLeftover, leftoverOf, notes: prev[day]?.notes }
    }));
    setShowDishSelector(null);
    setShowLeftoverSelector(null);

    // Log activity if in group mode
    if (selectedGroupId && user) {
      try {
        const weekStart = getWeekStartDate(weekOffset);
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
        const weekStart = getWeekStartDate(weekOffset);
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
      const weekStart = getWeekStartDate(weekOffset);
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
      const weekStart = getWeekStartDate(weekOffset);
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
            leftover_of_dish: mealData.leftoverOf || null,
            notes: mealData.notes || null
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

  // Get today's day key
  const getTodayKey = () => {
    const dayIndex = new Date().getDay();
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayKeys[dayIndex];
  };

  const todayKey = getTodayKey();

  // Export week plan to print view
  const exportWeekPlan = () => {
    const weekStart = getWeekStartDate(weekOffset);
    const dateStr = weekStart.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${language === 'de' ? 'Wochenplan' : 'Weekly Plan'}</title>
        <style>
          body { 
            font-family: system-ui, -apple-system, sans-serif; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto;
            color: #333;
          }
          h1 { 
            text-align: center; 
            color: #c56b3b; 
            margin-bottom: 10px;
            font-size: 28px;
          }
          .date { 
            text-align: center; 
            color: #666; 
            margin-bottom: 30px;
            font-size: 14px;
          }
          .day { 
            display: flex; 
            align-items: center;
            padding: 16px 0; 
            border-bottom: 1px solid #e5e5e5; 
          }
          .day:last-child { border-bottom: none; }
          .day-name { 
            font-weight: 600; 
            width: 120px;
            color: #555;
          }
          .dish-name { 
            flex: 1;
            font-size: 16px;
          }
          .today { 
            background: #fff8f5; 
            margin: 0 -20px;
            padding: 16px 20px;
            border-radius: 8px;
          }
          .today .day-name { color: #c56b3b; }
          .leftover { 
            color: #3b82f6; 
            font-style: italic;
          }
          .badge {
            display: inline-block;
            background: #f0f0f0;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-left: 8px;
          }
          .no-dish { color: #999; }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>🍽️ ${language === 'de' ? 'Wochenplan' : 'Weekly Plan'}</h1>
        <div class="date">${language === 'de' ? 'Woche ab' : 'Week of'} ${dateStr}</div>
        ${daysOfWeek.map(day => {
          const meal = weeklyMeals[day.key];
          const isToday = day.key === todayKey;
          return `
            <div class="day ${isToday ? 'today' : ''}">
              <div class="day-name">${isToday ? '📍 ' : ''}${day.label}</div>
              <div class="dish-name ${!meal.dish ? 'no-dish' : ''} ${meal.isLeftover ? 'leftover' : ''}">
                ${meal.dish ? meal.dish.name : '—'}
                ${meal.isLeftover ? `<span class="badge">${t('leftovers.title')}</span>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  // Export week plan as JSON file
  const exportWeekAsJSON = () => {
    const weekStart = getWeekStartDate(weekOffset);
    const weekStartString = weekStart.toISOString().split('T')[0];
    
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      weekStartDate: weekStartString,
      groupId: selectedGroupId,
      meals: weeklyMeals
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `wochenplan-${weekStartString}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: t('weeklyCalendar.exportJSONSuccess'),
      duration: 2000
    });
  };

  // Import week plan from JSON file
  const importWeekFromJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Validate structure
        if (!data.meals || typeof data.meals !== 'object') {
          throw new Error('Invalid format');
        }
        
        // Check if there are any dishes
        const hasDishes = Object.values(data.meals).some((meal: any) => meal?.dish);
        if (!hasDishes) {
          toast({
            title: t('weeklyCalendar.importJSONEmpty'),
            variant: "destructive",
            duration: 3000
          });
          return;
        }
        
        // Validate each day entry
        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const importedMeals: WeeklyMeals = {};
        
        for (const day of validDays) {
          if (data.meals[day]) {
            const meal = data.meals[day];
            importedMeals[day] = {
              dish: meal.dish || null,
              isLeftover: meal.isLeftover || false,
              leftoverOf: meal.leftoverOf,
              notes: meal.notes
            };
          } else {
            importedMeals[day] = { dish: null, isLeftover: false };
          }
        }
        
        setWeeklyMeals(importedMeals);
        
        toast({
          title: t('weeklyCalendar.importJSONSuccess'),
          duration: 2000
        });
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: t('weeklyCalendar.importJSONError'),
          variant: "destructive",
          duration: 3000
        });
      }
    };
    
    input.click();
  };

  // Surprise me - pick random dish
  const surpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * allDishes.length);
    return allDishes[randomIndex];
  };

  // Repeat last week - copy previous week's plan to current week
  const repeatLastWeek = async () => {
    if (!user) return;
    
    const lastWeekStart = getWeekStartDate(weekOffset - 1);
    const lastWeekString = lastWeekStart.toISOString().split('T')[0];
    
    try {
      let query = supabase
        .from('meal_plans')
        .select('*')
        .eq('week_start_date', lastWeekString);

      if (selectedGroupId) {
        query = query.eq('group_id', selectedGroupId);
      } else {
        query = query.eq('user_id', user.id).is('group_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: language === 'de' ? 'Keine Daten' : 'No data',
          description: language === 'de' 
            ? 'Die Vorwoche hat keine geplanten Gerichte.'
            : 'The previous week has no planned dishes.',
          variant: "destructive"
        });
        return;
      }

      // Apply previous week's meals to current state
      const loadedMeals: WeeklyMeals = {
        monday: { dish: null, isLeftover: false },
        tuesday: { dish: null, isLeftover: false },
        wednesday: { dish: null, isLeftover: false },
        thursday: { dish: null, isLeftover: false },
        friday: { dish: null, isLeftover: false },
        saturday: { dish: null, isLeftover: false },
        sunday: { dish: null, isLeftover: false }
      };

      data.forEach(mealPlan => {
        let dish = dinnerDishes.find(d => d.name === mealPlan.dish_name);
        
        if (!dish && mealPlan.user_dish_id) {
          dish = allDishes.find(d => d.id === mealPlan.user_dish_id);
        }
        
        if (dish) {
          loadedMeals[mealPlan.day_of_week as keyof WeeklyMeals] = {
            dish,
            isLeftover: mealPlan.is_leftover || false,
            leftoverOf: mealPlan.leftover_of_dish || undefined,
            notes: mealPlan.notes || undefined
          };
        }
      });

      setWeeklyMeals(loadedMeals);
      
      toast({
        title: language === 'de' ? 'Vorwoche übernommen!' : 'Previous week copied!',
        description: language === 'de' 
          ? 'Die Gerichte der Vorwoche wurden geladen. Speichern nicht vergessen!'
          : 'Dishes from last week have been loaded. Don\'t forget to save!'
      });
    } catch (error) {
      console.error('Error copying last week:', error);
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: language === 'de'
          ? 'Die Vorwoche konnte nicht geladen werden.'
          : 'Failed to load previous week.',
        variant: "destructive"
      });
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const dayKey = event.active.id as string;
    setActiveDragDay(dayKey);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragDay(null);

    if (!over || active.id === over.id) return;

    const sourceDayKey = active.id as string;
    const targetDayKey = (over.id as string).replace('drop-', '');

    // Skip if same day or source has no dish
    if (sourceDayKey === targetDayKey || !weeklyMeals[sourceDayKey]?.dish) return;

    // Swap the meals between the two days
    setWeeklyMeals(prev => {
      const sourceMeal = prev[sourceDayKey];
      const targetMeal = prev[targetDayKey];

      return {
        ...prev,
        [sourceDayKey]: targetMeal,
        [targetDayKey]: sourceMeal,
      };
    });

    toast({
      title: language === 'de' ? 'Gerichte getauscht!' : 'Dishes swapped!',
      description: language === 'de'
        ? `${daysOfWeek.find(d => d.key === sourceDayKey)?.label} ↔ ${daysOfWeek.find(d => d.key === targetDayKey)?.label}`
        : `${daysOfWeek.find(d => d.key === sourceDayKey)?.label} ↔ ${daysOfWeek.find(d => d.key === targetDayKey)?.label}`
    });
  };

  const handleDragCancel = () => {
    setActiveDragDay(null);
  };

  // Notes handlers
  const openNoteEditor = (day: string) => {
    setEditingNoteDay(day);
    setNoteText(weeklyMeals[day]?.notes || '');
  };

  const saveNote = () => {
    if (!editingNoteDay) return;
    
    setWeeklyMeals(prev => ({
      ...prev,
      [editingNoteDay]: {
        ...prev[editingNoteDay],
        notes: noteText.trim() || undefined
      }
    }));
    
    toast({
      title: t('weeklyCalendar.noteSaved'),
    });
    
    setEditingNoteDay(null);
    setNoteText('');
  };

  const clearNote = () => {
    if (!editingNoteDay) return;
    
    setWeeklyMeals(prev => ({
      ...prev,
      [editingNoteDay]: {
        ...prev[editingNoteDay],
        notes: undefined
      }
    }));
    
    setEditingNoteDay(null);
    setNoteText('');
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
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('weeklyCalendar.title')}</h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  {t('weeklyCalendar.subtitle')}
                </p>
              </div>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWeekOffset(weekOffset - 1)}
                aria-label={language === 'de' ? 'Vorherige Woche' : 'Previous week'}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">
                  {getFormattedWeekRange()}
                </span>
                {!isCurrentWeek && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWeekOffset(0)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <RotateCcw className="h-3 w-3" />
                    {t('weeklyCalendar.today')}
                  </Button>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWeekOffset(weekOffset + 1)}
                aria-label={language === 'de' ? 'Nächste Woche' : 'Next week'}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" onClick={repeatLastWeek} size="sm" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <span className="hidden sm:inline">{language === 'de' ? 'Vorwoche wiederholen' : 'Repeat last week'}</span>
                    <span className="sm:hidden">{language === 'de' ? 'Vorige' : 'Repeat'}</span>
                  </Button>
                  <Button variant="outline" onClick={exportWeekPlan} size="sm" className="flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('weeklyCalendar.print')}</span>
                  </Button>
                  <Button variant="outline" onClick={exportWeekAsJSON} size="sm" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span className="hidden lg:inline">{t('weeklyCalendar.exportJSON')}</span>
                    <span className="hidden sm:inline lg:hidden">JSON</span>
                  </Button>
                  <Button variant="outline" onClick={importWeekFromJSON} size="sm" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span className="hidden lg:inline">{t('weeklyCalendar.importJSON')}</span>
                  </Button>
                  <Button variant="outline" onClick={clearWeek} size="sm">
                    <Trash2 className="h-4 w-4 sm:hidden" />
                    <span className="hidden sm:inline">{t('weeklyCalendar.clear')}</span>
                  </Button>
                  <Button onClick={saveMealPlan} size="sm" className="flex items-center gap-2 ml-auto" disabled={saving}>
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">{saving ? (language === 'de' ? "Wird gespeichert..." : "Saving...") : t('weeklyCalendar.save')}</span>
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate('/auth')} size="sm" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">{language === 'de' ? 'Anmelden zum Speichern' : 'Login to Save'}</span>
                  <span className="sm:hidden">{language === 'de' ? 'Anmelden' : 'Login'}</span>
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

          {/* Weekly Calendar Grid with Drag & Drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {daysOfWeek.map(day => {
                const isToday = isCurrentWeek && day.key === todayKey;
                const mealData = weeklyMeals[day.key];
                return (
                  <DraggableDayCardInline
                    key={day.key}
                    dayKey={day.key}
                    dayLabel={day.label}
                    isToday={isToday}
                    mealData={mealData}
                    profiles={profiles}
                    selectedGroupId={selectedGroupId}
                    onRemoveDish={removeDishFromDay}
                    onShowDishSelector={setShowDishSelector}
                    onShowLeftoverSelector={setShowLeftoverSelector}
                    onAddDishToLibrary={addDishToLibrary}
                    isDishInLibrary={isDishInLibrary}
                    translateField={translateField}
                    language={language}
                    t={t}
                    availableLeftoversCount={availableLeftovers.length}
                    isDragging={activeDragDay === day.key}
                    onEditNote={openNoteEditor}
                    weekStartDate={getWeekStartDate(weekOffset).toISOString().split('T')[0]}
                    userId={user?.id || ''}
                  />
                );
              })}
            </div>
            
            {/* Drag Overlay */}
            <DragOverlay>
              {activeDragDay && weeklyMeals[activeDragDay]?.dish && (
                <Card className="h-64 opacity-90 shadow-2xl rotate-3 border-2 border-primary">
                  <CardHeader className="pb-3 bg-primary/10">
                    <CardTitle className="text-sm font-medium text-center">
                      {daysOfWeek.find(d => d.key === activeDragDay)?.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="bg-accent/50 border border-border p-3 rounded-lg">
                      <h4 className="font-medium text-sm text-foreground line-clamp-2">
                        {weeklyMeals[activeDragDay].dish!.name}
                      </h4>
                      <Badge variant="secondary" className="text-xs mt-2">
                        {translateField('cuisine', weeklyMeals[activeDragDay].dish!.cuisine)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </DragOverlay>
          </DndContext>

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
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={language === 'de' ? 'Gerichte suchen...' : 'Search dishes...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue placeholder={language === 'de' ? 'Küche' : 'Cuisine'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{language === 'de' ? 'Küche' : 'Cuisine'}</SelectItem>
                          {cuisines.map(cuisine => (
                            <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => {
                          const randomDish = surpriseMe();
                          if (randomDish && showDishSelector) {
                            assignDishToDay(showDishSelector, randomDish);
                          }
                        }}
                        className="shrink-0 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 hover:border-primary/50"
                        title={language === 'de' ? 'Überrasch mich!' : 'Surprise me!'}
                      >
                        <Shuffle className="h-4 w-4" />
                      </Button>
                    </div>
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

      {/* Note Editor Modal */}
      {editingNoteDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <StickyNote className="h-5 w-5 text-primary" />
                  {weeklyMeals[editingNoteDay]?.notes 
                    ? t('weeklyCalendar.editNote')
                    : t('weeklyCalendar.addNote')
                  } - {daysOfWeek.find(d => d.key === editingNoteDay)?.label}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingNoteDay(null);
                    setNoteText('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={t('weeklyCalendar.notePlaceholder')}
                className="min-h-[100px] resize-none"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                {weeklyMeals[editingNoteDay]?.notes && (
                  <Button variant="outline" onClick={clearNote} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t('common.delete')}
                  </Button>
                )}
                <Button variant="outline" onClick={() => {
                  setEditingNoteDay(null);
                  setNoteText('');
                }}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={saveNote}>
                  <Save className="h-4 w-4 mr-1" />
                  {t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
