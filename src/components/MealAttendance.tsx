import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check, X, HelpCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceStatus {
  user_id: string;
  status: 'attending' | 'not_attending' | 'unknown';
  display_name?: string;
}

interface MealAttendanceProps {
  groupId: string;
  dayKey: string;
  weekStartDate: string;
  userId: string;
  hasMeal: boolean;
}

export function MealAttendance({ groupId, dayKey, weekStartDate, userId, hasMeal }: MealAttendanceProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<AttendanceStatus[]>([]);
  const [myStatus, setMyStatus] = useState<'attending' | 'not_attending' | 'unknown'>('unknown');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAttendance();
    
    // Realtime subscription
    const channel = supabase
      .channel(`attendance-${groupId}-${dayKey}-${weekStartDate}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_attendance',
          filter: `group_id=eq.${groupId}`
        },
        () => {
          loadAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, dayKey, weekStartDate]);

  const loadAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_attendance')
        .select('user_id, status')
        .eq('group_id', groupId)
        .eq('day_of_week', dayKey)
        .eq('week_start_date', weekStartDate);

      if (error) throw error;

      if (data) {
        // Load profiles for display names
        const userIds = data.map(a => a.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds);

        const attendanceWithNames = data.map(a => ({
          ...a,
          status: a.status as 'attending' | 'not_attending' | 'unknown',
          display_name: profiles?.find(p => p.id === a.user_id)?.display_name || 'Unknown'
        }));

        setAttendance(attendanceWithNames);
        
        const myAttendance = data.find(a => a.user_id === userId);
        if (myAttendance) {
          setMyStatus(myAttendance.status as 'attending' | 'not_attending' | 'unknown');
        } else {
          setMyStatus('unknown');
        }
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const updateStatus = async (status: 'attending' | 'not_attending' | 'unknown') => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('meal_attendance')
        .upsert({
          group_id: groupId,
          user_id: userId,
          day_of_week: dayKey,
          week_start_date: weekStartDate,
          status: status
        }, {
          onConflict: 'group_id,user_id,day_of_week,week_start_date'
        });

      if (error) throw error;

      setMyStatus(status);
      
      toast({
        title: language === 'de' ? 'Status aktualisiert' : 'Status updated',
        duration: 2000
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: language === 'de' ? 'Fehler beim Aktualisieren' : 'Error updating',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const attendingCount = attendance.filter(a => a.status === 'attending').length;
  const notAttendingCount = attendance.filter(a => a.status === 'not_attending').length;

  const getStatusIcon = (status: 'attending' | 'not_attending' | 'unknown') => {
    switch (status) {
      case 'attending':
        return <Check className="h-3 w-3" />;
      case 'not_attending':
        return <X className="h-3 w-3" />;
      default:
        return <HelpCircle className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: 'attending' | 'not_attending' | 'unknown') => {
    switch (status) {
      case 'attending':
        return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'not_attending':
        return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  if (!hasMeal) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 px-2 text-xs gap-1 border",
            getStatusColor(myStatus)
          )}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Users className="h-3 w-3" />
          {attendingCount > 0 && (
            <span className="text-green-600 dark:text-green-400">{attendingCount}</span>
          )}
          {notAttendingCount > 0 && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-red-600 dark:text-red-400">{notAttendingCount}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-3" 
        align="center"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          <div className="text-sm font-medium">
            {language === 'de' ? 'Bist du dabei?' : 'Will you attend?'}
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={myStatus === 'attending' ? 'default' : 'outline'}
              className={cn(
                "flex-1 h-8",
                myStatus === 'attending' && "bg-green-600 hover:bg-green-700"
              )}
              onClick={() => updateStatus('attending')}
              disabled={loading}
            >
              <Check className="h-4 w-4 mr-1" />
              {language === 'de' ? 'Ja' : 'Yes'}
            </Button>
            <Button
              size="sm"
              variant={myStatus === 'not_attending' ? 'default' : 'outline'}
              className={cn(
                "flex-1 h-8",
                myStatus === 'not_attending' && "bg-red-600 hover:bg-red-700"
              )}
              onClick={() => updateStatus('not_attending')}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-1" />
              {language === 'de' ? 'Nein' : 'No'}
            </Button>
          </div>

          {attendance.length > 0 && (
            <div className="border-t pt-3 mt-3">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                {language === 'de' ? 'Antworten' : 'Responses'}
              </div>
              <div className="space-y-1">
                {attendance.map((a) => (
                  <div 
                    key={a.user_id} 
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate">{a.display_name}</span>
                    <Badge 
                      variant="outline" 
                      className={cn("h-5 px-1.5", getStatusColor(a.status))}
                    >
                      {getStatusIcon(a.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}