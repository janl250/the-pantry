import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const HeroSection = () => {
  const { t } = useLanguage();
  
  return (
    <section className="relative min-h-[80vh] gradient-hero flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20"></div>
      <div className="relative max-w-4xl mx-auto text-center z-10">
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
            <ChefHat className="h-16 w-16 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight">
          {t('hero.title')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          {t('hero.subtitle')}
        </p>
        <Link to="/recipes">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {t('hero.cta')}
          </Button>
        </Link>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-terracotta/20 to-sage/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-tr from-sage/20 to-terracotta/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 right-20 w-16 h-16 bg-gradient-to-bl from-primary/20 to-secondary/20 rounded-full blur-lg"></div>
    </section>
  );
};