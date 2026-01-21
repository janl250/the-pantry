import { CategoryCard } from "./CategoryCard";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import dishLibraryImg from "@/assets/dish-library.jpg";
import dishOfDayImg from "@/assets/dish-of-day.jpg";
import ingredientFinderImg from "@/assets/ingredient-finder.jpg";
import weeklyCalendarImg from "@/assets/weekly-calendar.jpg";

export const CategoriesSection = () => {
  const { t } = useLanguage();
  
  const categories = [
    {
      title: t('categories.dishCollection.title'),
      description: t('categories.dishCollection.description'),
      image: dishLibraryImg,
      href: "/recipes"
    },
    {
      title: t('categories.dishOfDay.title'),
      description: t('categories.dishOfDay.description'),
      image: dishOfDayImg,
      href: "/dish-of-the-day"
    },
    {
      title: t('categories.ingredientFinder.title'),
      description: t('categories.ingredientFinder.description'),
      image: ingredientFinderImg,
      href: "/ingredient-finder"
    },
    {
      title: t('categories.weeklyCalendar.title'),
      description: t('categories.weeklyCalendar.description'),
      image: weeklyCalendarImg,
      href: "/weekly-calendar"
    }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/30 dark:to-muted/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('categories.title')}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <Link key={index} to={category.href} className="group transform transition-all duration-300 hover:scale-105">
              <CategoryCard
                title={category.title}
                description={category.description}
                image={category.image}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};