import { CategoryCard } from "./CategoryCard";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Camera, Wand2, BarChart3, ChefHat } from "lucide-react";
import dishLibraryImg from "@/assets/dish-library.jpg";
import ingredientFinderImg from "@/assets/ingredient-finder.jpg";
import weeklyCalendarImg from "@/assets/weekly-calendar.jpg";
import groupsImg from "@/assets/groups.jpg";
import moreFeaturesImg from "@/assets/more-features.jpg";

export const CategoriesSection = () => {
  const { t, language } = useLanguage();
  
  const mainCategories = [
    {
      title: t('categories.dishCollection.title'),
      description: t('categories.dishCollection.description'),
      image: dishLibraryImg,
      href: "/recipes"
    },
    {
      title: language === 'de' ? 'Gerichte-Finder' : 'Dish Finder',
      description: language === 'de' ? 'Finden Sie Gerichte anhand Ihrer Zutaten oder per Foto-Erkennung' : 'Find dishes by ingredients or photo recognition',
      image: ingredientFinderImg,
      href: "/ingredient-finder"
    },
    {
      title: t('categories.weeklyCalendar.title'),
      description: t('categories.weeklyCalendar.description'),
      image: weeklyCalendarImg,
      href: "/weekly-calendar"
    },
    {
      title: language === 'de' ? 'Gruppen' : 'Groups',
      description: language === 'de' ? 'Teilen Sie Wochenpläne mit Familie oder Mitbewohnern' : 'Share meal plans with family or roommates',
      image: groupsImg,
      href: "/groups"
    }
  ];

  const moreFeatures = [
    {
      icon: Wand2,
      title: language === 'de' ? 'KI-Vorschläge' : 'AI Suggestions',
      description: language === 'de' ? 'Lassen Sie die KI passende Gerichte zu Ihren Zutaten vorschlagen' : 'Let AI suggest matching dishes for your ingredients',
      href: "/ingredient-finder"
    },
    {
      icon: Camera,
      title: language === 'de' ? 'Foto-Erkennung' : 'Photo Recognition',
      description: language === 'de' ? 'Fotografieren Sie ein Gericht und die KI erkennt es für Sie' : 'Take a photo of a dish and AI will recognize it',
      href: "/ingredient-finder"
    },
    {
      icon: BarChart3,
      title: language === 'de' ? 'Statistiken' : 'Statistics',
      description: language === 'de' ? 'Sehen Sie was und wie oft Sie gekocht haben' : 'See what and how often you cooked',
      href: "/statistics"
    },
    {
      icon: ChefHat,
      title: language === 'de' ? 'KI-Wochenplan' : 'AI Weekly Plan',
      description: language === 'de' ? 'Generieren Sie einen ausgewogenen Wochenplan mit KI' : 'Generate a balanced weekly plan with AI',
      href: "/weekly-calendar"
    }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/30 dark:to-muted/10">
      <div className="max-w-7xl mx-auto">
        {/* Main Categories */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('categories.title')}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {mainCategories.map((category, index) => (
            <Link key={index} to={category.href} className="group transform transition-all duration-300 hover:scale-105">
              <CategoryCard
                title={category.title}
                description={category.description}
                image={category.image}
              />
            </Link>
          ))}
        </div>

        {/* More Features Section */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {language === 'de' ? 'Mehr Features' : 'More Features'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'de' 
                ? 'Entdecken Sie weitere Funktionen, die Ihren Küchenalltag erleichtern'
                : 'Discover more features that make your kitchen life easier'}
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mt-4"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {moreFeatures.map((feature, index) => (
              <Link key={index} to={feature.href} className="group">
                <div className="bg-card border border-border/50 rounded-xl p-6 h-full hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
