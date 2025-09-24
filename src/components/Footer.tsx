import { Button } from "@/components/ui/button";
import { Utensils, Facebook, Instagram, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-3">
              <Utensils className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">The Pantry</span>
            </div>
            <p className="mt-2 text-secondary-foreground/80">Ihr smarter Küchenassistent</p>
          </div>
          
          <div className="flex space-x-4">
            <Button variant="ghost" size="icon" className="text-secondary-foreground hover:text-primary">
              <Facebook className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-secondary-foreground hover:text-primary">
              <Instagram className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-secondary-foreground hover:text-primary">
              <Twitter className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-secondary-foreground/60">
          <p>&copy; 2024 The Pantry. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};