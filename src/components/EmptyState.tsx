import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  ChefHat, 
  Calendar, 
  Users, 
  Search, 
  UtensilsCrossed,
  Sparkles,
  Heart
} from 'lucide-react';

type EmptyStateType = 
  | 'no-dishes' 
  | 'no-results' 
  | 'no-groups' 
  | 'no-favorites' 
  | 'no-ingredients'
  | 'no-meal-plan'
  | 'login-required';

interface EmptyStateProps {
  type: EmptyStateType;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const illustrations: Record<EmptyStateType, React.ReactNode> = {
  'no-dishes': (
    <div className="relative">
      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
        <ChefHat className="w-16 h-16 text-primary" />
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary/30 rounded-full flex items-center justify-center animate-bounce">
        <Sparkles className="w-4 h-4 text-secondary" />
      </div>
    </div>
  ),
  'no-results': (
    <div className="relative">
      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
        <Search className="w-16 h-16 text-muted-foreground" />
      </div>
      <div className="absolute bottom-0 right-4 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
        <UtensilsCrossed className="w-5 h-5 text-primary/60" />
      </div>
    </div>
  ),
  'no-groups': (
    <div className="relative">
      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full flex items-center justify-center">
        <Users className="w-16 h-16 text-secondary" />
      </div>
      <div className="absolute -bottom-1 left-4 w-8 h-8 bg-primary/30 rounded-full" />
      <div className="absolute top-2 right-2 w-6 h-6 bg-secondary/30 rounded-full" />
    </div>
  ),
  'no-favorites': (
    <div className="relative">
      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-destructive/10 to-primary/10 rounded-full flex items-center justify-center">
        <Heart className="w-16 h-16 text-destructive/60" />
      </div>
      <div className="absolute -top-1 right-6 w-6 h-6 bg-destructive/20 rounded-full animate-pulse" />
    </div>
  ),
  'no-ingredients': (
    <div className="relative">
      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-secondary/20 to-accent/30 rounded-full flex items-center justify-center">
        <Search className="w-16 h-16 text-secondary" />
      </div>
      <div className="absolute bottom-2 left-2 w-10 h-10 bg-accent/40 rounded-full flex items-center justify-center">
        <UtensilsCrossed className="w-5 h-5 text-accent-foreground/60" />
      </div>
    </div>
  ),
  'no-meal-plan': (
    <div className="relative">
      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/15 to-secondary/15 rounded-full flex items-center justify-center">
        <Calendar className="w-16 h-16 text-primary/70" />
      </div>
      <div className="absolute -bottom-2 right-6 w-8 h-8 bg-secondary/25 rounded-full flex items-center justify-center">
        <ChefHat className="w-4 h-4 text-secondary" />
      </div>
    </div>
  ),
  'login-required': (
    <div className="relative">
      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/20 to-muted rounded-full flex items-center justify-center">
        <ChefHat className="w-16 h-16 text-primary" />
      </div>
      <div className="absolute top-0 right-4 w-6 h-6 bg-secondary/40 rounded-full" />
      <div className="absolute bottom-4 left-2 w-4 h-4 bg-primary/30 rounded-full" />
    </div>
  ),
};

const messages: Record<EmptyStateType, { titleKey: string; descriptionKey: string }> = {
  'no-dishes': {
    titleKey: 'emptyState.noDishes.title',
    descriptionKey: 'emptyState.noDishes.description',
  },
  'no-results': {
    titleKey: 'emptyState.noResults.title',
    descriptionKey: 'emptyState.noResults.description',
  },
  'no-groups': {
    titleKey: 'emptyState.noGroups.title',
    descriptionKey: 'emptyState.noGroups.description',
  },
  'no-favorites': {
    titleKey: 'emptyState.noFavorites.title',
    descriptionKey: 'emptyState.noFavorites.description',
  },
  'no-ingredients': {
    titleKey: 'emptyState.noIngredients.title',
    descriptionKey: 'emptyState.noIngredients.description',
  },
  'no-meal-plan': {
    titleKey: 'emptyState.noMealPlan.title',
    descriptionKey: 'emptyState.noMealPlan.description',
  },
  'login-required': {
    titleKey: 'emptyState.loginRequired.title',
    descriptionKey: 'emptyState.loginRequired.description',
  },
};

export function EmptyState({ type, action, secondaryAction }: EmptyStateProps) {
  const { t } = useLanguage();
  const { titleKey, descriptionKey } = messages[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <div className="mb-6">
        {illustrations[type]}
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {t(titleKey)}
      </h3>
      
      <p className="text-muted-foreground max-w-sm mb-6">
        {t(descriptionKey)}
      </p>
      
      {(action || secondaryAction) && (
        <div className="flex flex-wrap gap-3 justify-center">
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
