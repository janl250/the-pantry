import { CategoryCard } from "./CategoryCard";
import { Link } from "react-router-dom";
import dishLibraryImg from "@/assets/dish-library.jpg";
import dishOfDayImg from "@/assets/dish-of-day.jpg";
import ingredientFinderImg from "@/assets/ingredient-finder.jpg";
import weeklyCalendarImg from "@/assets/weekly-calendar.jpg";

export const CategoriesSection = () => {
  const categories = [
    {
      title: "Rezeptsammlung",
      description: "Durchstöbern Sie unsere komplette Rezeptsammlung",
      image: dishLibraryImg,
      href: "/recipes"
    },
    {
      title: "Gericht des Tages",
      description: "Entdecken Sie das heutige besondere Gericht",
      image: dishOfDayImg,
      href: "/dish-of-the-day"
    },
    {
      title: "Zutatenfinder",
      description: "Finden Sie Rezepte mit Ihren verfügbaren Zutaten",
      image: ingredientFinderImg,
      href: "/ingredient-finder"
    },
    {
      title: "Wochenkalender",
      description: "Planen und verwalten Sie Ihre Mahlzeiten der Woche",
      image: weeklyCalendarImg,
      href: "/weekly-calendar"
    }
  ];

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-8">Rezepte entdecken</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link key={index} to={category.href} className="group">
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