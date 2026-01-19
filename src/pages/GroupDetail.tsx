import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Users, Copy, Crown, Calendar, Edit2, Trash2, UserMinus, Activity, MessageCircle, Plus, Minus, UserPlus, RefreshCw } from "lucide-react";
import { GroupChat } from "@/components/GroupChat";
import { format, isToday, isYesterday } from "date-fns";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Member = {
  user_id: string;
  role: 'creator' | 'member';
  joined_at: string;
  profiles: {
    display_name: string | null;
  } | null;
};

type GroupDetail = {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
  created_by: string;
};

export default function GroupDetail() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [editGroupName, setEditGroupName] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [deleteGroupDialog, setDeleteGroupDialog] = useState(false);
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (groupId && user) {
      loadGroupDetails();
      loadActivities();
    }
  }, [groupId, user]);

  // Setup realtime subscription for activities
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel('group-activities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_activities',
          filter: `group_id=eq.${groupId}`
        },
        () => {
          loadActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const loadGroupDetails = async () => {
    if (!user || !groupId) return;
    
    setLoading(true);
    try {
      // Load group details
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);
      setNewGroupName(groupData.name);

      // Check if current user is creator
      const { data: membershipData } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      setIsCreator(membershipData?.role === 'creator');

      // Load members with profiles
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select(`
          user_id,
          role,
          joined_at,
          profiles (
            display_name
          )
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      if (membersError) throw membersError;
      setMembers(membersData || []);
    } catch (error) {
      console.error('Error loading group details:', error);
      toast({
        title: language === 'de' ? "Fehler" : "Error",
        description: t('groups.error'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    if (!groupId) return;

    try {
      const { data, error } = await supabase
        .from('group_activities')
        .select('*, profiles:user_id(display_name)')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'dish_added':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'dish_removed':
        return <Minus className="h-4 w-4 text-red-500" />;
      case 'member_joined':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'member_removed':
        return <UserMinus className="h-4 w-4 text-orange-500" />;
      case 'week_repeated':
        return <RefreshCw className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityMessage = (activity: any) => {
    const userName = activity.profiles?.display_name || (language === 'de' ? 'Jemand' : 'Someone');
    const dayTranslation = activity.day_of_week ? 
      (language === 'de' ? 
        { monday: 'Montag', tuesday: 'Dienstag', wednesday: 'Mittwoch', thursday: 'Donnerstag', friday: 'Freitag', saturday: 'Samstag', sunday: 'Sonntag' }[activity.day_of_week] 
        : activity.day_of_week) : '';

    switch (activity.activity_type) {
      case 'dish_added':
        return language === 'de'
          ? `${userName} hat "${activity.dish_name}" am ${dayTranslation} hinzugefügt`
          : `${userName} added "${activity.dish_name}" on ${dayTranslation}`;
      case 'dish_removed':
        return language === 'de'
          ? `${userName} hat "${activity.dish_name}" am ${dayTranslation} entfernt`
          : `${userName} removed "${activity.dish_name}" from ${dayTranslation}`;
      case 'member_joined':
        return language === 'de'
          ? `${userName} ist der Gruppe beigetreten`
          : `${userName} joined the group`;
      case 'member_removed':
        return language === 'de'
          ? `${userName} wurde aus der Gruppe entfernt`
          : `${userName} was removed from the group`;
      case 'week_repeated':
        return language === 'de'
          ? `${userName} hat die Vorwoche wiederholt`
          : `${userName} repeated last week`;
      default:
        return activity.activity_type;
    }
  };

  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return language === 'de' ? 'Heute' : 'Today';
    }
    if (isYesterday(date)) {
      return language === 'de' ? 'Gestern' : 'Yesterday';
    }
    return format(date, language === 'de' ? 'dd. MMMM' : 'MMMM dd', { locale: language === 'de' ? de : undefined });
  };

  // Group activities by date
  const groupedActivities = activities.reduce((groups: Record<string, any[]>, activity) => {
    const dateKey = format(new Date(activity.created_at), 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(activity);
    return groups;
  }, {});

  const handleUpdateGroupName = async () => {
    if (!groupId || !newGroupName.trim()) return;

    try {
      const { error } = await supabase
        .from('groups')
        .update({ name: newGroupName.trim() })
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: language === 'de' ? "Erfolg" : "Success",
        description: language === 'de' ? "Gruppenname geändert" : "Group name updated"
      });

      setEditGroupName(false);
      loadGroupDetails();
    } catch (error) {
      toast({
        title: language === 'de' ? "Fehler" : "Error",
        description: language === 'de' ? "Fehler beim Ändern des Namens" : "Error updating name",
        variant: "destructive"
      });
    }
  };

  const handleRemoveMember = async () => {
    if (!removeMemberId || !groupId) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', removeMemberId);

      if (error) throw error;

      toast({
        title: language === 'de' ? "Erfolg" : "Success",
        description: language === 'de' ? "Mitglied entfernt" : "Member removed"
      });

      setRemoveMemberId(null);
      loadGroupDetails();
    } catch (error) {
      toast({
        title: language === 'de' ? "Fehler" : "Error",
        description: language === 'de' ? "Fehler beim Entfernen" : "Error removing member",
        variant: "destructive"
      });
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupId) return;

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: language === 'de' ? "Gruppe gelöscht" : "Group Deleted",
        description: language === 'de' ? "Gruppe erfolgreich gelöscht" : "Group deleted successfully"
      });

      navigate('/groups');
    } catch (error) {
      toast({
        title: language === 'de' ? "Fehler" : "Error",
        description: language === 'de' ? "Fehler beim Löschen" : "Error deleting group",
        variant: "destructive"
      });
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: t('groups.codeCopied')
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="py-8 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-muted-foreground">{language === 'de' ? 'Lädt...' : 'Loading...'}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="py-8 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-muted-foreground">{language === 'de' ? 'Gruppe nicht gefunden' : 'Group not found'}</div>
            <Button onClick={() => navigate('/groups')} className="mt-4">
              {language === 'de' ? 'Zurück zu Gruppen' : 'Back to Groups'}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/groups">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
                {isCreator && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditGroupName(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                {language === 'de' ? 'Gruppendetails' : 'Group Details'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/weekly-calendar?group=${group.id}`)}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                {language === 'de' ? 'Kalender öffnen' : 'Open Calendar'}
              </Button>
              {isCreator && (
                <Button
                  variant="destructive"
                  onClick={() => setDeleteGroupDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {language === 'de' ? 'Gruppe löschen' : 'Delete Group'}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Invite Code Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('groups.inviteCode')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {language === 'de' ? 'Code zum Teilen:' : 'Code to share:'}
                      </div>
                      <div className="font-mono font-bold text-2xl text-foreground">{group.invite_code}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyInviteCode(group.invite_code)}
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('groups.members')} ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {(member.profiles?.display_name || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {member.profiles?.display_name || (language === 'de' ? 'Unbekannter Benutzer' : 'Unknown User')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {language === 'de' ? 'Beigetreten am ' : 'Joined '}
                            {new Date(member.joined_at).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.role === 'creator' ? (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            {t('groups.creator')}
                          </Badge>
                        ) : (
                          isCreator && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setRemoveMemberId(member.user_id)}
                            >
                              <UserMinus className="h-4 w-4 text-destructive" />
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {language === 'de' ? 'Aktivitätsfeed' : 'Activity Feed'}
                  {activities.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{activities.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    {language === 'de' ? 'Noch keine Aktivitäten' : 'No activities yet'}
                  </p>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedActivities).map(([dateKey, dayActivities]: [string, any[]]) => (
                      <div key={dateKey}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-px flex-1 bg-border" />
                          <span className="text-xs font-medium text-muted-foreground px-2">
                            {formatActivityDate((dayActivities as any[])[0].created_at)}
                          </span>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <div className="space-y-3">
                          {dayActivities.map((activity: any) => (
                            <div key={activity.id} className="flex gap-3 items-start">
                              <div className="flex-shrink-0 mt-0.5 p-1.5 rounded-full bg-muted">
                                {getActivityIcon(activity.activity_type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground">
                                  {getActivityMessage(activity)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {format(new Date(activity.created_at), 'HH:mm', { locale: language === 'de' ? de : undefined })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Group Chat */}
            {groupId && <GroupChat groupId={groupId} />}
          </div>
        </div>
      </main>

      <Footer />

      {/* Edit Group Name Dialog */}
      <Dialog open={editGroupName} onOpenChange={setEditGroupName}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'de' ? 'Gruppennamen ändern' : 'Edit Group Name'}
            </DialogTitle>
            <DialogDescription>
              {language === 'de' 
                ? 'Gib einen neuen Namen für die Gruppe ein.' 
                : 'Enter a new name for the group.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">
                {language === 'de' ? 'Gruppenname' : 'Group Name'}
              </Label>
              <Input
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder={language === 'de' ? 'Gruppenname' : 'Group name'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditGroupName(false)}>
              {language === 'de' ? 'Abbrechen' : 'Cancel'}
            </Button>
            <Button onClick={handleUpdateGroupName} disabled={!newGroupName.trim()}>
              {language === 'de' ? 'Speichern' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation */}
      <AlertDialog open={deleteGroupDialog} onOpenChange={setDeleteGroupDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('groups.deleteGroup')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('groups.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'de' ? 'Abbrechen' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup}>
              {language === 'de' ? 'Löschen' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!removeMemberId} onOpenChange={() => setRemoveMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'de' ? 'Mitglied entfernen' : 'Remove Member'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'de' 
                ? 'Möchtest du dieses Mitglied wirklich aus der Gruppe entfernen?' 
                : 'Are you sure you want to remove this member from the group?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'de' ? 'Abbrechen' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember}>
              {language === 'de' ? 'Entfernen' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
