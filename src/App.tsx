import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import Index from "./pages/Index";
import DishLibrary from "./pages/DishLibrary";
import DishOfTheDay from "./pages/DishOfTheDay";
import IngredientFinder from "./pages/IngredientFinder";
import WeeklyCalendar from "./pages/WeeklyCalendar";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import Statistics from "./pages/Statistics";
import RecipeGenerator from "./pages/RecipeGenerator";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Keyboard shortcuts wrapper component
function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <KeyboardShortcutsProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/recipes" element={<DishLibrary />} />
              <Route path="/dish-of-the-day" element={<DishOfTheDay />} />
              <Route path="/ingredient-finder" element={<IngredientFinder />} />
              <Route path="/weekly-calendar" element={<WeeklyCalendar />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/groups/:groupId" element={<GroupDetail />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/recipe-generator" element={<RecipeGenerator />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth" element={<Auth />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </KeyboardShortcutsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
