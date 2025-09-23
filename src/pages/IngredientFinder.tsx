import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { getAllIngredients, filterDishesByIngredients, type Dish } from "@/data/dishes";
import { ArrowLeft, Search, ChefHat, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function IngredientFinder() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const allIngredients = getAllIngredients();
  const filteredIngredients = allIngredients.filter(ingredient => 
    ingredient.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const matchingDishes = useMemo(() => {
    return filterDishesByIngredients(selectedIngredients);
  }, [selectedIngredients]);

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => prev.filter(i => i !== ingredient));
  };

  const clearAllIngredients = () => {
    setSelectedIngredients([]);
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
              <h1 className="text-3xl font-bold text-foreground">Zutatenfinder</h1>
              <p className="text-muted-foreground mt-2">
                Wählen Sie Zutaten aus und finden Sie passende Gerichte
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Ingredient Selection */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5" />
                    Zutaten auswählen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Selected Ingredients */}
                  {selectedIngredients.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-foreground">
                          Ausgewählte Zutaten ({selectedIngredients.length})
                        </h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={clearAllIngredients}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Alle entfernen
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedIngredients.map(ingredient => (
                          <Badge 
                            key={ingredient} 
                            variant="default" 
                            className="flex items-center gap-1 cursor-pointer"
                            onClick={() => removeIngredient(ingredient)}
                          >
                            {ingredient}
                            <X className="h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Zutaten suchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Ingredient List */}
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredIngredients.map(ingredient => (
                      <div 
                        key={ingredient} 
                        className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer"
                        onClick={() => toggleIngredient(ingredient)}
                      >
                        <Checkbox 
                          checked={selectedIngredients.includes(ingredient)}
                          onChange={() => toggleIngredient(ingredient)}
                        />
                        <label className="text-sm capitalize cursor-pointer flex-1">
                          {ingredient}
                        </label>
                      </div>
                    ))}
                  </div>

                  {filteredIngredients.length === 0 && searchTerm && (
                    <p className="text-center text-muted-foreground py-4">
                      Keine Zutaten gefunden für "{searchTerm}"
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Matching Dishes */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Passende Gerichte
                    {selectedIngredients.length > 0 && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({matchingDishes.length} gefunden)
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedIngredients.length === 0 ? (
                    <div className="text-center py-8">
                      <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Wählen Sie Zutaten aus, um passende Gerichte zu finden
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {matchingDishes.map(dish => (
                        <Card key={dish.id} className="border border-border">
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-2">{dish.name}</h3>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="secondary" className="text-xs">
                                {dish.cuisine}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {dish.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {dish.cookingTime}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">Zutaten:</p>
                              <div className="flex flex-wrap gap-1">
                                {dish.tags.map((tag, index) => (
                                  <Badge 
                                    key={index} 
                                    variant={selectedIngredients.includes(tag) ? "default" : "outline"}
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {matchingDishes.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            Keine Gerichte gefunden mit den ausgewählten Zutaten.
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Versuchen Sie es mit weniger oder anderen Zutaten.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="bg-gradient-hero">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-2">Tipp</h3>
                  <p className="text-sm text-muted-foreground">
                    Je weniger Zutaten Sie auswählen, desto mehr Gerichte werden angezeigt. 
                    Beginnen Sie mit den wichtigsten Zutaten, die Sie verwenden möchten.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}