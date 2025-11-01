import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Plus, LogIn, Copy, Trash2, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { JoinGroupDialog } from "@/components/JoinGroupDialog";
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

type Group = {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
  created_by: string;
  member_count: number;
  user_role: 'creator' | 'member';
};

export default function Groups() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [leaveGroupId, setLeaveGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadGroups();
    } else if (!isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadGroups = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: memberships, error } = await supabase
        .from('group_members')
        .select(`
          role,
          groups (
            id,
            name,
            invite_code,
            created_at,
            created_by
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      if (memberships) {
        const groupsWithCounts = await Promise.all(
          memberships.map(async (membership: any) => {
            const { count } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', membership.groups.id);

            return {
              id: membership.groups.id,
              name: membership.groups.name,
              invite_code: membership.groups.invite_code,
              created_at: membership.groups.created_at,
              created_by: membership.groups.created_by,
              member_count: count || 0,
              user_role: membership.role
            };
          })
        );

        setGroups(groupsWithCounts);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: language === 'de' ? "Fehler" : "Error",
        description: t('groups.error'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: t('groups.codeCopied')
    });
  };

  const handleLeaveGroup = async () => {
    if (!leaveGroupId || !user) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', leaveGroupId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: language === 'de' ? "Gruppe verlassen" : "Left Group",
        description: t('groups.left')
      });

      loadGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: language === 'de' ? "Fehler" : "Error",
        description: t('groups.error'),
        variant: "destructive"
      });
    } finally {
      setLeaveGroupId(null);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteGroupId) return;

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', deleteGroupId);

      if (error) throw error;

      toast({
        title: language === 'de' ? "Gruppe gelöscht" : "Group Deleted",
        description: t('groups.deleted')
      });

      loadGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: language === 'de' ? "Fehler" : "Error",
        description: t('groups.error'),
        variant: "destructive"
      });
    } finally {
      setDeleteGroupId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <LogIn className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {t('weeklyCalendar.loginRequired')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {language === 'de' 
                        ? 'Um Gruppen zu erstellen und beizutreten, müssen Sie sich anmelden.' 
                        : 'To create and join groups, you need to log in.'}
                    </p>
                    <Button onClick={() => navigate('/auth')} className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      {language === 'de' ? 'Jetzt anmelden' : 'Log in now'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">{t('groups.title')}</h1>
              <p className="text-muted-foreground mt-2">
                {t('groups.subtitle')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowJoinDialog(true)} variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t('groups.joinGroup')}
              </Button>
              <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('groups.createGroup')}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">{language === 'de' ? 'Lädt...' : 'Loading...'}</div>
            </div>
          ) : groups.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t('groups.noGroups')}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t('groups.noGroupsDescription')}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setShowJoinDialog(true)} variant="outline">
                    {t('groups.joinGroup')}
                  </Button>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    {t('groups.createGroup')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map(group => (
                <Card 
                  key={group.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl">{group.name}</CardTitle>
                      <Badge variant={group.user_role === 'creator' ? 'default' : 'secondary'}>
                        {t(`groups.${group.user_role}`)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{t('groups.members')}: {group.member_count}</span>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">{t('groups.inviteCode')}</div>
                          <div className="font-mono font-bold text-foreground">{group.invite_code}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyInviteCode(group.invite_code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/weekly-calendar?group=${group.id}`);
                        }}
                      >
                        {language === 'de' ? 'Kalender öffnen' : 'Open Calendar'}
                      </Button>
                      {group.user_role === 'creator' ? (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteGroupId(group.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLeaveGroupId(group.id);
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <CreateGroupDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadGroups}
      />

      <JoinGroupDialog
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
        onSuccess={loadGroups}
      />

      <AlertDialog open={!!deleteGroupId} onOpenChange={() => setDeleteGroupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('groups.deleteGroup')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('groups.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('createGroup.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup}>
              {language === 'de' ? 'Löschen' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!leaveGroupId} onOpenChange={() => setLeaveGroupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('groups.leaveGroup')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('groups.leaveConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('createGroup.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveGroup}>
              {language === 'de' ? 'Verlassen' : 'Leave'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
