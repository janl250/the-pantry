import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface LoadingSkeletonProps {
  type: 'dish-card' | 'dish-grid' | 'calendar' | 'group-card' | 'group-grid' | 'list';
  count?: number;
}

function DishCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function GroupCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <div className="p-3 bg-muted rounded-lg">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </CardContent>
    </Card>
  );
}

function CalendarDaySkeleton() {
  return (
    <Card className="min-h-[120px]">
      <CardHeader className="p-3 pb-2">
        <Skeleton className="h-4 w-20" />
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <Skeleton className="h-8 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

export function LoadingSkeleton({ type, count = 6 }: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  switch (type) {
    case 'dish-card':
      return <DishCardSkeleton />;
    
    case 'dish-grid':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((_, i) => (
            <DishCardSkeleton key={i} />
          ))}
        </div>
      );
    
    case 'group-card':
      return <GroupCardSkeleton />;
    
    case 'group-grid':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((_, i) => (
            <GroupCardSkeleton key={i} />
          ))}
        </div>
      );
    
    case 'calendar':
      return (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <CalendarDaySkeleton key={i} />
          ))}
        </div>
      );
    
    case 'list':
      return (
        <div className="divide-y">
          {items.map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      );
    
    default:
      return null;
  }
}
