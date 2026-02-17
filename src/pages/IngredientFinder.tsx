import { useState, useMemo, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { filterDishesByIngredients, convertUserDishToDish, dinnerDishes, type Dish } from "@/data/dishes";
import { useIngredients } from "@/hooks/useIngredients";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search, ChefHat, X, Wand2, Plus, Clock, Sparkles, Loader2, AlertCircle, RefreshCw, BookmarkPlus, Check, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { DishPhotoRecognition } from "@/components/DishPhotoRecognition";
import { toast } from "sonner";

interface DishSuggestion {
  name: string;
  description: string;
  cookingTime: string;
  difficulty: string;
  cuisine: string;
  category: string;
}

export default function IngredientFinder() {
  const { t, language, translateField } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userDishes, setUserDishes] = useState<Dish[]>([]);
  
  // AI Generator state
  const [aiIngredients, setAiIngredients] = useState<string[]>([]);
  const [aiInputValue, setAiInputValue] = useState("");
  const [aiDish, setAiDish] = useState<DishSuggestion | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [previousDishes, setPreviousDishes] = useState<string[]>([]);
  const [addedToLibrary, setAddedToLibrary] = useState(false);
  const [addingToLibrary, setAddingToLibrary] = useState(false);

  const { ingredients: allIngredients } = useIngredients();
  const filteredIngredients = allIngredients.filter(ingredient => 
    ingredient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load user dishes
  useEffect(() => {
    const loadUserDishes = async () => {
      if (!user) { setUserDishes([]); return; }
      const { data, error } = await supabase.from('user_dishes').select('*').eq('user_id', user.id);
      if (!error && data) setUserDishes(data.map(convertUserDishToDish));
    };
    loadUserDishes();
  }, [user?.id]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('ingredient-finder-dishes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_dishes', filter: `user_id=eq.${user.id}` }, async () => {
        const { data, error } = await supabase.from('user_dishes').select('*').eq('user_id', user.id);
        if (!error && data) setUserDishes(data.map(convertUserDishToDish));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const allDishes = useMemo(() => [...dinnerDishes, ...userDishes], [userDishes]);
  const matchingDishes = useMemo(() => filterDishesByIngredients(selectedIngredients, allDishes), [selectedIngredients, allDishes]);

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => prev.includes(ingredient) ? prev.filter(i => i !== ingredient) : [...prev, ingredient]);
  };
  const removeIngredient = (ingredient: string) => setSelectedIngredients(prev => prev.filter(i => i !== ingredient));
  const clearAllIngredients = () => setSelectedIngredients([]);

  // AI Generator functions
  const addAiIngredient = () => {
    const trimmed = aiInputValue.trim();
    if (trimmed && !aiIngredients.includes(trimmed)) {
      setAiIngredients([...aiIngredients, trimmed]);
      setAiInputValue("");
    }
  };

  const generateDish = async (excludePrevious: boolean = false) => {
    if (aiIngredients.length === 0) {
      toast.error(language === 'de' ? 'Bitte füge mindestens eine Zutat hinzu' : 'Please add at least one ingredient');
      return;
    }
    setAiLoading(true); setAiError(null); setAiDish(null); setAddedToLibrary(false);
    try {
      const excludeList = excludePrevious ? previousDishes : [];
      const { data, error: funcError } = await supabase.functions.invoke('recipe-generator', {
        body: { ingredients: aiIngredients, language, excludeDishes: excludeList }
      });
      if (funcError) throw new Error(funcError.message);
      if (data.error) throw new Error(data.error);
      setAiDish(data.dish);
      if (data.dish?.name) setPreviousDishes(prev => [...prev, data.dish.name]);
      toast.success(language === 'de' ? 'Gericht gefunden!' : 'Dish found!');
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to find dish');
      toast.error(language === 'de' ? 'Fehler beim Suchen' : 'Search failed');
    } finally { setAiLoading(false); }
  };

  const addToLibrary = async () => {
    if (!aiDish || !user) return;
    setAddingToLibrary(true);
    try {
      const { error } = await supabase.from('user_dishes').insert({
        user_id: user.id, name: aiDish.name, tags: [],
        cooking_time: aiDish.cookingTime, difficulty: aiDish.difficulty,
        cuisine: aiDish.cuisine, category: aiDish.category
      });
      if (error) throw error;
      setAddedToLibrary(true);
      toast.success(language === 'de' ? 'Zur Sammlung hinzugefügt!' : 'Added to your collection!');
    } catch { toast.error(language === 'de' ? 'Fehler beim Hinzufügen' : 'Failed to add dish'); }
    finally { setAddingToLibrary(false); }
  };

  const getDifficultyColor = (difficulty: string) => {
    const lower = difficulty.toLowerCase();
    if (lower.includes('einfach') || lower.includes('easy')) return 'bg-green-500/10 text-green-600 border-green-500/20';
    if (lower.includes('mittel') || lower.includes('medium')) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    return 'bg-red-500/10 text-red-600 border-red-500/20';
  };

  const reloadUserDishes = () => {
    if (user) {
      supabase.from('user_dishes').select('*').eq('user_id', user.id)
        .then(({ data, error }) => { if (!error && data) setUserDishes(data.map(convertUserDishToDish)); });
    }
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
              <h1 className="text-3xl font-bold text-foreground">
                {language === 'de' ? 'Gerichte-Finder' : 'Dish Finder'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {language === 'de' 
                  ? 'Finde Gerichte per Zutaten, KI-Vorschläge oder Foto-Erkennung' 
                  : 'Find dishes by ingredients, AI suggestions or photo recognition'}
              </p>
            </div>
          </div>

          <Tabs defaultValue="ingredients" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ingredients" className="gap-1.5">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'de' ? 'Zutaten-Suche' : 'Ingredient Search'}</span>
                <span className="sm:hidden">{language === 'de' ? 'Zutaten' : 'Ingredients'}</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-1.5">
                <Wand2 className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'de' ? 'KI-Vorschläge' : 'AI Suggestions'}</span>
                <span className="sm:hidden">KI</span>
              </TabsTrigger>
              <TabsTrigger value="photo" className="gap-1.5">
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'de' ? 'Foto-Erkennung' : 'Photo Recognition'}</span>
                <span className="sm:hidden">{language === 'de' ? 'Foto' : 'Photo'}</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Ingredient Search */}
            <TabsContent value="ingredients">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChefHat className="h-5 w-5" />
                      {language === 'de' ? 'Zutaten auswählen' : 'Select Ingredients'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedIngredients.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-foreground">
                            {t('ingredientFinder.selected')} ({selectedIngredients.length})
                          </h3>
                          <Button variant="ghost" size="sm" onClick={clearAllIngredients} className="text-muted-foreground hover:text-foreground">
                            {t('ingredientFinder.clear')}
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedIngredients.map(ingredient => (
                            <Badge key={ingredient} variant="default" className="flex items-center gap-1 cursor-pointer" onClick={() => removeIngredient(ingredient)}>
                              {translateField('ingredient', ingredient)}
                              <X className="h-3 w-3" />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder={t('ingredientFinder.search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                    </div>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {filteredIngredients.map(ingredient => (
                        <div key={ingredient} className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer" onClick={() => toggleIngredient(ingredient)}>
                          <Checkbox checked={selectedIngredients.includes(ingredient)} onChange={() => toggleIngredient(ingredient)} />
                          <label className="text-sm capitalize cursor-pointer flex-1">{translateField('ingredient', ingredient)}</label>
                        </div>
                      ))}
                      {filteredIngredients.length === 0 && searchTerm && (
                        <p className="text-center text-muted-foreground py-4">
                          {language === 'de' ? `Keine Zutaten gefunden für "${searchTerm}"` : `No ingredients found for "${searchTerm}"`}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t('ingredientFinder.results')}
                      {selectedIngredients.length > 0 && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">({matchingDishes.length} {language === 'de' ? 'gefunden' : 'found'})</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedIngredients.length === 0 ? (
                      <div className="text-center py-8">
                        <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">{t('ingredientFinder.selectIngredients')}</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {matchingDishes.map(dish => (
                          <Card key={dish.id} className="border border-border">
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-foreground mb-2">{dish.name}</h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="secondary" className="text-xs">{translateField('cuisine', dish.cuisine)}</Badge>
                                <Badge variant="outline" className="text-xs">{translateField('difficulty', dish.difficulty)}</Badge>
                                <Badge variant="outline" className="text-xs capitalize">{translateField('cookingTime', dish.cookingTime)}</Badge>
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">{language === 'de' ? 'Zutaten' : 'Ingredients'}:</p>
                                <div className="flex flex-wrap gap-1">
                                  {dish.tags.map((tag, index) => (
                                    <Badge key={index} variant={selectedIngredients.includes(tag) ? "default" : "outline"} className="text-xs">
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
                            <p className="text-muted-foreground">{language === 'de' ? 'Keine Gerichte gefunden mit den ausgewählten Zutaten.' : 'No dishes found with the selected ingredients.'}</p>
                            <p className="text-sm text-muted-foreground mt-2">{language === 'de' ? 'Versuchen Sie es mit weniger oder anderen Zutaten.' : 'Try with fewer or different ingredients.'}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab 2: AI Suggestions */}
            <TabsContent value="ai">
              <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      {language === 'de' ? 'Deine Zutaten' : 'Your Ingredients'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={aiInputValue}
                        onChange={(e) => setAiInputValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAiIngredient(); } }}
                        placeholder={language === 'de' ? 'Zutat eingeben...' : 'Enter ingredient...'}
                        disabled={aiLoading}
                      />
                      <Button onClick={addAiIngredient} size="icon" variant="secondary" disabled={aiLoading}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {aiIngredients.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {aiIngredients.map((ingredient) => (
                          <Badge key={ingredient} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                            {ingredient}
                            <button onClick={() => setAiIngredients(aiIngredients.filter(i => i !== ingredient))} className="ml-1 hover:text-destructive" disabled={aiLoading}>
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        {language === 'de' ? 'Füge 2-5 Hauptzutaten hinzu' : 'Add 2-5 main ingredients'}
                      </p>
                    )}
                    <Button onClick={() => { setPreviousDishes([]); generateDish(false); }} className="w-full gap-2" disabled={aiLoading || aiIngredients.length === 0}>
                      {aiLoading ? (<><Loader2 className="h-4 w-4 animate-spin" />{language === 'de' ? 'Suche...' : 'Searching...'}</>) : (<><Wand2 className="h-4 w-4" />{language === 'de' ? 'Gericht finden' : 'Find Dish'}</>)}
                    </Button>
                  </CardContent>
                </Card>

                {aiLoading && (
                  <Card>
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
                        <p>{language === 'de' ? 'KI sucht passende Gerichte...' : 'AI is finding matching dishes...'}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {aiError && !aiLoading && (
                  <Card>
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center justify-center text-destructive">
                        <AlertCircle className="h-12 w-12 mb-4" />
                        <p className="text-center mb-4">{aiError}</p>
                        <Button variant="outline" onClick={() => generateDish()}>{language === 'de' ? 'Erneut versuchen' : 'Try Again'}</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {aiDish && !aiLoading && (
                  <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ChefHat className="h-5 w-5 text-primary" />
                        {language === 'de' ? 'Unser Vorschlag' : 'Our Suggestion'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">{aiDish.name}</h3>
                        <p className="text-muted-foreground mt-2">{aiDish.description}</p>
                      </div>
                      <Separator />
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />{aiDish.cookingTime}</Badge>
                        <Badge variant="outline" className={getDifficultyColor(aiDish.difficulty)}>{aiDish.difficulty}</Badge>
                        <Badge variant="outline">{aiDish.cuisine}</Badge>
                        <Badge variant="secondary">{aiDish.category}</Badge>
                      </div>
                      <div className="flex flex-col gap-2 mt-4">
                        {isAuthenticated && (
                          <Button variant={addedToLibrary ? "secondary" : "default"} className="w-full gap-2" onClick={addToLibrary} disabled={addingToLibrary || addedToLibrary}>
                            {addedToLibrary ? (<><Check className="h-4 w-4" />{language === 'de' ? 'Hinzugefügt!' : 'Added!'}</>) : addingToLibrary ? (<><Loader2 className="h-4 w-4 animate-spin" />{language === 'de' ? 'Wird hinzugefügt...' : 'Adding...'}</>) : (<><BookmarkPlus className="h-4 w-4" />{language === 'de' ? 'Zur Sammlung hinzufügen' : 'Add to Collection'}</>)}
                          </Button>
                        )}
                        <Button variant="outline" className="w-full gap-2" onClick={() => generateDish(true)} disabled={aiLoading}>
                          <RefreshCw className="h-4 w-4" />{language === 'de' ? 'Andere Idee' : 'Another Idea'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Tab 3: Photo Recognition */}
            <TabsContent value="photo">
              <div className="max-w-2xl mx-auto">
                <DishPhotoRecognition userDishes={userDishes} onDishAdded={reloadUserDishes} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
