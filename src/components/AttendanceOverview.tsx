import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Check, X, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceOverviewProps {
  groupId: string;
  weekStartDate: string;
}

interface MemberAttendance {
  userId: string;
  displayName: string;
  days: { [day: string]: 'attending' | 'not_attending' | 'unknown' };
}

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function AttendanceOverview({ groupId, weekStartDate }: AttendanceOverviewProps) {
  const { language } = useLanguage();
  const [members, setMembers] = useState<MemberAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const dayLabels: { [key: string]: string } = {
    monday: language === 'de' ? 'Mo' : 'Mon',
    tuesday: language === 'de' ? 'Di' : 'Tue',
    wednesday: language === 'de' ? 'Mi' : 'Wed',
    thursday: language === 'de' ? 'Do' : 'Thu',
    friday: language === 'de' ? 'Fr' : 'Fri',
    saturday: language === 'de' ? 'Sa' : 'Sat',
    sunday: language === 'de' ? 'So' : 'Sun',
  };

  useEffect(() => {
    if (open) {
      loadAttendanceData();
    }
  }, [open, groupId, weekStartDate]);

  // Realtime subscription
  useEffect(() => {
    if (!open) return;

    const channel = supabase
      .channel(`attendance-overview-${groupId}-${weekStartDate}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_attendance',
          filter: `group_id=eq.${groupId}`
        },
        () => {
          loadAttendanceData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, groupId, weekStartDate]);

  const loadAttendanceData = async () => {
    try {
      // Load group members
      const { data: memberData } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      const memberIds = memberData?.map(m => m.user_id) || [];

      // Load profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', memberIds);

      // Load attendance for the week
      const { data: attendanceData } = await supabase
        .from('meal_attendance')
        .select('user_id, day_of_week, status')
        .eq('group_id', groupId)
        .eq('week_start_date', weekStartDate);

      const membersMap: MemberAttendance[] = memberIds.map(id => {
        const profile = profiles?.find(p => p.id === id);
        const days: { [day: string]: 'attending' | 'not_attending' | 'unknown' } = {};
        DAY_KEYS.forEach(day => {
          const entry = attendanceData?.find(a => a.user_id === id && a.day_of_week === day);
          days[day] = (entry?.status as 'attending' | 'not_attending' | 'unknown') || 'unknown';
        });
        return {
          userId: id,
          displayName: profile?.display_name || 'Unknown',
          days,
        };
      });

      setMembers(membersMap);
    } catch (error) {
      console.error('Error loading attendance overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: 'attending' | 'not_attending' | 'unknown') => {
    switch (status) {
      case 'attending':
        return <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'not_attending':
        return <X className="h-4 w-4 text-destructive" />;
      default:
        return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBg = (status: 'attending' | 'not_attending' | 'unknown') => {
    switch (status) {
      case 'attending':
        return 'bg-emerald-50 dark:bg-emerald-950/30';
      case 'not_attending':
        return 'bg-destructive/10';
      default:
        return '';
    }
  };

  // Count attending per day
  const getAttendingCount = (day: string) => {
    return members.filter(m => m.days[day] === 'attending').length;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          {language === 'de' ? 'Anwesenheitsübersicht' : 'Attendance Overview'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {language === 'de' ? 'Wer ist wann da?' : 'Who is attending when?'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            {language === 'de' ? 'Laden...' : 'Loading...'}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'de' ? 'Keine Mitglieder gefunden.' : 'No members found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background min-w-[100px]">
                    {language === 'de' ? 'Name' : 'Name'}
                  </TableHead>
                  {DAY_KEYS.map(day => (
                    <TableHead key={day} className="text-center px-2 min-w-[48px]">
                      {dayLabels[day]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map(member => (
                  <TableRow key={member.userId}>
                    <TableCell className="sticky left-0 bg-background font-medium text-sm">
                      {member.displayName}
                    </TableCell>
                    {DAY_KEYS.map(day => (
                      <TableCell
                        key={day}
                        className={cn("text-center px-2", getStatusBg(member.days[day]))}
                      >
                        {getStatusIcon(member.days[day])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {/* Summary row */}
                <TableRow className="border-t-2 font-medium">
                  <TableCell className="sticky left-0 bg-background text-sm text-muted-foreground">
                    {language === 'de' ? 'Gesamt ✓' : 'Total ✓'}
                  </TableCell>
                  {DAY_KEYS.map(day => (
                    <TableCell key={day} className="text-center px-2">
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {getAttendingCount(day)}
                      </span>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
