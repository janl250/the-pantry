import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check, X, HelpCircle, Users, ChevronDown, ChevronUp } from "lucide-react";
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
  const [expanded, setExpanded] = useState(false);

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
        return <Check className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />;
      case 'not_attending':
        return <X className="h-2.5 w-2.5 text-destructive" />;
      default:
        return <HelpCircle className="h-2.5 w-2.5 text-muted-foreground" />;
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
  const attendingCount = groupMembers.filter(m => getStatusForUser(m.id) === 'attending').length;
  const notAttendingCount = groupMembers.filter(m => getStatusForUser(m.id) === 'not_attending').length;
  const unknownCount = groupMembers.filter(m => getStatusForUser(m.id) === 'unknown').length;

  if (!hasMeal) return null;

  if (loading) {
    return (
      <div className="mt-2 p-1.5 rounded-md bg-muted/50 border border-dashed border-border">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Users className="h-2.5 w-2.5" />
          <span>{language === 'de' ? '...' : '...'}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="mt-2 rounded-md bg-muted/30 border border-border overflow-hidden"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Compact header - always visible */}
      <button
        className="w-full p-1.5 flex items-center justify-between hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {/* Quick status buttons */}
          <div className="flex gap-0.5">
            <button
              className={cn(
                "p-0.5 rounded transition-colors",
                myStatus === 'attending' 
                  ? 'bg-emerald-500 dark:bg-emerald-600 text-white' 
                  : 'bg-muted hover:bg-emerald-100 dark:hover:bg-emerald-950/30'
              )}
              onClick={(e) => { e.stopPropagation(); updateStatus('attending'); }}
            >
              <Check className="h-2.5 w-2.5" />
            </button>
            <button
              className={cn(
                "p-0.5 rounded transition-colors",
                myStatus === 'unknown' 
                  ? 'bg-muted-foreground text-background' 
                  : 'bg-muted hover:bg-muted-foreground/20'
              )}
              onClick={(e) => { e.stopPropagation(); updateStatus('unknown'); }}
            >
              <HelpCircle className="h-2.5 w-2.5" />
            </button>
            <button
              className={cn(
                "p-0.5 rounded transition-colors",
                myStatus === 'not_attending' 
                  ? 'bg-destructive text-destructive-foreground' 
                  : 'bg-muted hover:bg-destructive/20'
              )}
              onClick={(e) => { e.stopPropagation(); updateStatus('not_attending'); }}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
          
          {/* Summary counts */}
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
              <Check className="h-2 w-2" />{attendingCount}
            </span>
            <span className="flex items-center gap-0.5 text-muted-foreground">
              <HelpCircle className="h-2 w-2" />{unknownCount}
            </span>
            <span className="flex items-center gap-0.5 text-destructive">
              <X className="h-2 w-2" />{notAttendingCount}
            </span>
          </div>
        </div>
        
        {expanded ? (
          <ChevronUp className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        )}
      </button>

      {/* Expandable member list */}
      {expanded && (
        <div className="px-1.5 pb-1.5 space-y-0.5 border-t border-border pt-1.5">
          {groupMembers.map((member) => {
            const status = getStatusForUser(member.id);
            const isCurrentUser = member.id === userId;
            
            return (
              <div 
                key={member.id}
                className={cn(
                  "flex items-center justify-between py-0.5 px-1.5 rounded text-[10px] border",
                  getStatusBg(status),
                  isCurrentUser && "ring-1 ring-primary/50"
                )}
              >
                <span className={cn(
                  "truncate max-w-[70px]",
                  isCurrentUser && "font-medium"
                )}>
                  {member.display_name}
                </span>
                {getStatusIcon(status)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
