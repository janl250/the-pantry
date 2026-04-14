import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';

interface BulkImportDialogProps {
  onImported: () => void;
  onLimitReached?: () => void;
}

interface ParsedDish {
  name: string;
  tags: string[];
  cookingTime: string;
  difficulty: string;
  cuisine: string;
  category: string;
}

const EXAMPLE_JSON = `[
  {
    "name": "Zürcher Geschnetzeltes",
    "tags": ["veal", "mushrooms", "cream", "white wine", "onions"],
    "cookingTime": "medium",
    "difficulty": "medium",
    "cuisine": "Swiss",
    "category": "meat"
  },
  {
    "name": "Rösti",
    "tags": ["potatoes", "butter", "salt"],
    "cookingTime": "medium",
    "difficulty": "easy",
    "cuisine": "Swiss",
    "category": "side dish"
  }
]`;

export const BulkImportDialog = ({ onImported, onLimitReached }: BulkImportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [parsedDishes, setParsedDishes] = useState<ParsedDish[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importAsGlobal, setImportAsGlobal] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  const validateDish = (dish: any, index: number): string | null => {
    if (!dish.name || typeof dish.name !== 'string') return `Gericht ${index + 1}: Name fehlt`;
    if (!dish.tags || !Array.isArray(dish.tags)) return `Gericht ${index + 1}: Tags müssen ein Array sein`;
    if (!['quick', 'medium', 'long'].includes(dish.cookingTime)) return `Gericht ${index + 1}: cookingTime muss quick/medium/long sein`;
    if (!['easy', 'medium', 'hard'].includes(dish.difficulty)) return `Gericht ${index + 1}: difficulty muss easy/medium/hard sein`;
    if (!dish.cuisine) return `Gericht ${index + 1}: Küche fehlt`;
    if (!dish.category) return `Gericht ${index + 1}: Kategorie fehlt`;
    return null;
  };

  const handleParse = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const dishes = Array.isArray(parsed) ? parsed : [parsed];

      for (let i = 0; i < dishes.length; i++) {
        const error = validateDish(dishes[i], i);
        if (error) {
          setParseError(error);
          setParsedDishes([]);
          return;
        }
      }

      setParsedDishes(dishes);
      setParseError(null);
    } catch (e) {
      setParseError(language === 'de' ? 'Ungültiges JSON-Format' : 'Invalid JSON format');
      setParsedDishes([]);
    }
  };

  const handleImport = async () => {
    if (!user || parsedDishes.length === 0) return;
    setIsImporting(true);

    try {
      if (importAsGlobal && isAdmin) {
        const rows = parsedDishes.map(d => ({
          name: d.name,
          tags: d.tags,
          cooking_time: d.cookingTime,
          difficulty: d.difficulty,
          cuisine: d.cuisine,
          category: d.category,
          added_by: user.id,
        }));

        const { error } = await supabase
          .from('global_dishes' as any)
          .insert(rows as any);

        if (error) throw error;
      } else {
        const rows = parsedDishes.map(d => ({
          user_id: user.id,
          name: d.name,
          tags: d.tags,
          cooking_time: d.cookingTime,
          difficulty: d.difficulty,
          cuisine: d.cuisine,
          category: d.category,
        }));

        const { error } = await supabase
          .from('user_dishes')
          .insert(rows);

        if (error) throw error;
      }

      toast({
        title: language === 'de' ? 'Import erfolgreich' : 'Import successful',
        description: language === 'de'
          ? `${parsedDishes.length} Gerichte importiert`
          : `${parsedDishes.length} dishes imported`,
      });

      setOpen(false);
      setJsonInput('');
      setParsedDishes([]);
      onImported();
    } catch (error: any) {
      const msg = error?.message || '';
      if (msg.includes('row-level security')) {
        toast({
          title: language === 'de' ? 'Limit erreicht' : 'Limit reached',
          description: language === 'de'
            ? 'Du hast das Maximum an eigenen Gerichten erreicht. Upgrade auf Premium für unbegrenzte Gerichte.'
            : 'You have reached the maximum number of custom dishes. Upgrade to Premium for unlimited dishes.',
          variant: 'destructive',
        });
        onLimitReached?.();
      } else {
        toast({
          title: language === 'de' ? 'Fehler beim Import' : 'Import error',
          description: msg,
          variant: 'destructive',
        });
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => {
      if (next) {
        setJsonInput('');
        setParsedDishes([]);
        setParseError(null);
        setImportAsGlobal(false);
      }
      setOpen(next);
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" onClick={(e) => {
          if (onLimitReached && !isAdmin) {
            // Let AddDishDialog handle limit check
          }
        }}>
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">{language === 'de' ? 'Massenimport' : 'Bulk Import'}</span>
          <span className="sm:hidden">Import</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            {language === 'de' ? 'Gerichte Massenimport' : 'Bulk Import Dishes'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {language === 'de'
              ? 'Füge mehrere Gerichte auf einmal hinzu, indem du sie als JSON einfügst.'
              : 'Add multiple dishes at once by pasting them as JSON.'}
          </p>

          {isAdmin && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <input
                type="checkbox"
                id="importGlobal"
                checked={importAsGlobal}
                onChange={(e) => setImportAsGlobal(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="importGlobal" className="text-sm font-medium cursor-pointer">
                {language === 'de'
                  ? '🔒 Als globale Gerichte importieren (für alle Nutzer sichtbar)'
                  : '🔒 Import as global dishes (visible to all users)'}
              </label>
            </div>
          )}

          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={EXAMPLE_JSON}
            rows={12}
            className="font-mono text-xs"
          />

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setJsonInput(EXAMPLE_JSON)}>
              {language === 'de' ? 'Beispiel einfügen' : 'Insert Example'}
            </Button>
            <Button type="button" onClick={handleParse}>
              {language === 'de' ? 'JSON prüfen' : 'Validate JSON'}
            </Button>
          </div>

          {parseError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{parseError}</p>
            </div>
          )}

          {parsedDishes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">
                  {parsedDishes.length} {language === 'de' ? 'Gerichte erkannt' : 'dishes detected'}
                </span>
              </div>

              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {parsedDishes.map((dish, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm">
                    <span className="font-medium">{dish.name}</span>
                    <Badge variant="outline" className="text-xs">{dish.cuisine}</Badge>
                    <Badge variant="secondary" className="text-xs">{dish.category}</Badge>
                    <span className="text-xs text-muted-foreground ml-auto">{dish.tags.length} Zutaten</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="w-full gap-2"
              >
                <Upload className="h-4 w-4" />
                {isImporting
                  ? (language === 'de' ? 'Wird importiert...' : 'Importing...')
                  : (language === 'de'
                    ? `${parsedDishes.length} Gerichte importieren${importAsGlobal ? ' (global)' : ''}`
                    : `Import ${parsedDishes.length} dishes${importAsGlobal ? ' (global)' : ''}`)
                }
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
