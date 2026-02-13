import { useState, useMemo, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { filterDishesByIngredients, convertUserDishToDish, dinnerDishes, type Dish } from "@/data/dishes";
import { useIngredients } from "@/hooks/useIngredients";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search, ChefHat, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { DishPhotoRecognition } from "@/components/DishPhotoRecognition";

export default function IngredientFinder() {
  const { t, language, translateField } = useLanguage();
  const { user } = useAuth();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userDishes, setUserDishes] = useState<Dish[]>([]);
  
  const { ingredients: allIngredients } = useIngredients();
  const filteredIngredients = allIngredients.filter(ingredient => 
    ingredient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load user dishes
  useEffect(() => {
    const loadUserDishes = async () => {
      if (!user) {
        setUserDishes([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('user_dishes')
        .select('*')
        .eq('user_id', user.id);
      
      if (!error && data) {
        setUserDishes(data.map(convertUserDishToDish));
      }
    };
    
    loadUserDishes();
  }, [user?.id]);

  // Realtime subscription for user dishes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('ingredient-finder-dishes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_dishes',
          filter: `user_id=eq.${user.id}`
        },
        async () => {
          const { data, error } = await supabase
            .from('user_dishes')
            .select('*')
            .eq('user_id', user.id);
          
          if (!error && data) {
            setUserDishes(data.map(convertUserDishToDish));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const allDishes = useMemo(() => [...dinnerDishes, ...userDishes], [userDishes]);
  
  const matchingDishes = useMemo(() => {
    return filterDishesByIngredients(selectedIngredients, allDishes);
  }, [selectedIngredients, allDishes]);

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => prev.filter(i => i !== ingredient));
  };

  const clearAllIngredients = () => {
    setSelectedIngredients([]);
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
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('ingredientFinder.title')}</h1>
              <p className="text-muted-foreground mt-2">
                {t('ingredientFinder.subtitle')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Ingredient Selection */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5" />
                    {language === 'de' ? 'Zutaten auswählen' : 'Select Ingredients'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Selected Ingredients */}
                  {selectedIngredients.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-foreground">
                          {t('ingredientFinder.selected')} ({selectedIngredients.length})
                        </h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={clearAllIngredients}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {t('ingredientFinder.clear')}
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedIngredients.map(ingredient => (
                          <Badge 
                            key={ingredient} 
                            variant="default" 
                            className="flex items-center gap-1 cursor-pointer"
                            onClick={() => removeIngredient(ingredient)}
                          >
                            {translateField('ingredient', ingredient)}
                            <X className="h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('ingredientFinder.search')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Ingredient List */}
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredIngredients.map(ingredient => (
                      <div 
                        key={ingredient} 
                        className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer"
                        onClick={() => toggleIngredient(ingredient)}
                      >
                        <Checkbox 
                          checked={selectedIngredients.includes(ingredient)}
                          onChange={() => toggleIngredient(ingredient)}
                        />
                        <label className="text-sm capitalize cursor-pointer flex-1">
                          {translateField('ingredient', ingredient)}
                        </label>
                      </div>
                    ))}
                  </div>

                  {filteredIngredients.length === 0 && searchTerm && (
                    <p className="text-center text-muted-foreground py-4">
                      {language === 'de' ? `Keine Zutaten gefunden für "${searchTerm}"` : `No ingredients found for "${searchTerm}"`}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Matching Dishes */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('ingredientFinder.results')}
                    {selectedIngredients.length > 0 && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({matchingDishes.length} {language === 'de' ? 'gefunden' : 'found'})
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedIngredients.length === 0 ? (
                    <div className="text-center py-8">
                      <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {t('ingredientFinder.selectIngredients')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {matchingDishes.map(dish => (
                        <Card key={dish.id} className="border border-border">
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-2">{dish.name}</h3>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="secondary" className="text-xs">
                                {translateField('cuisine', dish.cuisine)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {translateField('difficulty', dish.difficulty)}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {translateField('cookingTime', dish.cookingTime)}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">{language === 'de' ? 'Zutaten' : 'Ingredients'}:</p>
                              <div className="flex flex-wrap gap-1">
                                {dish.tags.map((tag, index) => (
                                  <Badge 
                                    key={index} 
                                    variant={selectedIngredients.includes(tag) ? "default" : "outline"}
                                    className="text-xs"
                                  >
                                    {translateField('ingredient', tag)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {matchingDishes.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            {language === 'de' 
                              ? 'Keine Gerichte gefunden mit den ausgewählten Zutaten.'
                              : 'No dishes found with the selected ingredients.'
                            }
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {language === 'de' 
                              ? 'Versuchen Sie es mit weniger oder anderen Zutaten.'
                              : 'Try with fewer or different ingredients.'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Photo Recognition */}
              <DishPhotoRecognition userDishes={userDishes} />

              {/* Tips Card */}
              <Card className="bg-gradient-hero">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-2">{language === 'de' ? 'Tipp' : 'Tip'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'de'
                      ? 'Je weniger Zutaten Sie auswählen, desto mehr Gerichte werden angezeigt. Beginnen Sie mit den wichtigsten Zutaten, die Sie verwenden möchten.'
                      : 'The fewer ingredients you select, the more dishes will be shown. Start with the main ingredients you want to use.'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
