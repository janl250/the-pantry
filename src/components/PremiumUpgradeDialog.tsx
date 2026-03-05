import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, ChefHat, Users, Sparkles, Camera, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PremiumUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

export function PremiumUpgradeDialog({ open, onOpenChange, feature }: PremiumUpgradeDialogProps) {
  const { language } = useLanguage();

  const benefits = language === 'de' ? [
    { icon: ChefHat, text: "Unbegrenzt eigene Gerichte erstellen" },
    { icon: Users, text: "Unbegrenzt Gruppen & Mitglieder" },
    { icon: Calendar, text: "KI-Wochenplan-Generator" },
    { icon: Sparkles, text: "KI-Zutaten-Rezeptgenerator" },
    { icon: Camera, text: "KI-Foto-Erkennung" },
  ] : [
    { icon: ChefHat, text: "Create unlimited custom dishes" },
    { icon: Users, text: "Unlimited groups & members" },
    { icon: Calendar, text: "AI weekly plan generator" },
    { icon: Sparkles, text: "AI ingredient recipe generator" },
    { icon: Camera, text: "AI photo recognition" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="h-6 w-6 text-yellow-500" />
            {language === 'de' ? 'Premium freischalten' : 'Unlock Premium'}
          </DialogTitle>
          <DialogDescription>
            {feature && (
              <Badge variant="secondary" className="mb-2">
                {feature}
              </Badge>
            )}
            {language === 'de'
              ? 'Schalte alle Funktionen frei und genieße The Pantry ohne Einschränkungen.'
              : 'Unlock all features and enjoy The Pantry without limits.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <benefit.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-foreground">{benefit.text}</span>
            </div>
          ))}
        </div>

        <div className="bg-muted rounded-lg p-4 text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            {language === 'de'
              ? 'Unterstütze The Pantry mit einer Spende und erhalte Premium-Zugang!'
              : 'Support The Pantry with a donation and get Premium access!'}
          </p>
          <a href="https://ko-fi.com/thepantry" target="_blank" rel="noopener noreferrer">
            <Button className="w-full gap-2 mt-2">
              <Heart className="h-4 w-4" />
              {language === 'de' ? 'Auf Ko-fi unterstützen' : 'Support on Ko-fi'}
            </Button>
          </a>
        </div>

        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
          {language === 'de' ? 'Verstanden' : 'Got it'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
