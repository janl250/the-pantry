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
  Sparkles,
} from 'lucide-react';

interface TourStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  route: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    titleKey: 'tour.welcome.title',
    descriptionKey: 'tour.welcome.description',
    icon: <Sparkles className="h-7 w-7" />,
    route: '/',
  },
  {
    id: 'dishes',
    titleKey: 'tour.dishes.title',
    descriptionKey: 'tour.dishes.description',
    icon: <ChefHat className="h-7 w-7" />,
    route: '/recipes',
  },
  {
    id: 'calendar',
    titleKey: 'tour.calendar.title',
    descriptionKey: 'tour.calendar.description',
    icon: <Calendar className="h-7 w-7" />,
    route: '/weekly-calendar',
  },
  {
    id: 'ingredients',
    titleKey: 'tour.ingredients.title',
    descriptionKey: 'tour.ingredients.description',
    icon: <Search className="h-7 w-7" />,
    route: '/ingredient-finder',
  },
  {
    id: 'groups',
    titleKey: 'tour.groups.title',
    descriptionKey: 'tour.groups.description',
    icon: <Users className="h-7 w-7" />,
    route: '/groups',
  },
  {
    id: 'favorites',
    titleKey: 'tour.favorites.title',
    descriptionKey: 'tour.favorites.description',
    icon: <Star className="h-7 w-7" />,
    route: '/',
  },
];

const TOUR_STORAGE_KEY = 'pantry_tour_completed';

export function WelcomeTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  // Auto-start once on home if never completed
  useEffect(() => {
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourCompleted && location.pathname === '/') {
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Navigate to the route of the current step while the tour is open
  useEffect(() => {
    if (!isOpen) return;
    const target = TOUR_STEPS[currentStep].route;
    if (location.pathname !== target) {
      navigate(target);
    }
  }, [isOpen, currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll while tour is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const completeTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsOpen(false);
    if (location.pathname !== '/') navigate('/');
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Click/scroll blocker — captures all interaction with the page below */}
      <div
        className="absolute inset-0 bg-background/40 backdrop-blur-[1px] pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      />

      {/* Floating tour card (bottom on mobile, bottom-right on desktop) */}
      <div className="absolute inset-x-0 bottom-0 sm:inset-x-auto sm:right-6 sm:bottom-6 p-4 sm:p-0 pointer-events-auto">
        <Card className="w-full sm:w-[380px] shadow-2xl border-2 border-primary/30 relative overflow-hidden">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <button
            onClick={completeTour}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label={t('common.close')}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          <CardContent className="pt-6 pb-5 px-5">
            <div className="text-xs text-muted-foreground mb-3">
              {currentStep + 1} / {TOUR_STEPS.length}
            </div>

            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                {step.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold leading-tight mb-1">
                  {t(step.titleKey)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(step.descriptionKey)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                disabled={isFirstStep}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('tour.prev')}
              </Button>
              <Button size="sm" onClick={handleNext} className="flex-1">
                {isLastStep ? t('tour.finish') : t('tour.next')}
                {!isLastStep && <ArrowRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>

            <div className="text-center mt-3">
              <button
                onClick={completeTour}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('tour.skip')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function useWelcomeTour() {
  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    window.location.reload();
  };
  const isTourCompleted = () => localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
  return { resetTour, isTourCompleted };
}
