import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="py-16 px-4 gradient-hero">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          Was kochen wir heute?
        </h1>
        <div className="relative max-w-xl mx-auto">
          <Input 
            type="text" 
            placeholder="Was ist in Ihrem Kühlschrank?" 
            className="w-full py-6 px-6 pr-14 rounded-full shadow-card text-lg border-0 focus-visible:ring-2 focus-visible:ring-primary"
          />
          <Button 
            size="icon"
            className="absolute right-2 top-2 h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};