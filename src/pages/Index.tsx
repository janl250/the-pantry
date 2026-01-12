import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { CategoriesSection } from "@/components/CategoriesSection";
import { Footer } from "@/components/Footer";
import { WelcomeTour } from "@/components/WelcomeTour";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <CategoriesSection />
      </main>
      <Footer />
      <WelcomeTour />
    </div>
  );
};

export default Index;
