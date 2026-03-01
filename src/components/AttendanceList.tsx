import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check, X, HelpCircle, Users, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AttendanceStatus {
  user_id: string;
  status: 'attending' | 'not_attending' | 'unknown';
  display_name?: string;
}

interface AttendanceListProps {
  groupId: string;
  dayKey: string;
  weekStartDate: string;
  userId: string;
}

export function AttendanceList({ groupId, dayKey, weekStartDate, userId }: AttendanceListProps) {
  const { language } = useLanguage();
  const [attendance, setAttendance] = useState<AttendanceStatus[]>([]);
  const [groupMembers, setGroupMembers] = useState<{ id: string; display_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadData();
    
    const channel = supabase
      .channel(`attendance-list-${groupId}-${dayKey}-${weekStartDate}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_attendance',
          filter: `group_id=eq.${groupId}`
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, dayKey, weekStartDate]);

  const loadData = async () => {
    try {
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      const memberIds = members?.map(m => m.user_id) || [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', memberIds);

      if (profilesError) throw profilesError;

      const membersWithNames = memberIds.map(id => ({
        id,
        display_name: profiles?.find(p => p.id === id)?.display_name || 'Unknown'
      }));
      setGroupMembers(membersWithNames);

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('meal_attendance')
        .select('user_id, status')
        .eq('group_id', groupId)
        .eq('day_of_week', dayKey)
        .eq('week_start_date', weekStartDate);

      if (attendanceError) throw attendanceError;

      if (attendanceData) {
        const attendanceWithNames = attendanceData.map(a => ({
          ...a,
          status: a.status as 'attending' | 'not_attending' | 'unknown',
          display_name: profiles?.find(p => p.id === a.user_id)?.display_name || 'Unknown'
        }));
        setAttendance(attendanceWithNames);
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: 'attending' | 'not_attending' | 'unknown') => {
    try {
      await supabase
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
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const getStatusForUser = (memberId: string): 'attending' | 'not_attending' | 'unknown' => {
    const userAttendance = attendance.find(a => a.user_id === memberId);
    return userAttendance?.status || 'unknown';
  };

  const getStatusIcon = (status: 'attending' | 'not_attending' | 'unknown') => {
    switch (status) {
      case 'attending':
        return <Check className="h-3.5 w-3.5" />;
      case 'not_attending':
        return <X className="h-3.5 w-3.5" />;
      default:
        return <HelpCircle className="h-3.5 w-3.5" />;
    }
  };

  const getStatusBg = (status: 'attending' | 'not_attending' | 'unknown') => {
    switch (status) {
      case 'attending':
        return 'bg-accent/60 border-primary/30';
      case 'not_attending':
        return 'bg-destructive/10 border-destructive/30';
      default:
        return 'bg-muted border-border';
    }
  };

  const myStatus = getStatusForUser(userId);
  const attendingCount = groupMembers.filter(m => getStatusForUser(m.id) === 'attending').length;
  const notAttendingCount = groupMembers.filter(m => getStatusForUser(m.id) === 'not_attending').length;

  if (loading) {
    return (
      <div className="mt-2 p-2 rounded-lg bg-muted/50 border border-dashed border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{language === 'de' ? 'Lade...' : 'Loading...'}</span>
        </div>
      </div>
    );
  }

  const handleStatusClick = (status: 'attending' | 'not_attending' | 'unknown') => {
    updateStatus(status);
  };

  return (
    <div 
      className="mt-3 w-full rounded-lg bg-muted/30 border border-border overflow-hidden"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* My status buttons */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{language === 'de' ? 'Bist du dabei?' : 'Will you attend?'}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            className={cn(
              "flex items-center justify-center gap-1.5 h-11 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer select-none active:scale-95",
              myStatus === 'attending'
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:border-primary/50"
            )}
            onClick={() => handleStatusClick('attending')}
          >
            <Check className="h-4 w-4" />
            {language === 'de' ? 'Ja' : 'Yes'}
          </button>
          <button
            type="button"
            className={cn(
              "flex items-center justify-center gap-1.5 h-11 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer select-none active:scale-95",
              myStatus === 'unknown'
                ? "bg-secondary text-secondary-foreground border-secondary"
                : "bg-background text-foreground border-border hover:border-secondary/50"
            )}
            onClick={() => handleStatusClick('unknown')}
          >
            <HelpCircle className="h-4 w-4" />
            {language === 'de' ? 'Vllt' : 'Maybe'}
          </button>
          <button
            type="button"
            className={cn(
              "flex items-center justify-center gap-1.5 h-11 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer select-none active:scale-95",
              myStatus === 'not_attending'
                ? "bg-destructive text-destructive-foreground border-destructive"
                : "bg-background text-foreground border-border hover:border-destructive/50"
            )}
            onClick={() => handleStatusClick('not_attending')}
          >
            <X className="h-4 w-4" />
            {language === 'de' ? 'Nein' : 'No'}
          </button>
        </div>
      </div>

      {/* Summary + expand toggle */}
      <button
        type="button"
        className="w-full px-3 py-2 flex items-center justify-between border-t border-border hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-primary font-medium">
            <Check className="h-3 w-3" />{attendingCount}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="flex items-center gap-1 text-destructive font-medium">
            <X className="h-3 w-3" />{notAttendingCount}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Details</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      {/* Expandable member list */}
      {expanded && (
        <div className="px-3 pb-3 space-y-1 border-t border-border pt-2">
          {groupMembers.map((member) => {
            const status = getStatusForUser(member.id);
            const isCurrentUser = member.id === userId;
            
            return (
              <div 
                key={member.id}
                className={cn(
                  "flex items-center justify-between py-1.5 px-2.5 rounded-md text-xs border",
                  getStatusBg(status),
                  isCurrentUser && "ring-1 ring-primary/50"
                )}
              >
                <span className={cn("truncate", isCurrentUser && "font-semibold")}>
                  {member.display_name}
                  {isCurrentUser && (
                    <span className="text-muted-foreground font-normal ml-1">
                      ({language === 'de' ? 'Du' : 'You'})
                    </span>
                  )}
                </span>
                <span className={cn(
                  status === 'attending' && "text-primary",
                  status === 'not_attending' && "text-destructive",
                  status === 'unknown' && "text-muted-foreground"
                )}>
                  {getStatusIcon(status)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}