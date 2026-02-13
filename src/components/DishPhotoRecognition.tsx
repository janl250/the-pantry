import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Loader2, Plus, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { dinnerDishes, type Dish } from "@/data/dishes";

interface RecognizedDish {
  name: string;
  description: string;
  category: string;
  cuisine: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cookingTime: 'quick' | 'medium' | 'long';
  tags: string[];
  confidence: number;
  existsInCollection: boolean;
  existingName: string | null;
}

interface DishPhotoRecognitionProps {
  userDishes: Dish[];
  onDishAdded?: () => void;
}

export function DishPhotoRecognition({ userDishes, onDishAdded }: DishPhotoRecognitionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language, translateField } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognizedDish, setRecognizedDish] = useState<RecognizedDish | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: language === 'de' ? 'Ungültiges Format' : 'Invalid format',
        description: language === 'de' ? 'Bitte wähle ein Bild aus.' : 'Please select an image.',
        variant: 'destructive',
      });
      return;
    }

    // Show preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setRecognizedDish(null);

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageBase64: string) => {
    setIsAnalyzing(true);
    try {
      const allDishNames = [
        ...dinnerDishes.map(d => d.name),
        ...userDishes.map(d => d.name)
      ];

      const { data, error } = await supabase.functions.invoke('dish-photo-recognition', {
        body: { imageBase64, language, existingDishes: allDishNames }
      });

      if (error) throw error;

      if (data?.dish) {
        setRecognizedDish(data.dish);
      }
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: error.message || (language === 'de' ? 'Analyse fehlgeschlagen' : 'Analysis failed'),
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addToCollection = async () => {
    if (!user || !recognizedDish) return;

    setIsAdding(true);
    try {
      const { error } = await supabase.from('user_dishes').insert({
        user_id: user.id,
        name: recognizedDish.name,
        category: recognizedDish.category,
        cuisine: recognizedDish.cuisine,
        difficulty: recognizedDish.difficulty,
        cooking_time: recognizedDish.cookingTime,
        tags: recognizedDish.tags,
      });

      if (error) throw error;

      toast({
        title: language === 'de' ? 'Gericht hinzugefügt!' : 'Dish added!',
        description: recognizedDish.name,
      });

      setRecognizedDish(null);
      setPreviewUrl(null);
      onDishAdded?.();
    } catch (error: any) {
      console.error('Error adding dish:', error);
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const reset = () => {
    setRecognizedDish(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Camera className="h-5 w-5" />
          {language === 'de' ? 'Gericht per Foto erkennen' : 'Recognize Dish by Photo'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!previewUrl ? (
          <div
            className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {language === 'de'
                ? 'Foto eines fertigen Gerichts hochladen'
                : 'Upload a photo of a finished dish'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'de' ? 'JPG, PNG oder WebP' : 'JPG, PNG or WebP'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Dish"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 bg-background/80 backdrop-blur-sm rounded-full"
                onClick={reset}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isAnalyzing && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  {language === 'de' ? 'Analysiere Gericht...' : 'Analyzing dish...'}
                </span>
              </div>
            )}

            {recognizedDish && (
              <div className="space-y-3 p-4 bg-accent/30 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{recognizedDish.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(recognizedDish.confidence * 100)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{recognizedDish.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-xs">
                    {translateField('cuisine', recognizedDish.cuisine)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {translateField('difficulty', recognizedDish.difficulty)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {translateField('cookingTime', recognizedDish.cookingTime)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {translateField('category', recognizedDish.category)}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {recognizedDish.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {translateField('ingredient', tag)}
                    </Badge>
                  ))}
                </div>

                {recognizedDish.existsInCollection ? (
                  <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">
                      {language === 'de'
                        ? `"${recognizedDish.existingName || recognizedDish.name}" ist bereits in der Sammlung`
                        : `"${recognizedDish.existingName || recognizedDish.name}" already exists in collection`}
                    </span>
                  </div>
                ) : user ? (
                  <Button
                    onClick={addToCollection}
                    disabled={isAdding}
                    className="w-full"
                    size="sm"
                  >
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {language === 'de' ? 'Zur Sammlung hinzufügen' : 'Add to Collection'}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    {language === 'de' ? 'Bitte anmelden um Gerichte hinzuzufügen' : 'Please log in to add dishes'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </CardContent>
    </Card>
  );
}
