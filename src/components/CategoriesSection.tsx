import { CategoryCard } from "./CategoryCard";
import dishLibraryImg from "@/assets/dish-library.jpg";
import dishOfDayImg from "@/assets/dish-of-day.jpg";
import ingredientFinderImg from "@/assets/ingredient-finder.jpg";
import weeklyCalendarImg from "@/assets/weekly-calendar.jpg";

export const CategoriesSection = () => {
  const categories = [
    {
      title: "Dish Library",
      description: "Browse our complete collection of recipes",
      image: dishLibraryImg,
      href: "/recipes"
    },
    {
      title: "Dish of the Day",
      description: "Discover today's unique featured dish",
      image: dishOfDayImg,
      href: "/dish-of-the-day"
    },
    {
      title: "Ingredient Finder",
      description: "Find recipes using ingredients you select",
      image: ingredientFinderImg,
      href: "/ingredient-finder"
    },
    {
      title: "Weekly Calendar",
      description: "Plan and track your meals for the week",
      image: weeklyCalendarImg,
      href: "/weekly-calendar"
    }
  ];

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-8">Discover Recipes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              title={category.title}
              description={category.description}
              image={category.image}
              href={category.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
};