import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check, X, HelpCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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
  hasMeal: boolean;
}

export function AttendanceList({ groupId, dayKey, weekStartDate, userId, hasMeal }: AttendanceListProps) {
  const { language } = useLanguage();
  const [attendance, setAttendance] = useState<AttendanceStatus[]>([]);
  const [groupMembers, setGroupMembers] = useState<{ id: string; display_name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Realtime subscription
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
      // Load group members
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      const memberIds = members?.map(m => m.user_id) || [];

      // Load profiles for all group members
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

      // Load attendance
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
        return <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />;
      case 'not_attending':
        return <X className="h-3 w-3 text-destructive" />;
      default:
        return <HelpCircle className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getStatusBg = (status: 'attending' | 'not_attending' | 'unknown') => {
    switch (status) {
      case 'attending':
        return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
      case 'not_attending':
        return 'bg-destructive/10 border-destructive/30';
      default:
        return 'bg-muted border-border';
    }
  };

  const myStatus = getStatusForUser(userId);

  if (!hasMeal) return null;

  if (loading) {
    return (
      <div className="mt-2 p-2 rounded-md bg-muted/50 border border-dashed border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{language === 'de' ? 'Laden...' : 'Loading...'}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="mt-2 p-2 rounded-md bg-muted/30 border border-border space-y-2"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header with my status toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Users className="h-3 w-3" />
          {language === 'de' ? 'Anwesenheit' : 'Attendance'}
        </div>
        
        {/* Quick toggle buttons for current user */}
        <div className="flex gap-1">
          <button
            className={cn(
              "p-1 rounded transition-colors border",
              myStatus === 'attending' 
                ? 'bg-emerald-500 dark:bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500' 
                : 'bg-background hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-border'
            )}
            onClick={() => updateStatus('attending')}
            title={language === 'de' ? 'Ich bin dabei' : 'I will attend'}
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            className={cn(
              "p-1 rounded transition-colors border",
              myStatus === 'unknown' 
                ? 'bg-muted-foreground text-background border-muted' 
                : 'bg-background hover:bg-muted border-border'
            )}
            onClick={() => updateStatus('unknown')}
            title={language === 'de' ? 'Weiß nicht' : 'Not sure'}
          >
            <HelpCircle className="h-3 w-3" />
          </button>
          <button
            className={cn(
              "p-1 rounded transition-colors border",
              myStatus === 'not_attending' 
                ? 'bg-destructive text-destructive-foreground border-destructive' 
                : 'bg-background hover:bg-destructive/10 border-border'
            )}
            onClick={() => updateStatus('not_attending')}
            title={language === 'de' ? 'Nicht dabei' : 'Not attending'}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Member list */}
      <div className="space-y-1">
        {groupMembers.map((member) => {
          const status = getStatusForUser(member.id);
          const isCurrentUser = member.id === userId;
          
          return (
            <div 
              key={member.id}
              className={cn(
                "flex items-center justify-between py-1 px-2 rounded text-xs border",
                getStatusBg(status),
                isCurrentUser && "ring-1 ring-primary/50"
              )}
            >
              <span className={cn(
                "truncate max-w-[100px]",
                isCurrentUser && "font-medium"
              )}>
                {member.display_name}
                {isCurrentUser && (
                  <span className="text-muted-foreground ml-1">
                    ({language === 'de' ? 'Du' : 'You'})
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1">
                {getStatusIcon(status)}
                <span className={cn(
                  "text-[10px]",
                  status === 'attending' && "text-emerald-600 dark:text-emerald-400",
                  status === 'not_attending' && "text-destructive",
                  status === 'unknown' && "text-muted-foreground"
                )}>
                  {status === 'attending' && (language === 'de' ? 'Ja' : 'Yes')}
                  {status === 'not_attending' && (language === 'de' ? 'Nein' : 'No')}
                  {status === 'unknown' && (language === 'de' ? '?' : '?')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {groupMembers.length > 0 && (
        <div className="flex items-center justify-center gap-3 pt-1 border-t border-border text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Check className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
            {groupMembers.filter(m => getStatusForUser(m.id) === 'attending').length}
          </span>
          <span className="flex items-center gap-1">
            <HelpCircle className="h-2.5 w-2.5 text-muted-foreground" />
            {groupMembers.filter(m => getStatusForUser(m.id) === 'unknown').length}
          </span>
          <span className="flex items-center gap-1">
            <X className="h-2.5 w-2.5 text-destructive" />
            {groupMembers.filter(m => getStatusForUser(m.id) === 'not_attending').length}
          </span>
        </div>
      )}
    </div>
  );
}
