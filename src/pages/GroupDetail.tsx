import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Copy, Crown, Calendar } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

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

  useEffect(() => {
    if (isAuthenticated && user && groupId) {
      loadGroupDetails();
    } else if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, user, groupId]);

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
              <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
              <p className="text-muted-foreground mt-1">
                {language === 'de' ? 'Gruppendetails' : 'Group Details'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/weekly-calendar?group=${group.id}`)}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              {language === 'de' ? 'Kalender öffnen' : 'Open Calendar'}
            </Button>
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
                            {member.profiles?.display_name || language === 'de' ? 'Unbekannter Benutzer' : 'Unknown User'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {language === 'de' ? 'Beigetreten am ' : 'Joined '}
                            {new Date(member.joined_at).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}
                          </div>
                        </div>
                      </div>
                      {member.role === 'creator' && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          {t('groups.creator')}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
