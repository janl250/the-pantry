import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sparkles, Loader2, RefreshCw, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { type Dish } from "@/data/dishes";

interface WeeklyPlanGeneratorProps {
  availableDishes: Dish[];
  onPlanGenerated: (plan: { [day: string]: Dish }) => void;
}

const CUISINE_OPTIONS = [
  'Italian', 'German', 'Japanese', 'Thai', 'Chinese', 'Indian',
  'French', 'American', 'Mexican', 'Greek', 'Spanish', 'Korean',
  'Vietnamese', 'Mediterranean', 'Turkish', 'Swiss'
];

const DIETARY_OPTIONS_DE = [
  { value: 'vegetarian', label: 'Vegetarisch' },
  { value: 'no-pork', label: 'Kein Schweinefleisch' },
  { value: 'no-seafood', label: 'Keine Meeresfrüchte' },
  { value: 'light', label: 'Leichte Küche' },
];

const DIETARY_OPTIONS_EN = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'no-pork', label: 'No Pork' },
  { value: 'no-seafood', label: 'No Seafood' },
  { value: 'light', label: 'Light Meals' },
];

export function WeeklyPlanGenerator({ availableDishes, onPlanGenerated }: WeeklyPlanGeneratorProps) {
  const { toast } = useToast();
  const { language, translateField } = useLanguage();

  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<{ [day: string]: string } | null>(null);
  const [regeneratingDay, setRegeneratingDay] = useState<string | null>(null);

  // Preferences
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [maxDifficulty, setMaxDifficulty] = useState<string>('hard');
  const [maxCookingTime, setMaxCookingTime] = useState<string>('long');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);

  const dietaryOptions = language === 'de' ? DIETARY_OPTIONS_DE : DIETARY_OPTIONS_EN;

  const daysOfWeek = [
    { key: 'monday', label: language === 'de' ? 'Montag' : 'Monday' },
    { key: 'tuesday', label: language === 'de' ? 'Dienstag' : 'Tuesday' },
    { key: 'wednesday', label: language === 'de' ? 'Mittwoch' : 'Wednesday' },
    { key: 'thursday', label: language === 'de' ? 'Donnerstag' : 'Thursday' },
    { key: 'friday', label: language === 'de' ? 'Freitag' : 'Friday' },
    { key: 'saturday', label: language === 'de' ? 'Samstag' : 'Saturday' },
    { key: 'sunday', label: language === 'de' ? 'Sonntag' : 'Sunday' },
  ];

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines(prev =>
      prev.includes(cuisine) ? prev.filter(c => c !== cuisine) : [...prev, cuisine]
    );
  };

  const toggleDietary = (value: string) => {
    setDietaryPreferences(prev =>
      prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value]
    );
  };

  const generatePlan = async (regenerateDay: string | null = null) => {
    if (regenerateDay) {
      setRegeneratingDay(regenerateDay);
    } else {
      setIsGenerating(true);
    }

    try {
      // Filter dishes based on preferences
      let filteredDishes = [...availableDishes];

      if (maxDifficulty === 'easy') {
        filteredDishes = filteredDishes.filter(d => d.difficulty === 'easy');
      } else if (maxDifficulty === 'medium') {
        filteredDishes = filteredDishes.filter(d => d.difficulty !== 'hard');
      }

      if (maxCookingTime === 'quick') {
        filteredDishes = filteredDishes.filter(d => d.cookingTime === 'quick');
      } else if (maxCookingTime === 'medium') {
        filteredDishes = filteredDishes.filter(d => d.cookingTime !== 'long');
      }

      if (selectedCuisines.length > 0) {
        filteredDishes = filteredDishes.filter(d =>
          selectedCuisines.includes(d.cuisine)
        );
      }

      if (filteredDishes.length < 7) {
        toast({
          title: language === 'de' ? 'Zu wenige Gerichte' : 'Too few dishes',
          description: language === 'de'
            ? 'Mit den aktuellen Filtern gibt es nicht genug Gerichte. Passe die Präferenzen an.'
            : 'Not enough dishes with current filters. Adjust preferences.',
          variant: 'destructive',
        });
        setIsGenerating(false);
        setRegeneratingDay(null);
        return;
      }

      const dishData = filteredDishes.map(d => ({
        name: d.name,
        cuisine: d.cuisine,
        difficulty: d.difficulty,
        cookingTime: d.cookingTime,
        category: d.category,
        tags: d.tags,
      }));

      const { data, error } = await supabase.functions.invoke('weekly-plan-generator', {
        body: {
          language,
          availableDishes: dishData,
          preferences: {
            cuisines: selectedCuisines,
            maxDifficulty,
            maxCookingTime,
            dietaryPreferences,
          },
          regenerateDay,
          currentPlan: generatedPlan,
        }
      });

      if (error) throw error;

      if (data?.plan) {
        if (regenerateDay) {
          setGeneratedPlan(prev => ({ ...prev!, [regenerateDay]: data.plan[regenerateDay] }));
        } else {
          setGeneratedPlan(data.plan);
        }
      }
    } catch (error: any) {
      console.error('Error generating plan:', error);
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: error.message || (language === 'de' ? 'Plan konnte nicht erstellt werden' : 'Could not generate plan'),
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setRegeneratingDay(null);
    }
  };

  const applyPlan = () => {
    if (!generatedPlan) return;

    const planWithDishes: { [day: string]: Dish } = {};
    for (const [day, dishName] of Object.entries(generatedPlan)) {
      const dish = availableDishes.find(d => d.name === dishName);
      if (dish) {
        planWithDishes[day] = dish;
      }
    }

    onPlanGenerated(planWithDishes);
    toast({
      title: language === 'de' ? 'Plan übernommen!' : 'Plan applied!',
      description: language === 'de' ? 'Der generierte Plan wurde in den Wochenkalender übertragen.' : 'The generated plan has been applied to the weekly calendar.',
    });
  };

  const getDishForDay = (dayKey: string): Dish | undefined => {
    if (!generatedPlan || !generatedPlan[dayKey]) return undefined;
    return availableDishes.find(d => d.name === generatedPlan[dayKey]);
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-primary/20">
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {language === 'de' ? 'KI-Wochenplan-Generator' : 'AI Weekly Plan Generator'}
              </span>
              {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
        <CardContent className="space-y-4">
        {/* Preferences Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between"
          onClick={() => setShowPreferences(!showPreferences)}
        >
          <span className="text-sm">
            {language === 'de' ? 'Präferenzen' : 'Preferences'}
            {(selectedCuisines.length > 0 || dietaryPreferences.length > 0 || maxDifficulty !== 'hard' || maxCookingTime !== 'long') && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {language === 'de' ? 'Aktiv' : 'Active'}
              </Badge>
            )}
          </span>
          {showPreferences ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {showPreferences && (
          <div className="space-y-4 p-3 bg-muted/50 rounded-lg">
            {/* Cuisines */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === 'de' ? 'Bevorzugte Küchen' : 'Preferred Cuisines'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CUISINE_OPTIONS.map(cuisine => (
                  <Badge
                    key={cuisine}
                    variant={selectedCuisines.includes(cuisine) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleCuisine(cuisine)}
                  >
                    {translateField('cuisine', cuisine)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Max Difficulty */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === 'de' ? 'Maximale Schwierigkeit' : 'Max Difficulty'}
              </label>
              <Select value={maxDifficulty} onValueChange={setMaxDifficulty}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">{translateField('difficulty', 'easy')}</SelectItem>
                  <SelectItem value="medium">{translateField('difficulty', 'medium')}</SelectItem>
                  <SelectItem value="hard">{language === 'de' ? 'Alle' : 'All'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Cooking Time */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === 'de' ? 'Maximale Kochzeit' : 'Max Cooking Time'}
              </label>
              <Select value={maxCookingTime} onValueChange={setMaxCookingTime}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">{translateField('cookingTime', 'quick')}</SelectItem>
                  <SelectItem value="medium">{translateField('cookingTime', 'medium')}</SelectItem>
                  <SelectItem value="long">{language === 'de' ? 'Alle' : 'All'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dietary */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === 'de' ? 'Ernährungspräferenzen' : 'Dietary Preferences'}
              </label>
              <div className="space-y-2">
                {dietaryOptions.map(option => (
                  <div
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => toggleDietary(option.value)}
                  >
                    <Checkbox checked={dietaryPreferences.includes(option.value)} />
                    <span className="text-sm">{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={() => generatePlan()}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {language === 'de' ? 'Generiere...' : 'Generating...'}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {generatedPlan
                ? (language === 'de' ? 'Neu generieren' : 'Regenerate')
                : (language === 'de' ? 'Wochenplan generieren' : 'Generate Weekly Plan')
              }
            </>
          )}
        </Button>

        {/* Generated Plan Preview */}
        {generatedPlan && (
          <div className="space-y-2">
            {daysOfWeek.map(({ key, label }) => {
              const dish = getDishForDay(key);
              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 bg-accent/30 rounded-md border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                    <p className="text-sm font-medium text-foreground truncate">
                      {generatedPlan[key] || '—'}
                    </p>
                    {dish && (
                      <div className="flex gap-1 mt-0.5">
                        <Badge variant="secondary" className="text-[10px]">
                          {translateField('cuisine', dish.cuisine)}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {translateField('cookingTime', dish.cookingTime)}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    disabled={regeneratingDay === key}
                    onClick={() => generatePlan(key)}
                  >
                    {regeneratingDay === key ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              );
            })}

            <Button
              onClick={applyPlan}
              variant="default"
              className="w-full mt-3"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {language === 'de' ? 'Plan in Kalender übernehmen' : 'Apply Plan to Calendar'}
            </Button>
          </div>
        )}
      </CardContent>
      </CollapsibleContent>
    </Card>
    </Collapsible>
  );
}
