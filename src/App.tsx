import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DishLibrary from "./pages/DishLibrary";
import DishOfTheDay from "./pages/DishOfTheDay";
import IngredientFinder from "./pages/IngredientFinder";
import WeeklyCalendar from "./pages/WeeklyCalendar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/recipes" element={<DishLibrary />} />
          <Route path="/dish-of-the-day" element={<DishOfTheDay />} />
          <Route path="/ingredient-finder" element={<IngredientFinder />} />
          <Route path="/weekly-calendar" element={<WeeklyCalendar />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
