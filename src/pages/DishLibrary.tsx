import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dinnerDishes, type Dish } from "@/data/dishes";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";

export default function DishLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("all");
  const [selectedCookingTime, setSelectedCookingTime] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const cuisines = Array.from(new Set(dinnerDishes.map(dish => dish.cuisine))).sort();
  const categories = Array.from(new Set(dinnerDishes.map(dish => dish.category))).sort();

  const filteredDishes = useMemo(() => {
    return dinnerDishes.filter(dish => {
      const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dish.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCuisine = selectedCuisine === "all" || dish.cuisine === selectedCuisine;
      const matchesCookingTime = selectedCookingTime === "all" || dish.cookingTime === selectedCookingTime;
      const matchesDifficulty = selectedDifficulty === "all" || dish.difficulty === selectedDifficulty;
      const matchesCategory = selectedCategory === "all" || dish.category === selectedCategory;

      return matchesSearch && matchesCuisine && matchesCookingTime && matchesDifficulty && matchesCategory;
    });
  }, [searchTerm, selectedCuisine, selectedCookingTime, selectedDifficulty, selectedCategory]);

  const clearFilters = () => {
    setSelectedCuisine("all");
    setSelectedCookingTime("all");
    setSelectedDifficulty("all");
    setSelectedCategory("all");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dish Library</h1>
              <p className="text-muted-foreground mt-2">Discover {dinnerDishes.length} delicious dinner recipes</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search dishes or ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Filters:</span>
              </div>

              <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cuisines</SelectItem>
                  {cuisines.map(cuisine => (
                    <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCookingTime} onValueChange={setSelectedCookingTime}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Times</SelectItem>
                  <SelectItem value="quick">Quick (&lt; 30min)</SelectItem>
                  <SelectItem value="medium">Medium (30-60min)</SelectItem>
                  <SelectItem value="long">Long (&gt; 60min)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredDishes.length} of {dinnerDishes.length} dishes
            </p>
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map((dish) => (
              <Card key={dish.id} className="overflow-hidden shadow-card hover:shadow-card-hover transition-smooth hover:-translate-y-1">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">{dish.name}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary">{dish.cuisine}</Badge>
                      <Badge variant="outline">{dish.difficulty}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="capitalize">{dish.cookingTime} cooking</span>
                      <span>•</span>
                      <span className="capitalize">{dish.category}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {dish.tags.slice(0, 4).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {dish.tags.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{dish.tags.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDishes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No dishes found matching your criteria.</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}