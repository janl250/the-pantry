import { Button } from "@/components/ui/button";
import { Menu, Utensils } from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="bg-card shadow-card py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Utensils className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">The Pantry</span>
        </div>
        
        <div className="hidden md:flex space-x-8">
          <Button variant="ghost" className="text-foreground hover:text-primary font-medium">
            Browse
          </Button>
          <Button variant="ghost" className="text-foreground hover:text-primary font-medium">
            Meal Planner
          </Button>
          <Button variant="ghost" className="text-foreground hover:text-primary font-medium">
            My Pantry
          </Button>
          <Button variant="ghost" className="text-foreground hover:text-primary font-medium">
            Login
          </Button>
        </div>
        
        <Button variant="ghost" size="icon" className="md:hidden text-foreground">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </nav>
  );
};