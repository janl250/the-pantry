import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wand2, Plus, X, Clock, ChefHat, Sparkles, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DishSuggestion {
  name: string;
  description: string;
  cookingTime: string;
  difficulty: string;
  cuisine: string;
  category: string;
}

export default function RecipeGenerator() {
  const { language } = useLanguage();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [dish, setDish] = useState<DishSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addIngredient = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setInputValue("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  const generateDish = async () => {
    if (ingredients.length === 0) {
      toast.error(language === 'de' ? 'Bitte füge mindestens eine Zutat hinzu' : 'Please add at least one ingredient');
      return;
    }

    setLoading(true);
    setError(null);
    setDish(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('recipe-generator', {
        body: { ingredients, language }
      });

      if (funcError) {
        throw new Error(funcError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setDish(data.dish);
      toast.success(language === 'de' ? 'Gericht gefunden!' : 'Dish found!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to find dish';
      setError(message);
      toast.error(language === 'de' ? 'Fehler beim Suchen' : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const lower = difficulty.toLowerCase();
    if (lower.includes('einfach') || lower.includes('easy')) return 'bg-green-500/10 text-green-600 border-green-500/20';
    if (lower.includes('mittel') || lower.includes('medium')) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    return 'bg-red-500/10 text-red-600 border-red-500/20';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
              <Wand2 className="h-8 w-8 text-primary" />
              {language === 'de' ? 'Gericht-Finder' : 'Dish Finder'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === 'de' 
                ? 'Gib deine Zutaten ein und entdecke passende Gerichte' 
                : 'Enter your ingredients and discover matching dishes'}
            </p>
          </div>

          <div className="space-y-6">
            {/* Ingredients Input */}
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
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={language === 'de' ? 'Zutat eingeben...' : 'Enter ingredient...'}
                    disabled={loading}
                  />
                  <Button onClick={addIngredient} size="icon" variant="secondary" disabled={loading}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {ingredients.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ingredient) => (
                      <Badge 
                        key={ingredient} 
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        {ingredient}
                        <button 
                          onClick={() => removeIngredient(ingredient)}
                          className="ml-1 hover:text-destructive"
                          disabled={loading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    {language === 'de' 
                      ? 'Füge 2-5 Hauptzutaten hinzu' 
                      : 'Add 2-5 main ingredients'}
                  </p>
                )}

                <Button 
                  onClick={generateDish} 
                  className="w-full gap-2"
                  disabled={loading || ingredients.length === 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {language === 'de' ? 'Suche...' : 'Searching...'}
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      {language === 'de' ? 'Gericht finden' : 'Find Dish'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Dish Result */}
            {loading && (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
                    <p>{language === 'de' ? 'KI sucht passende Gerichte...' : 'AI is finding matching dishes...'}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && !loading && (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center text-destructive">
                    <AlertCircle className="h-12 w-12 mb-4" />
                    <p className="text-center mb-4">{error}</p>
                    <Button variant="outline" onClick={generateDish}>
                      {language === 'de' ? 'Erneut versuchen' : 'Try Again'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {dish && !loading && (
              <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-primary" />
                    {language === 'de' ? 'Unser Vorschlag' : 'Our Suggestion'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{dish.name}</h3>
                    <p className="text-muted-foreground mt-2">{dish.description}</p>
                  </div>

                  <Separator />

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {dish.cookingTime}
                    </Badge>
                    <Badge variant="outline" className={getDifficultyColor(dish.difficulty)}>
                      {dish.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {dish.cuisine}
                    </Badge>
                    <Badge variant="secondary">
                      {dish.category}
                    </Badge>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full gap-2 mt-4"
                    onClick={generateDish}
                  >
                    <RefreshCw className="h-4 w-4" />
                    {language === 'de' ? 'Andere Idee' : 'Another Idea'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
