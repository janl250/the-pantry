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
import { useLanguage } from "@/contexts/LanguageContext";

export default function DishLibrary() {
  const { t } = useLanguage();
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
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('dishLibrary.title')}</h1>
              <p className="text-muted-foreground mt-2">{dinnerDishes.length} {t('dishLibrary.results')}</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={t('dishLibrary.search')}
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
                  <SelectValue placeholder={t('dishLibrary.filters.cuisine')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dishLibrary.filters.all')}</SelectItem>
                  {cuisines.map(cuisine => (
                    <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCookingTime} onValueChange={setSelectedCookingTime}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('dishLibrary.filters.cookingTime')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dishLibrary.filters.all')}</SelectItem>
                  <SelectItem value="quick">{t('dishLibrary.filters.quick')}</SelectItem>
                  <SelectItem value="medium">{t('dishLibrary.filters.medium')}</SelectItem>
                  <SelectItem value="long">{t('dishLibrary.filters.long')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('dishLibrary.filters.difficulty')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dishLibrary.filters.all')}</SelectItem>
                  <SelectItem value="easy">{t('dishLibrary.filters.easy')}</SelectItem>
                  <SelectItem value="medium">{t('dishLibrary.filters.medium')}</SelectItem>
                  <SelectItem value="hard">{t('dishLibrary.filters.hard')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('dishLibrary.filters.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dishLibrary.filters.all')}</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters} className="hover:bg-accent">
                {t('dishLibrary.clearFilters')}
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredDishes.length} {t('dishLibrary.results')}
            </p>
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredDishes.map((dish) => (
              <Card key={dish.id} className="group overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{dish.name}</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{dish.cuisine}</Badge>
                      <Badge variant="outline" className="border-sage/30 text-sage hover:bg-sage/10">{dish.difficulty}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="capitalize">{dish.cookingTime} cooking</span>
                      <span>•</span>
                      <span className="capitalize">{dish.category}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {dish.tags.slice(0, 4).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-cream/50 hover:bg-cream">
                          {tag}
                        </Badge>
                      ))}
                      {dish.tags.length > 4 && (
                        <Badge variant="outline" className="text-xs bg-terracotta/10 text-terracotta">
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
            <div className="text-center py-16">
              <div className="mb-6">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto flex items-center justify-center mb-4">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('dishLibrary.noResults')}</h3>
                <p className="text-muted-foreground mb-6">{t('dishLibrary.noResultsDescription')}</p>
              </div>
              <Button variant="outline" onClick={clearFilters} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t('dishLibrary.clearFilters')}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}