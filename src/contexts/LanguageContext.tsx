import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateField: (type: 'cuisine' | 'difficulty' | 'cookingTime' | 'category' | 'ingredient', value: string) => string;
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

    // Hero
    'hero.title': 'Deine persönliche Speisekammer',
    'hero.subtitle': 'Plane deine Mahlzeiten, entdecke neue Gerichte und teile sie mit Freunden.',

    // Categories
    'categories.title': 'Kategorien',
    'categories.all': 'Alle',

    // Dish Library
    'dishLibrary.title': 'Gerichtesammlung',
    'dishLibrary.addDish': 'Gericht hinzufügen',
    'dishLibrary.noDishes': 'Keine Gerichte gefunden.',
    'dishLibrary.searchPlaceholder': 'Gerichte suchen...',

    // Favorites
    'favorites.add': 'Zu Favoriten hinzufügen',
    'favorites.remove': 'Von Favoriten entfernen',
    'favorites.title': 'Favoriten',
    'favorites.showOnly': 'Nur Favoriten anzeigen',
    'favorites.added': 'Zu Favoriten hinzugefügt!',
    'favorites.removed': 'Von Favoriten entfernt!',
    'favorites.error': 'Fehler beim Aktualisieren der Favoriten',
    'favorites.loginRequired': 'Bitte melde dich an, um Favoriten zu speichern',

    // Rating System
    'rating.title': 'Bewertung',
    'rating.rate': 'Bewerten',
    'rating.yourRating': 'Deine Bewertung',
    'rating.avgRating': 'Durchschnitt',
    'rating.count': 'Bewertungen',
    'rating.loginRequired': 'Bitte melde dich an, um zu bewerten',

    // Leftovers
    'leftovers.title': 'Reste',
    'leftovers.markAs': 'Als Reste markieren',
    'leftovers.from': 'Reste von',
    'leftovers.select': 'Wähle das Original-Gericht',
    'leftovers.none': 'Keine Reste verfügbar',
    'leftovers.add': 'Reste hinzufügen',

    // Common
    'common.loading': 'Laden...',
    'common.error': 'Ein Fehler ist aufgetreten',
    'common.back': 'Zurück',
    'common.close': 'Schließen',

    // Cuisines
    'cuisine.Italian': 'Italienisch',
    'cuisine.Mexican': 'Mexikanisch',
    'cuisine.Indian': 'Indisch',
    'cuisine.Chinese': 'Chinesisch',
    'cuisine.French': 'Französisch',
    'cuisine.German': 'Deutsch',
    'cuisine.Japanese': 'Japanisch',
    'cuisine.Thai': 'Thailändisch',
    'cuisine.All': 'Alle',

    // Difficulties
    'difficulty.Easy': 'Einfach',
    'difficulty.Medium': 'Mittel',
    'difficulty.Hard': 'Schwierig',

    // Cooking Times
    'cookingTime.Short': 'Kurz',
    'cookingTime.Medium': 'Mittel',
    'cookingTime.Long': 'Lang',

    // Categories
    'category.Vegan': 'Vegan',
    'category.Vegetarian': 'Vegetarisch',
    'category.Meat': 'Fleisch',
    'category.Fish': 'Fisch',
    'category.Dessert': 'Dessert',

    // Ingredients
    'ingredient.Tomato': 'Tomate',
    'ingredient.Cheese': 'Käse',
    'ingredient.Chicken': 'Hähnchen',
    'ingredient.Beef': 'Rind',
    'ingredient.Pasta': 'Nudeln',
  },
  en: {
    // Navigation
    'nav.brand': 'The Pantry',
    'nav.dishCollection': 'Dish Collection',
    'nav.weeklyPlanner': 'Weekly Planner',
    'nav.hello': 'Hello',
    'nav.logout': 'Logout',
    'nav.login': 'Login',

    // Hero
    'hero.title': 'Your Personal Pantry',
    'hero.subtitle': 'Plan your meals, discover new dishes, and share with friends.',

    // Categories
    'categories.title': 'Categories',
    'categories.all': 'All',

    // Dish Library
    'dishLibrary.title': 'Dish Library',
    'dishLibrary.addDish': 'Add Dish',
    'dishLibrary.noDishes': 'No dishes found.',
    'dishLibrary.searchPlaceholder': 'Search dishes...',

    // Favorites
    'favorites.add': 'Add to favorites',
    'favorites.remove': 'Remove from favorites',
    'favorites.title': 'Favorites',
    'favorites.showOnly': 'Show favorites only',
    'favorites.added': 'Added to favorites!',
    'favorites.removed': 'Removed from favorites!',
    'favorites.error': 'Error updating favorites',
    'favorites.loginRequired': 'Please log in to save favorites',

    // Rating System
    'rating.title': 'Rating',
    'rating.rate': 'Rate',
    'rating.yourRating': 'Your rating',
    'rating.avgRating': 'Average',
    'rating.count': 'Ratings',
    'rating.loginRequired': 'Please log in to rate',

    // Leftovers
    'leftovers.title': 'Leftovers',
    'leftovers.markAs': 'Mark as leftovers',
    'leftovers.from': 'Leftovers from',
    'leftovers.select': 'Select original dish',
    'leftovers.none': 'No leftovers available',
    'leftovers.add': 'Add leftovers',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.back': 'Back',
    'common.close': 'Close',

    // Cuisines
    'cuisine.Italian': 'Italian',
    'cuisine.Mexican': 'Mexican',
    'cuisine.Indian': 'Indian',
    'cuisine.Chinese': 'Chinese',
    'cuisine.French': 'French',
    'cuisine.German': 'German',
    'cuisine.Japanese': 'Japanese',
    'cuisine.Thai': 'Thai',
    'cuisine.All': 'All',

    // Difficulties
    'difficulty.Easy': 'Easy',
    'difficulty.Medium': 'Medium',
    'difficulty.Hard': 'Hard',

    // Cooking Times
    'cookingTime.Short': 'Short',
    'cookingTime.Medium': 'Medium',
    'cookingTime.Long': 'Long',

    // Categories
    'category.Vegan': 'Vegan',
    'category.Vegetarian': 'Vegetarian',
    'category.Meat': 'Meat',
    'category.Fish': 'Fish',
    'category.Dessert': 'Dessert',

    // Ingredients
    'ingredient.Tomato': 'Tomato',
    'ingredient.Cheese': 'Cheese',
    'ingredient.Chicken': 'Chicken',
    'ingredient.Beef': 'Beef',
    'ingredient.Pasta': 'Pasta',
  },
} as const;

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('language');
    if (storedLang === 'de' || storedLang === 'en') {
      setLanguage(storedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const translateField = (
    type: 'cuisine' | 'difficulty' | 'cookingTime' | 'category' | 'ingredient',
    value: string
  ): string => {
    if (!value) return '';
    const key = `${type}.${value}`;
    return translations[language][key as keyof typeof translations['en']] || value;
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
