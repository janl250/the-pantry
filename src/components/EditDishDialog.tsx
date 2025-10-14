import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Trash2, X, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllIngredients, type Dish } from '@/data/dishes';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const dishSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  cuisine: z.string().trim().min(1, 'Cuisine is required').max(50, 'Cuisine must be less than 50 characters'),
  category: z.string().trim().min(1, 'Category is required').max(50, 'Category must be less than 50 characters'),
  tags: z.array(z.string()).min(1, 'At least one ingredient is required'),
  cookingTime: z.enum(['quick', 'medium', 'long']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EditDishDialogProps {
  dish: Dish;
  dishId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDishUpdated: () => void;
  onDishDeleted: () => void;
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

export const EditDishDialog = ({ dish, dishId, open, onOpenChange, onDishUpdated, onDishDeleted }: EditDishDialogProps) => {
  const [name, setName] = useState(dish.name);
  const [cuisine, setCuisine] = useState(dish.cuisine);
  const [category, setCategory] = useState(dish.category);
  const [cookingTime, setCookingTime] = useState<'quick' | 'medium' | 'long'>(dish.cookingTime);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(dish.difficulty);
  const [tags, setTags] = useState<string[]>(dish.tags);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [ingredientPopoverOpen, setIngredientPopoverOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
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

  useEffect(() => {
    setName(dish.name);
    setCuisine(dish.cuisine);
    setCategory(dish.category);
    setCookingTime(dish.cookingTime);
    setDifficulty(dish.difficulty);
    setTags(dish.tags);
  }, [dish]);

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
    
    try {
      // Validate with Zod
      const validatedData = dishSchema.parse({
        name,
        cuisine,
        category,
        tags,
        cookingTime,
        difficulty,
      });
      
      setValidationErrors([]);
      setIsSubmitting(true);

      const { error } = await supabase
        .from('user_dishes')
        .update({
          name: validatedData.name,
          tags: validatedData.tags,
          cooking_time: validatedData.cookingTime,
          difficulty: validatedData.difficulty,
          cuisine: validatedData.cuisine,
          category: validatedData.category,
        })
        .eq('id', dishId);

      if (error) throw error;

      toast({
        title: 'Erfolg',
        description: 'Gericht erfolgreich aktualisiert!',
      });

      onDishUpdated();
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(err => err.message);
        setValidationErrors(errors);
        toast({
          title: 'Fehlende Angaben',
          description: 'Bitte fülle alle erforderlichen Felder aus',
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('common.error'),
          description: 'Fehler beim Aktualisieren des Gerichts',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('user_dishes')
        .delete()
        .eq('id', dishId);

      if (error) throw error;

      toast({
        title: 'Erfolg',
        description: 'Gericht erfolgreich gelöscht!',
      });

      onDishDeleted();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Fehler beim Löschen des Gerichts',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gericht bearbeiten</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {validationErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="text-sm font-medium text-destructive mb-2">Bitte fülle folgende Felder aus:</p>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-destructive">{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Name des Gerichts *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Spaghetti Carbonara"
                className={validationErrors.includes('Name des Gerichts') ? 'border-destructive' : ''}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cuisine">Küche *</Label>
                <Select value={cuisine} onValueChange={setCuisine}>
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
                <Label htmlFor="category">Kategorie *</Label>
                <Select value={category} onValueChange={setCategory}>
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
              <Label htmlFor="tags">Zutaten *</Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
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
                    onBlur={() => setTimeout(() => setIngredientPopoverOpen(false), 200)}
                    className={validationErrors.includes('Mindestens eine Zutat') ? 'border-destructive' : ''}
                  />
                  {ingredientPopoverOpen && currentTag && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[200px] overflow-y-auto">
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

            <div className="flex justify-between gap-2 pt-4">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Löschen
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Wird gespeichert...' : 'Speichern'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gericht löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Bist du sicher, dass du "{name}" löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Wird gelöscht...' : 'Löschen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
