import { Button } from "@/components/ui/button";
import { Utensils, Facebook, Instagram, Twitter, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const KOFI_URL = "https://ko-fi.com/thepantry";

export const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-secondary text-secondary-foreground py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-3">
              <div className="p-2 bg-secondary-foreground/10 rounded-full">
                <Utensils className="h-8 w-8 text-primary" />
              </div>
              <span className="text-2xl font-bold text-secondary-foreground">{t('nav.brand')}</span>
            </div>
            <p className="text-secondary-foreground/80 max-w-md">
              {t('hero.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <a href={KOFI_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="text-secondary-foreground hover:text-primary bg-secondary-foreground/10 hover:bg-secondary-foreground/20 rounded-full">
                <Heart className="h-5 w-5" />
              </Button>
            </a>
            <Button variant="ghost" size="icon" className="text-secondary-foreground hover:text-primary bg-secondary-foreground/10 hover:bg-secondary-foreground/20 rounded-full">
              <Facebook className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-secondary-foreground hover:text-primary bg-secondary-foreground/10 hover:bg-secondary-foreground/20 rounded-full">
              <Instagram className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-secondary-foreground hover:text-primary bg-secondary-foreground/10 hover:bg-secondary-foreground/20 rounded-full">
              <Twitter className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-secondary-foreground/60">
            &copy; 2024 {t('nav.brand')}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};
