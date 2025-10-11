import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, X, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllIngredients } from '@/data/dishes';
import { cn } from '@/lib/utils';

interface AddDishDialogProps {
  onDishAdded: () => void;
}

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

export const AddDishDialog = ({ onDishAdded }: AddDishDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [category, setCategory] = useState('');
  const [cookingTime, setCookingTime] = useState<'quick' | 'medium' | 'long'>('medium');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingredientPopoverOpen, setIngredientPopoverOpen] = useState(false);
  const { toast } = useToast();
  const { t, translateField } = useLanguage();
  
  const allIngredients = useMemo(() => getAllIngredients(), []);
  
  const filteredIngredients = useMemo(() => {
    if (!currentTag) return allIngredients;
    const searchTerm = currentTag.toLowerCase();
    return allIngredients.filter(ing => 
      ing.toLowerCase().includes(searchTerm) && !tags.includes(ing)
    );
  }, [currentTag, allIngredients, tags]);

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
    
    if (!name || !cuisine || !category || tags.length === 0) {
      toast({
        title: t('common.error'),
        description: t('dishLibrary.noResults'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: t('weeklyCalendar.loginRequired'),
          description: t('weeklyCalendar.connectSupabase'),
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.from('user_dishes').insert({
        user_id: user.id,
        name,
        tags,
        cooking_time: cookingTime,
        difficulty,
        cuisine,
        category,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Gericht erfolgreich hinzugefügt!',
      });

      // Reset form
      setName('');
      setCuisine('');
      setCategory('');
      setCookingTime('medium');
      setDifficulty('medium');
      setTags([]);
      setCurrentTag('');
      setOpen(false);
      onDishAdded();
    } catch (error) {
      console.error('Error adding dish:', error);
      toast({
        title: t('common.error'),
        description: 'Fehler beim Hinzufügen des Gerichts',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Eigenes Gericht hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neues Gericht hinzufügen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name des Gerichts</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Spaghetti Carbonara"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cuisine">Küche</Label>
              <Select value={cuisine} onValueChange={setCuisine} required>
                <SelectTrigger>
                  <SelectValue placeholder="Küche wählen" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {cuisineOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {translateField('cuisine', option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
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
              <Label htmlFor="cookingTime">Kochzeit</Label>
              <Select value={cookingTime} onValueChange={(value) => setCookingTime(value as any)}>
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
              <Label htmlFor="difficulty">Schwierigkeit</Label>
              <Select value={difficulty} onValueChange={(value) => setDifficulty(value as any)}>
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
            <Label htmlFor="tags">Zutaten</Label>
            <div className="flex gap-2">
              <Popover open={ingredientPopoverOpen} onOpenChange={setIngredientPopoverOpen}>
                <PopoverTrigger asChild>
                  <div className="flex-1">
                    <Input
                      id="tags"
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
                      placeholder="Zutat eingeben und Enter drücken"
                      onFocus={() => setIngredientPopoverOpen(true)}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandList>
                      <CommandEmpty>Keine Zutat gefunden. Drücke Enter um "{currentTag}" hinzuzufügen.</CommandEmpty>
                      <CommandGroup heading="Vorhandene Zutaten">
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
                </PopoverContent>
              </Popover>
              <Button type="button" onClick={() => handleAddTag()} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {translateField('ingredient', tag)}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Wird hinzugefügt...' : 'Gericht hinzufügen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
