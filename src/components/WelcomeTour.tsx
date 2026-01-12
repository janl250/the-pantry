import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ChefHat, 
  Calendar, 
  Search, 
  Users, 
  Star, 
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface TourStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  route?: string;
  highlight?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    titleKey: 'tour.welcome.title',
    descriptionKey: 'tour.welcome.description',
    icon: <Sparkles className="h-8 w-8" />,
  },
  {
    id: 'dishes',
    titleKey: 'tour.dishes.title',
    descriptionKey: 'tour.dishes.description',
    icon: <ChefHat className="h-8 w-8" />,
    route: '/recipes',
  },
  {
    id: 'calendar',
    titleKey: 'tour.calendar.title',
    descriptionKey: 'tour.calendar.description',
    icon: <Calendar className="h-8 w-8" />,
    route: '/weekly-calendar',
  },
  {
    id: 'ingredients',
    titleKey: 'tour.ingredients.title',
    descriptionKey: 'tour.ingredients.description',
    icon: <Search className="h-8 w-8" />,
    route: '/ingredient-finder',
  },
  {
    id: 'groups',
    titleKey: 'tour.groups.title',
    descriptionKey: 'tour.groups.description',
    icon: <Users className="h-8 w-8" />,
    route: '/groups',
  },
  {
    id: 'favorites',
    titleKey: 'tour.favorites.title',
    descriptionKey: 'tour.favorites.description',
    icon: <Star className="h-8 w-8" />,
  },
];

const TOUR_STORAGE_KEY = 'pantry_tour_completed';

export function WelcomeTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    // Check if tour was already completed
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourCompleted && location.pathname === '/') {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleSkip = () => {
    completeTour();
  };

  const completeTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleGoToFeature = () => {
    const step = TOUR_STEPS[currentStep];
    if (step.route) {
      completeTour();
      navigate(step.route);
    }
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleSkip}
      />
      
      {/* Tour Card */}
      <Card className={`
        relative z-10 w-full max-w-md shadow-2xl border-2 border-primary/20
        transition-all duration-300 ease-out
        ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
      `}>
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-t-lg overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label={t('common.close')}
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        <CardContent className="pt-8 pb-6 px-6">
          {/* Step Counter */}
          <div className="text-center text-sm text-muted-foreground mb-4">
            {currentStep + 1} / {TOUR_STEPS.length}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              {step.icon}
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">
              {t(step.titleKey)}
            </h3>
            <p className="text-muted-foreground">
              {t(step.descriptionKey)}
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={isFirstStep}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('tour.prev')}
            </Button>

            {step.route && !isLastStep && (
              <Button
                variant="outline"
                onClick={handleGoToFeature}
                className="flex-1"
              >
                {t('tour.tryIt')}
              </Button>
            )}

            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {isLastStep ? t('tour.finish') : t('tour.next')}
              {!isLastStep && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>

          {/* Skip Link */}
          <div className="text-center mt-4">
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('tour.skip')}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to manually trigger the tour
export function useWelcomeTour() {
  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    window.location.reload();
  };

  const isTourCompleted = () => {
    return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
  };

  return { resetTour, isTourCompleted };
}
