import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wand2, Plus, X, Clock, ChefHat, Users, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Recipe {
  name: string;
  description: string;
  cookingTime: string;
  difficulty: string;
  servings: string;
  ingredients: string[];
  instructions: string[];
}

export default function RecipeGenerator() {
  const { language } = useLanguage();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
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

  const generateRecipe = async () => {
    if (ingredients.length === 0) {
      toast.error(language === 'de' ? 'Bitte füge mindestens eine Zutat hinzu' : 'Please add at least one ingredient');
      return;
    }

    setLoading(true);
    setError(null);
    setRecipe(null);

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

      setRecipe(data.recipe);
      toast.success(language === 'de' ? 'Rezept generiert!' : 'Recipe generated!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate recipe';
      setError(message);
      toast.error(language === 'de' ? 'Fehler beim Generieren' : 'Generation failed');
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
              <Wand2 className="h-8 w-8 text-primary" />
              {language === 'de' ? 'Rezept-Generator' : 'Recipe Generator'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === 'de' 
                ? 'Gib deine verfügbaren Zutaten ein und lass dir ein Rezept erstellen' 
                : 'Enter your available ingredients and get a recipe suggestion'}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
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
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {language === 'de' 
                      ? 'Noch keine Zutaten hinzugefügt' 
                      : 'No ingredients added yet'}
                  </p>
                )}

                <Separator />

                <Button 
                  onClick={generateRecipe} 
                  className="w-full gap-2"
                  disabled={loading || ingredients.length === 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {language === 'de' ? 'Generiere...' : 'Generating...'}
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      {language === 'de' ? 'Rezept generieren' : 'Generate Recipe'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recipe Result */}
            <Card className="md:row-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  {language === 'de' ? 'Dein Rezept' : 'Your Recipe'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
                    <p>{language === 'de' ? 'KI zaubert dein Rezept...' : 'AI is cooking up your recipe...'}</p>
                  </div>
                )}

                {error && !loading && (
                  <div className="flex flex-col items-center justify-center py-12 text-destructive">
                    <AlertCircle className="h-12 w-12 mb-4" />
                    <p className="text-center">{error}</p>
                    <Button variant="outline" className="mt-4" onClick={generateRecipe}>
                      {language === 'de' ? 'Erneut versuchen' : 'Try Again'}
                    </Button>
                  </div>
                )}

                {!loading && !error && !recipe && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Wand2 className="h-12 w-12 mb-4 opacity-30" />
                    <p className="text-center">
                      {language === 'de' 
                        ? 'Füge Zutaten hinzu und klicke auf "Rezept generieren"' 
                        : 'Add ingredients and click "Generate Recipe"'}
                    </p>
                  </div>
                )}

                {recipe && !loading && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{recipe.name}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{recipe.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {recipe.cookingTime}
                      </Badge>
                      <Badge variant="outline" className={getDifficultyColor(recipe.difficulty)}>
                        {recipe.difficulty}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {recipe.servings}
                      </Badge>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2">
                        {language === 'de' ? 'Zutaten' : 'Ingredients'}
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {recipe.ingredients.map((ing, idx) => (
                          <li key={idx} className="text-muted-foreground">{ing}</li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2">
                        {language === 'de' ? 'Zubereitung' : 'Instructions'}
                      </h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        {recipe.instructions.map((step, idx) => (
                          <li key={idx} className="text-muted-foreground">{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'de' ? 'Tipps' : 'Tips'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    {language === 'de' 
                      ? 'Gib 3-6 Hauptzutaten ein für beste Ergebnisse'
                      : 'Enter 3-6 main ingredients for best results'}
                  </li>
                  <li>
                    {language === 'de'
                      ? 'Grundzutaten wie Salz, Öl werden automatisch ergänzt'
                      : 'Basic ingredients like salt, oil are added automatically'}
                  </li>
                  <li>
                    {language === 'de'
                      ? 'Generiere mehrmals für verschiedene Ideen'
                      : 'Generate multiple times for different ideas'}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
