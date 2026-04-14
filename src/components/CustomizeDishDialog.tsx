import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { X, Check, RotateCcw, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllIngredients, type Dish } from '@/data/dishes';
import { cn } from '@/lib/utils';

const cuisineOptions = [
  'Italian', 'Japanese', 'Thai', 'Chinese', 'Indian', 'Korean', 'Vietnamese',
  'French', 'Greek', 'Spanish', 'Mexican', 'American', 'Mediterranean',
  'Middle Eastern', 'German', 'Austrian', 'British', 'Hungarian',
  'Moroccan', 'Turkish', 'Brazilian', 'Peruvian', 'Argentine', 'Russian', 'International'
];

const categoryOptions = [
  'pasta', 'pizza', 'rice', 'meat', 'chicken', 'noodles', 'fish', 'seafood',
  'vegetable', 'soup', 'salad', 'appetizer', 'dessert', 'breakfast',
  'lunch', 'dinner', 'snack', 'side dish', 'beverage'
];

interface CustomizeDishDialogProps {
  dish: Dish; // The original dish (without overrides)
  personalizedDish: Dish; // The dish with user overrides applied
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (overrideData: {
    cooking_time?: string;
    difficulty?: string;
    cuisine?: string;
    category?: string;
    tags?: string[];
  }) => Promise<boolean | undefined>;
  onReset: () => void;
  hasOverride: boolean;
}

export const CustomizeDishDialog = ({
  dish,
  personalizedDish,
  open,
  onOpenChange,
  onSave,
  onReset,
  hasOverride,
}: CustomizeDishDialogProps) => {
  const [cuisine, setCuisine] = useState(personalizedDish.cuisine);
  const [category, setCategory] = useState(personalizedDish.category);
  const [cookingTime, setCookingTime] = useState<string>(personalizedDish.cookingTime);
  const [difficulty, setDifficulty] = useState<string>(personalizedDish.difficulty);
  const [tags, setTags] = useState<string[]>(personalizedDish.tags);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingredientPopoverOpen, setIngredientPopoverOpen] = useState(false);
  const { toast } = useToast();
  const { t, translateField, language } = useLanguage();

  const allIngredients = useMemo(() => getAllIngredients(), []);

  const filteredIngredients = useMemo(() => {
    if (!currentTag) return allIngredients;
    const search = currentTag.toLowerCase();
    return allIngredients.filter(ing =>
      ing.toLowerCase().includes(search) && !tags.includes(ing)
    );
  }, [currentTag, allIngredients, tags]);

  useEffect(() => {
    setCuisine(personalizedDish.cuisine);
    setCategory(personalizedDish.category);
    setCookingTime(personalizedDish.cookingTime);
    setDifficulty(personalizedDish.difficulty);
    setTags(personalizedDish.tags);
  }, [personalizedDish, open]);

  const handleAddTag = (ingredient?: string) => {
    const tagToAdd = ingredient || currentTag.trim();
    if (tagToAdd && !tags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd]);
      setCurrentTag('');
      setIngredientPopoverOpen(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await onSave({
      cooking_time: cookingTime,
      difficulty,
      cuisine,
      category,
      tags,
    });

    if (result) {
      toast({
        title: language === 'de' ? 'Anpassung gespeichert' : 'Customization saved',
        description: language === 'de'
          ? 'Deine persönliche Version wurde gespeichert'
          : 'Your personal version has been saved',
      });
      onOpenChange(false);
    } else {
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };

  const handleReset = () => {
    onReset();
    toast({
      title: language === 'de' ? 'Zurückgesetzt' : 'Reset',
      description: language === 'de'
        ? 'Originaleinstellungen wiederhergestellt'
        : 'Original settings restored',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            {dish.name}
            {hasOverride && (
              <Badge variant="secondary" className="text-xs">
                {language === 'de' ? 'Angepasst' : 'Customized'}
              </Badge>
            )}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {language === 'de'
              ? 'Passe dieses Gericht für dich an. Andere Nutzer sehen weiterhin die Originalversion.'
              : 'Customize this dish for yourself. Other users will still see the original version.'}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'de' ? 'Küche' : 'Cuisine'}</Label>
              <Select value={cuisine} onValueChange={setCuisine}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {cuisineOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {translateField('cuisine', option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {cuisine !== dish.cuisine && (
                <p className="text-xs text-muted-foreground">
                  Original: {translateField('cuisine', dish.cuisine)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{language === 'de' ? 'Kategorie' : 'Category'}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {categoryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {translateField('category', option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'de' ? 'Kochzeit' : 'Cooking Time'}</Label>
              <Select value={cookingTime} onValueChange={setCookingTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">{translateField('cookingTime', 'quick')} (&lt;30 min)</SelectItem>
                  <SelectItem value="medium">{translateField('cookingTime', 'medium')} (30-60 min)</SelectItem>
                  <SelectItem value="long">{translateField('cookingTime', 'slow')} (&gt;60 min)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{language === 'de' ? 'Schwierigkeit' : 'Difficulty'}</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">{translateField('difficulty', 'easy')}</SelectItem>
                  <SelectItem value="medium">{translateField('difficulty', 'medium')}</SelectItem>
                  <SelectItem value="hard">{translateField('difficulty', 'hard')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{language === 'de' ? 'Zutaten' : 'Ingredients'}</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={currentTag}
                  onChange={(e) => {
                    setCurrentTag(e.target.value);
                    setIngredientPopoverOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder={language === 'de' ? 'Zutat eingeben...' : 'Type ingredient...'}
                  onFocus={() => setIngredientPopoverOpen(true)}
                  onBlur={() => setTimeout(() => setIngredientPopoverOpen(false), 200)}
                />
                {ingredientPopoverOpen && currentTag && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[200px] overflow-y-auto">
                    <Command>
                      <CommandList>
                        <CommandEmpty>
                          {language === 'de'
                            ? `Keine Zutat gefunden. Enter drücken um "${currentTag}" hinzuzufügen.`
                            : `No ingredient found. Press Enter to add "${currentTag}".`}
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredIngredients.slice(0, 8).map((ingredient) => (
                            <CommandItem
                              key={ingredient}
                              value={ingredient}
                              onSelect={() => handleAddTag(ingredient)}
                            >
                              <Check className={cn("mr-2 h-4 w-4", tags.includes(ingredient) ? "opacity-100" : "opacity-0")} />
                              {translateField('ingredient', ingredient)}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                )}
              </div>
              <Button type="button" onClick={() => handleAddTag()} variant="outline" size="icon">
                <Check className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {translateField('ingredient', tag)}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-4">
            {hasOverride && (
              <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                {language === 'de' ? 'Original wiederherstellen' : 'Restore Original'}
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {language === 'de' ? 'Abbrechen' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? (language === 'de' ? 'Wird gespeichert...' : 'Saving...')
                  : (language === 'de' ? 'Für mich speichern' : 'Save for me')}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
