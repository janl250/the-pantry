import { Button } from "@/components/ui/button";
import { Menu, Utensils, LogIn, LogOut, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Navigation = () => {
  const { user, signOut, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <nav className="bg-card shadow-card py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Utensils className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">{t('nav.brand')}</span>
        </div>
        
        <div className="hidden md:flex space-x-8 items-center">
          <Link to="/recipes">
            <Button variant="ghost" className="text-foreground hover:text-primary font-medium">
              {t('nav.dishCollection')}
            </Button>
          </Link>
          <Link to="/weekly-calendar">
            <Button variant="ghost" className="text-foreground hover:text-primary font-medium">
              {t('nav.weeklyPlanner')}
            </Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLanguage('de')} className={language === 'de' ? 'bg-accent' : ''}>
                Deutsch
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-accent' : ''}>
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {t('nav.hello')}, {user?.email?.split('@')[0]}
              </span>
              <Button 
                variant="outline" 
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                {t('nav.logout')}
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                {t('nav.login')}
              </Button>
            </Link>
          )}
        </div>
        
        <Button variant="ghost" size="icon" className="md:hidden text-foreground">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </nav>
  );
};