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
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useIngredients } from "@/hooks/useIngredients";
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { checkAndTriggerFirstDishConfetti } from '@/lib/confetti';

const dishSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  cuisine: z.string().trim().min(1, 'Cuisine is required').max(50, 'Cuisine must be less than 50 characters'),
  category: z.string().trim().min(1, 'Category is required').max(50, 'Category must be less than 50 characters'),
  tags: z.array(z.string()).min(1, 'At least one ingredient is required'),
  cookingTime: z.enum(['quick', 'medium', 'long']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const { t, translateField } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { ingredients } = useIngredients();
  
  const filteredIngredients = useMemo(() => {
    if (!currentTag) return ingredients;
    const searchTerm = currentTag.toLowerCase();
    return ingredients.filter(ing => {
      const originalName = ing.toLowerCase();
      const translatedName = translateField('ingredient', ing).toLowerCase();
      return (
        (originalName.includes(searchTerm) || translatedName.includes(searchTerm)) &&
        !tags.includes(ing)
      );
    });
  }, [currentTag, ingredients, tags, translateField]);

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
        name: validatedData.name,
        tags: validatedData.tags,
        cooking_time: validatedData.cookingTime,
        difficulty: validatedData.difficulty,
        cuisine: validatedData.cuisine,
        category: validatedData.category,
      });

      if (error) throw error;

      // Check for first dish and trigger confetti
      const isFirstDish = checkAndTriggerFirstDishConfetti();
      
      toast({
        title: isFirstDish 
          ? (t('addDish.firstDishSuccess') || '🎉 Erstes Gericht erstellt!') 
          : 'Success',
        description: t('addDish.success'),
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
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(err => err.message);
        setValidationErrors(errors);
        toast({
          title: t('addDish.validationError'),
          description: t('addDish.validationDescription'),
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('common.error'),
          description: t('addDish.error'),
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) {
            if (!isAuthenticated) {
              toast({
                title: t('addDish.loginRequired'),
                description: t('addDish.loginDescription'),
              });
              navigate("/auth");
              return;
            }
          }
          setOpen(next);
        }}
      >
      <DialogTrigger asChild>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t('addDish.button')}</span>
          <span className="sm:hidden">Neu</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('addDish.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationErrors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <p className="text-sm font-medium text-destructive mb-2">{t('addDish.validationPrompt')}</p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-destructive">{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">{t('addDish.name')} {t('addDish.required')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('addDish.namePlaceholder')}
              className={validationErrors.includes(t('addDish.name')) ? 'border-destructive' : ''}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cuisine">{t('addDish.cuisine')} {t('addDish.required')}</Label>
              <Select value={cuisine} onValueChange={setCuisine}>
                <SelectTrigger>
                  <SelectValue placeholder={t('addDish.cuisinePlaceholder')} />
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
              <Label htmlFor="category">{t('addDish.category')} {t('addDish.required')}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t('addDish.categoryPlaceholder')} />
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
              <Label htmlFor="cookingTime">{t('addDish.cookingTime')}</Label>
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
              <Label htmlFor="difficulty">{t('addDish.difficulty')}</Label>
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
            <Label htmlFor="tags">{t('addDish.ingredients')} {t('addDish.required')}</Label>
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
                  placeholder={t('addDish.ingredientPlaceholder')}
                  onFocus={() => setIngredientPopoverOpen(true)}
                  onBlur={() => setTimeout(() => setIngredientPopoverOpen(false), 200)}
                  className={validationErrors.includes(t('addDish.ingredients')) ? 'border-destructive' : ''}
                />
                {ingredientPopoverOpen && currentTag && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[200px] overflow-y-auto">
                    <Command>
                      <CommandList>
                        <CommandEmpty>{t('addDish.ingredientNotFound').replace('{tag}', currentTag)}</CommandEmpty>
                        <CommandGroup heading={t('addDish.existingIngredients')}>
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
              {t('addDish.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('addDish.submitting') : t('addDish.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
