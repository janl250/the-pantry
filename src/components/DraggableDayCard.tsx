import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, RefreshCw, GripVertical, BookmarkPlus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { type Dish } from '@/data/dishes';

interface MealData {
  dish: Dish | null;
  isLeftover: boolean;
  leftoverOf?: string;
}

interface DraggableDayCardProps {
  dayKey: string;
  dayLabel: string;
  isToday: boolean;
  mealData: MealData;
  profiles: { [key: string]: string };
  selectedGroupId: string | null;
  onRemoveDish: (day: string) => void;
  onShowDishSelector: (day: string) => void;
  onShowLeftoverSelector: (day: string) => void;
  onAddDishToLibrary: (dish: Dish) => void;
  isDishInLibrary: (dishName: string) => boolean;
}

export function DraggableDayCard({
  dayKey,
  dayLabel,
  isToday,
  mealData,
  profiles,
  selectedGroupId,
  onRemoveDish,
  onShowDishSelector,
  onShowLeftoverSelector,
  onAddDishToLibrary,
  isDishInLibrary,
}: DraggableDayCardProps) {
  const { t, language, translateField } = useLanguage();
  
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: dayKey,
    data: { dayKey, mealData },
    disabled: !mealData.dish,
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${dayKey}`,
    data: { dayKey },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div ref={setDropRef} className="relative">
      <Card 
        ref={setDragRef}
        style={style}
        className={cn(
          'h-64 transition-all',
          isToday && 'ring-2 ring-primary shadow-lg shadow-primary/20',
          isDragging && 'opacity-50 scale-105 z-50',
          isOver && !isDragging && 'ring-2 ring-accent bg-accent/10',
          mealData.dish && 'cursor-grab active:cursor-grabbing'
        )}
        {...attributes}
        {...listeners}
      >
        <CardHeader className={cn('pb-3', isToday && 'bg-primary/10')}>
          <CardTitle className="text-sm font-medium text-center flex items-center justify-center gap-2">
            {mealData.dish && (
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            )}
            {dayLabel}
            {isToday && (
              <Badge variant="default" className="text-xs">
                {t('weeklyCalendar.today')}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 h-full">
          {mealData.dish ? (
            <div className="space-y-3">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveDish(dayKey);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className={cn(
                  'bg-accent/50 border border-border p-3 rounded-lg',
                  mealData.isLeftover && 'border-l-4 border-l-blue-400'
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-foreground line-clamp-2">
                      {mealData.dish.name}
                    </h4>
                    {mealData.isLeftover && (
                      <Badge variant="secondary" className="text-xs">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        {t('leftovers.title')}
                      </Badge>
                    )}
                  </div>
                  {mealData.isLeftover && mealData.leftoverOf && (
                    <div className="text-xs text-muted-foreground mb-2">
                      {t('leftovers.from')}: {mealData.leftoverOf}
                    </div>
                  )}
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">
                      {translateField('cuisine', mealData.dish.cuisine)}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {translateField('cookingTime', mealData.dish.cookingTime)}
                    </div>
                    {selectedGroupId && (mealData.dish as any).addedBy && (
                      <div className="text-xs text-muted-foreground">
                        {language === 'de' ? 'Hinzugefügt von' : 'Added by'}: {profiles[(mealData.dish as any).addedBy] || 'Loading...'}
                      </div>
                    )}
                    {selectedGroupId && (mealData.dish as any).isUserDish && 
                     !isDishInLibrary(mealData.dish.name) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddDishToLibrary(mealData.dish!);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <BookmarkPlus className="h-3 w-3 mr-1" />
                        {language === 'de' ? 'Zu meiner Sammlung' : 'Add to my library'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <Button
                variant="ghost"
                className="w-full h-16 border-2 border-dashed border-muted hover:border-primary hover:bg-primary/5 flex items-center justify-center gap-2"
                onClick={() => onShowDishSelector(dayKey)}
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {language === 'de' ? 'Gericht hinzufügen' : 'Add Dish'}
                </span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={() => onShowLeftoverSelector(dayKey)}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {t('leftovers.add')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}