import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateField: (type: 'cuisine' | 'difficulty' | 'cookingTime' | 'category', value: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  de: {
    // Navigation
    'nav.brand': 'The Pantry',
    'nav.dishCollection': 'Gerichte-Sammlung',
    'nav.weeklyPlanner': 'Wochenplaner',
    'nav.hello': 'Hallo',
    'nav.logout': 'Abmelden',
    'nav.login': 'Anmelden',
    
    // Hero Section
    'hero.title': 'Willkommen in The Pantry',
    'hero.subtitle': 'Ihre kulinarische Reise beginnt hier. Entdecken Sie köstliche Rezepte, planen Sie Ihre Mahlzeiten und lassen Sie sich von unserer Auswahl inspirieren.',
    'hero.cta': 'Entdecken Sie Rezepte',
    
    // Categories
    'categories.title': 'Gerichte entdecken',
    'categories.dishCollection.title': 'Gerichte-Sammlung',
    'categories.dishCollection.description': 'Durchstöbern Sie unsere komplette Sammlung köstlicher Gerichte',
    'categories.dishOfDay.title': 'Gericht des Tages',
    'categories.dishOfDay.description': 'Entdecken Sie das heutige besondere Gericht',
    'categories.ingredientFinder.title': 'Zutatenfinder',
    'categories.ingredientFinder.description': 'Finden Sie Rezepte mit Ihren verfügbaren Zutaten',
    'categories.weeklyCalendar.title': 'Wochenkalender',
    'categories.weeklyCalendar.description': 'Planen und verwalten Sie Ihre Mahlzeiten der Woche',
    
    // Dish Library
    'dishLibrary.title': 'Gerichte-Sammlung',
    'dishLibrary.search': 'Gerichte durchsuchen...',
    'dishLibrary.filters.cuisine': 'Küche',
    'dishLibrary.filters.cookingTime': 'Kochzeit',
    'dishLibrary.filters.difficulty': 'Schwierigkeit',
    'dishLibrary.filters.category': 'Kategorie',
    'dishLibrary.filters.all': 'Alle',
    'dishLibrary.filters.quick': 'Schnell (<30 Min)',
    'dishLibrary.filters.medium': 'Mittel (30-60 Min)',
    'dishLibrary.filters.long': 'Lang (>60 Min)',
    'dishLibrary.filters.easy': 'Einfach',
    'dishLibrary.filters.hard': 'Schwer',
    'dishLibrary.clearFilters': 'Filter zurücksetzen',
    'dishLibrary.results': 'Gerichte gefunden',
    'dishLibrary.noResults': 'Keine Gerichte gefunden',
    'dishLibrary.noResultsDescription': 'Versuchen Sie andere Suchbegriffe oder setzen Sie die Filter zurück.',
    
    // Dish of the Day
    'dishOfDay.title': 'Gericht des Tages',
    'dishOfDay.subtitle': 'Heute empfehlen wir Ihnen dieses besondere Gericht',
    'dishOfDay.cookingTime': 'Kochzeit',
    'dishOfDay.difficulty': 'Schwierigkeit',
    'dishOfDay.cuisine': 'Küche',
    'dishOfDay.category': 'Kategorie',
    'dishOfDay.ingredients': 'Zutaten',
    
    // Ingredient Finder
    'ingredientFinder.title': 'Zutatenfinder',
    'ingredientFinder.subtitle': 'Wählen Sie Ihre verfügbaren Zutaten aus und entdecken Sie passende Gerichte',
    'ingredientFinder.search': 'Zutaten suchen...',
    'ingredientFinder.selected': 'Ausgewählte Zutaten',
    'ingredientFinder.clear': 'Alle löschen',
    'ingredientFinder.results': 'Passende Gerichte',
    'ingredientFinder.noIngredients': 'Keine Zutaten ausgewählt',
    'ingredientFinder.selectIngredients': 'Wählen Sie Zutaten aus, um passende Gerichte zu finden.',
    
    // Weekly Calendar
    'weeklyCalendar.title': 'Wochenkalender',
    'weeklyCalendar.subtitle': 'Planen Sie Ihre Mahlzeiten für die Woche',
    'weeklyCalendar.save': 'Wochenplan speichern',
    'weeklyCalendar.clear': 'Woche löschen',
    'weeklyCalendar.connectSupabase': 'Um Ihren Wochenplan zu speichern, müssen Sie sich anmelden.',
    'weeklyCalendar.loginRequired': 'Anmeldung erforderlich',
    'weeklyCalendar.saved': 'Wochenplan erfolgreich gespeichert!',
    'weeklyCalendar.cleared': 'Wochenplan erfolgreich gelöscht!',
    'weeklyCalendar.error': 'Fehler beim Speichern des Wochenplans',
    'weeklyCalendar.days.monday': 'Montag',
    'weeklyCalendar.days.tuesday': 'Dienstag',
    'weeklyCalendar.days.wednesday': 'Mittwoch',
    'weeklyCalendar.days.thursday': 'Donnerstag',
    'weeklyCalendar.days.friday': 'Freitag',
    'weeklyCalendar.days.saturday': 'Samstag',
    'weeklyCalendar.days.sunday': 'Sonntag',
    'weeklyCalendar.selectDish': 'Gericht auswählen...',
    
    // Auth
    'auth.title': 'Anmeldung',
    'auth.login': 'Anmelden',
    'auth.signup': 'Registrieren',
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.confirmPassword': 'Passwort bestätigen',
    'auth.loginButton': 'Anmelden',
    'auth.signupButton': 'Registrieren',
    'auth.switchToSignup': 'Noch kein Konto? Registrieren',
    'auth.switchToLogin': 'Bereits ein Konto? Anmelden',
    'auth.loginSuccess': 'Erfolgreich angemeldet!',
    'auth.signupSuccess': 'Erfolgreich registriert!',
    'auth.error': 'Anmeldung fehlgeschlagen',
    'auth.backToHome': 'Zurück zur Startseite',
    
    // Footer
    'footer.rights': 'Alle Rechte vorbehalten.',
    
    // Common
    'common.loading': 'Laden...',
    'common.error': 'Ein Fehler ist aufgetreten',
    'common.back': 'Zurück',
    'common.close': 'Schließen',
    
    // Cuisines
    'cuisine.italian': 'Italienisch',
    'cuisine.asian': 'Asiatisch',
    'cuisine.mediterranean': 'Mediterran',
    'cuisine.mexican': 'Mexikanisch',
    'cuisine.american': 'Amerikanisch',
    'cuisine.french': 'Französisch',
    'cuisine.greek': 'Griechisch',
    'cuisine.spanish': 'Spanisch',
    'cuisine.middle eastern': 'Naher Osten',
    'cuisine.japanese': 'Japanisch',
    'cuisine.thai': 'Thailändisch',
    'cuisine.indian': 'Indisch',
    'cuisine.chinese': 'Chinesisch',
    'cuisine.korean': 'Koreanisch',
    'cuisine.vietnamese': 'Vietnamesisch',
    
    // Difficulties
    'difficulty.easy': 'Einfach',
    'difficulty.medium': 'Mittel',
    'difficulty.hard': 'Schwer',
    
    // Cooking Times
    'cookingTime.quick': 'Schnell',
    'cookingTime.medium': 'Mittel',
    'cookingTime.slow': 'Langsam',
    
    // Categories
    'category.appetizer': 'Vorspeise',
    'category.main course': 'Hauptgericht',
    'category.dessert': 'Dessert',
    'category.breakfast': 'Frühstück',
    'category.lunch': 'Mittagessen',
    'category.dinner': 'Abendessen',
    'category.snack': 'Snack',
    'category.side dish': 'Beilage',
    'category.soup': 'Suppe',
    'category.salad': 'Salat',
    'category.beverage': 'Getränk',
  },
  en: {
    // Navigation
    'nav.brand': 'The Pantry',
    'nav.dishCollection': 'Dish Collection',
    'nav.weeklyPlanner': 'Weekly Planner',
    'nav.hello': 'Hello',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    
    // Hero Section
    'hero.title': 'Welcome to The Pantry',
    'hero.subtitle': 'Your culinary journey starts here. Discover delicious recipes, plan your meals, and get inspired by our selection.',
    'hero.cta': 'Explore Recipes',
    
    // Categories
    'categories.title': 'Discover Dishes',
    'categories.dishCollection.title': 'Dish Collection',
    'categories.dishCollection.description': 'Browse our complete collection of delicious dishes',
    'categories.dishOfDay.title': 'Dish of the Day',
    'categories.dishOfDay.description': 'Discover today\'s special dish',
    'categories.ingredientFinder.title': 'Ingredient Finder',
    'categories.ingredientFinder.description': 'Find recipes with your available ingredients',
    'categories.weeklyCalendar.title': 'Weekly Calendar',
    'categories.weeklyCalendar.description': 'Plan and manage your weekly meals',
    
    // Dish Library
    'dishLibrary.title': 'Dish Collection',
    'dishLibrary.search': 'Search dishes...',
    'dishLibrary.filters.cuisine': 'Cuisine',
    'dishLibrary.filters.cookingTime': 'Cooking Time',
    'dishLibrary.filters.difficulty': 'Difficulty',
    'dishLibrary.filters.category': 'Category',
    'dishLibrary.filters.all': 'All',
    'dishLibrary.filters.quick': 'Quick (<30 min)',
    'dishLibrary.filters.medium': 'Medium (30-60 min)',
    'dishLibrary.filters.long': 'Long (>60 min)',
    'dishLibrary.filters.easy': 'Easy',
    'dishLibrary.filters.hard': 'Hard',
    'dishLibrary.clearFilters': 'Clear Filters',
    'dishLibrary.results': 'dishes found',
    'dishLibrary.noResults': 'No dishes found',
    'dishLibrary.noResultsDescription': 'Try different search terms or clear the filters.',
    
    // Dish of the Day
    'dishOfDay.title': 'Dish of the Day',
    'dishOfDay.subtitle': 'Today we recommend this special dish',
    'dishOfDay.cookingTime': 'Cooking Time',
    'dishOfDay.difficulty': 'Difficulty',
    'dishOfDay.cuisine': 'Cuisine',
    'dishOfDay.category': 'Category',
    'dishOfDay.ingredients': 'Ingredients',
    
    // Ingredient Finder
    'ingredientFinder.title': 'Ingredient Finder',
    'ingredientFinder.subtitle': 'Select your available ingredients and discover matching dishes',
    'ingredientFinder.search': 'Search ingredients...',
    'ingredientFinder.selected': 'Selected Ingredients',
    'ingredientFinder.clear': 'Clear All',
    'ingredientFinder.results': 'Matching Dishes',
    'ingredientFinder.noIngredients': 'No ingredients selected',
    'ingredientFinder.selectIngredients': 'Select ingredients to find matching dishes.',
    
    // Weekly Calendar
    'weeklyCalendar.title': 'Weekly Calendar',
    'weeklyCalendar.subtitle': 'Plan your meals for the week',
    'weeklyCalendar.save': 'Save Weekly Plan',
    'weeklyCalendar.clear': 'Clear Week',
    'weeklyCalendar.connectSupabase': 'To save your weekly plan, you need to log in.',
    'weeklyCalendar.loginRequired': 'Login Required',
    'weeklyCalendar.saved': 'Weekly plan saved successfully!',
    'weeklyCalendar.cleared': 'Weekly plan cleared successfully!',
    'weeklyCalendar.error': 'Error saving weekly plan',
    'weeklyCalendar.days.monday': 'Monday',
    'weeklyCalendar.days.tuesday': 'Tuesday',
    'weeklyCalendar.days.wednesday': 'Wednesday',
    'weeklyCalendar.days.thursday': 'Thursday',
    'weeklyCalendar.days.friday': 'Friday',
    'weeklyCalendar.days.saturday': 'Saturday',
    'weeklyCalendar.days.sunday': 'Sunday',
    'weeklyCalendar.selectDish': 'Select dish...',
    
    // Auth
    'auth.title': 'Authentication',
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.loginButton': 'Login',
    'auth.signupButton': 'Sign Up',
    'auth.switchToSignup': 'Don\'t have an account? Sign up',
    'auth.switchToLogin': 'Already have an account? Login',
    'auth.loginSuccess': 'Successfully logged in!',
    'auth.signupSuccess': 'Successfully signed up!',
    'auth.error': 'Authentication failed',
    'auth.backToHome': 'Back to Home',
    
    // Footer
    'footer.rights': 'All rights reserved.',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.back': 'Back',
    'common.close': 'Close',
    
    // Cuisines
    'cuisine.italian': 'Italian',
    'cuisine.asian': 'Asian',
    'cuisine.mediterranean': 'Mediterranean',
    'cuisine.mexican': 'Mexican',
    'cuisine.american': 'American',
    'cuisine.french': 'French',
    'cuisine.greek': 'Greek',
    'cuisine.spanish': 'Spanish',
    'cuisine.middle eastern': 'Middle Eastern',
    'cuisine.japanese': 'Japanese',
    'cuisine.thai': 'Thai',
    'cuisine.indian': 'Indian',
    'cuisine.chinese': 'Chinese',
    'cuisine.korean': 'Korean',
    'cuisine.vietnamese': 'Vietnamese',
    
    // Difficulties
    'difficulty.easy': 'Easy',
    'difficulty.medium': 'Medium',
    'difficulty.hard': 'Hard',
    
    // Cooking Times
    'cookingTime.quick': 'Quick',
    'cookingTime.medium': 'Medium',
    'cookingTime.slow': 'Slow',
    
    // Categories
    'category.appetizer': 'Appetizer',
    'category.main course': 'Main Course',
    'category.dessert': 'Dessert',
    'category.breakfast': 'Breakfast',
    'category.lunch': 'Lunch',
    'category.dinner': 'Dinner',
    'category.snack': 'Snack',
    'category.side dish': 'Side Dish',
    'category.soup': 'Soup',
    'category.salad': 'Salad',
    'category.beverage': 'Beverage',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'de';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const translateField = (type: 'cuisine' | 'difficulty' | 'cookingTime' | 'category', value: string): string => {
    const key = `${type}.${value.toLowerCase()}`;
    return t(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateField }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};