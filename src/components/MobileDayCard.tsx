import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, X, RefreshCw, GripVertical, StickyNote, BookmarkPlus, ChevronDown, ChevronUp, UtensilsCrossed } from "lucide-react";
import { AttendanceList } from "@/components/AttendanceList";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { Dish } from "@/data/dishes";

interface MealData {
  dish: Dish | null;
  isLeftover: boolean;
  leftoverOf?: string;
  notes?: string;
}

interface MobileDayCardProps {
  dayKey: string;
  dayLabel: string;
  shortLabel: string;
  isToday: boolean;
  mealData: MealData;
  profiles: { [key: string]: string };
  selectedGroupId: string | null;
  onRemoveDish: (day: string) => void;
  onShowDishSelector: (day: string | null) => void;
  onShowLeftoverSelector: (day: string | null) => void;
  onAddDishToLibrary: (dish: Dish) => void;
  isDishInLibrary: (dishName: string) => boolean;
  translateField: (type: 'cuisine' | 'difficulty' | 'cookingTime' | 'category' | 'ingredient', value: string) => string;
  language: string;
  t: (key: string) => string;
  availableLeftoversCount: number;
  isDragging: boolean;
  onEditNote: (day: string) => void;
  weekStartDate: string;
  userId: string;
}

export function MobileDayCard({
  dayKey,
  dayLabel,
  shortLabel,
  isToday,
  mealData,
  profiles,
  selectedGroupId,
  onRemoveDish,
  onShowDishSelector,
  onShowLeftoverSelector,
  onAddDishToLibrary,
  isDishInLibrary,
  translateField,
  language,
  t,
  availableLeftoversCount,
  isDragging,
  onEditNote,
  weekStartDate,
  userId,
}: MobileDayCardProps) {
  const [expanded, setExpanded] = useState(false);

  const { attributes, listeners, setNodeRef: setDragRef, transform } = useDraggable({
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
    zIndex: 50,
  } : undefined;

  const handleCardClick = () => {
    if (!isDragging) {
      setExpanded(!expanded);
    }
  };

  // Compact collapsed view
  if (!expanded) {
    return (
      <div ref={setDropRef} className="relative">
        <Card
          ref={setDragRef}
          style={style}
          className={cn(
            'transition-all cursor-pointer hover:shadow-md border-border/60',
            isToday && 'ring-2 ring-primary shadow-md shadow-primary/20 bg-primary/5',
            isDragging && 'opacity-50 scale-105',
            isOver && !isDragging && 'ring-2 ring-accent bg-accent/10',
            mealData.dish && 'cursor-grab active:cursor-grabbing'
          )}
          onClick={handleCardClick}
          {...(mealData.dish ? { ...attributes, ...listeners } : {})}
        >
          <CardContent className="p-3.5">
            <div className="flex items-center gap-3">
              {/* Day label */}
              <div className={cn(
                "w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 shadow-sm",
                isToday 
                  ? "bg-primary text-primary-foreground shadow-primary/30" 
                  : mealData.dish 
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
              )}>
                <span className="text-sm font-bold leading-none">{shortLabel}</span>
                {isToday && (
                  <span className="text-[8px] font-medium leading-none mt-0.5 opacity-80">
                    {language === 'de' ? 'Heute' : 'Today'}
                  </span>
                )}
              </div>
              
              {/* Dish info or empty state */}
              <div className="flex-1 min-w-0">
                {mealData.dish ? (
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {mealData.dish.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                          {translateField('cuisine', mealData.dish.cuisine)}
                        </Badge>
                        {mealData.isLeftover && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-blue-300 text-blue-600 dark:text-blue-400">
                            <RefreshCw className="w-2.5 h-2.5 mr-0.5" />
                            Rest
                          </Badge>
                        )}
                        {mealData.notes && (
                          <StickyNote className="h-3 w-3 text-primary shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    <p className="text-sm text-muted-foreground/60">
                      {language === 'de' ? 'Tippe um Gericht zu wählen' : 'Tap to add a dish'}
                    </p>
                  </div>
                )}
              </div>

              {/* Expand icon */}
              <div className="shrink-0 w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center">
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expanded view with all details
  return (
    <div ref={setDropRef} className="relative">
      <Card
        ref={setDragRef}
        style={style}
        className={cn(
          'transition-all',
          isToday && 'ring-2 ring-primary shadow-lg shadow-primary/20',
          isDragging && 'opacity-50 scale-105',
          isOver && !isDragging && 'ring-2 ring-accent bg-accent/10'
        )}
      >
        <CardHeader 
          className={cn('py-2.5 px-3 cursor-pointer', isToday && 'bg-primary/10')}
          onClick={handleCardClick}
        >
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              {mealData.dish && (
                <GripVertical 
                  className="h-4 w-4 text-muted-foreground cursor-grab" 
                  {...(mealData.dish ? { ...attributes, ...listeners } : {})}
                />
              )}
              <span>{dayLabel}</span>
              {isToday && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  {language === 'de' ? 'Heute' : 'Today'}
                </Badge>
              )}
            </div>
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          {mealData.dish ? (
            <>
              {/* Dish card */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 z-10"
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
                    <h4 className="font-medium text-sm text-foreground">
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

              {/* Notes section */}
              {mealData.notes ? (
                <button
                  className="w-full text-left p-2 rounded-md bg-muted/50 border border-dashed border-muted-foreground/30 hover:bg-muted transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditNote(dayKey);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start gap-2">
                    <StickyNote className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground">{mealData.notes}</span>
                  </div>
                </button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditNote(dayKey);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <StickyNote className="h-3 w-3 mr-1" />
                  {t('weeklyCalendar.addNote')}
                </Button>
              )}

              {/* Attendance section - only for groups */}
              {selectedGroupId && userId && (
                <AttendanceList
                  groupId={selectedGroupId}
                  dayKey={dayKey}
                  weekStartDate={weekStartDate}
                  userId={userId}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-1">
                <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
              </div>
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowDishSelector(dayKey);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                {language === 'de' ? 'Gericht hinzufügen' : 'Add Dish'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowLeftoverSelector(dayKey);
                }}
                disabled={availableLeftoversCount === 0}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {t('leftovers.add')}
              </Button>
              {/* Attendance section - also when no dish */}
              {selectedGroupId && userId && (
                <AttendanceList
                  groupId={selectedGroupId}
                  dayKey={dayKey}
                  weekStartDate={weekStartDate}
                  userId={userId}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
