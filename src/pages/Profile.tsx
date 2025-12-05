import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Mail, Calendar, ChefHat, Star, Heart, Users, Save, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Profile() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalDishes: 0,
    favorites: 0,
    ratings: 0,
    groups: 0,
    mealPlans: 0
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfile();
      loadStats();
    }
  }, [isAuthenticated, user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      if (data) {
        setDisplayName(data.display_name || user.email?.split('@')[0] || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    
    try {
      // Load various stats in parallel
      const [dishesRes, favoritesRes, ratingsRes, groupsRes, mealPlansRes] = await Promise.all([
        supabase.from('user_dishes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('user_favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('dish_ratings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('group_members').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('meal_plans').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);

      setStats({
        totalDishes: dishesRes.count || 0,
        favorites: favoritesRes.count || 0,
        ratings: ratingsRes.count || 0,
        groups: groupsRes.count || 0,
        mealPlans: mealPlansRes.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: language === 'de' ? 'Profil gespeichert!' : 'Profile saved!',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: language === 'de' ? 'Fehler beim Speichern' : 'Error saving',
        variant: "destructive"
      });
    } finally {
      setSaving(false);
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
                      {language === 'de' ? 'Anmeldung erforderlich' : 'Login Required'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {language === 'de' 
                        ? 'Um Ihr Profil zu sehen, müssen Sie sich anmelden.' 
                        : 'To view your profile, you need to log in.'}
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/groups">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">
                {language === 'de' ? 'Mein Profil' : 'My Profile'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {language === 'de' ? 'Verwalten Sie Ihre Kontoinformationen' : 'Manage your account information'}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {language === 'de' ? 'Profilinformationen' : 'Profile Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">
                    {language === 'de' ? 'Anzeigename' : 'Display Name'}
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={language === 'de' ? 'Ihr Name' : 'Your name'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {language === 'de' ? 'E-Mail' : 'Email'}
                  </Label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {language === 'de' ? 'Mitglied seit' : 'Member since'}
                  </Label>
                  <Input
                    value={user?.created_at ? new Date(user.created_at).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US') : ''}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <Button onClick={saveProfile} disabled={saving} className="w-full gap-2">
                  <Save className="h-4 w-4" />
                  {saving 
                    ? (language === 'de' ? 'Wird gespeichert...' : 'Saving...') 
                    : (language === 'de' ? 'Speichern' : 'Save')}
                </Button>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  {language === 'de' ? 'Statistiken' : 'Statistics'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <ChefHat className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{stats.totalDishes}</div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'de' ? 'Eigene Gerichte' : 'Custom Dishes'}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <Heart className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{stats.favorites}</div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'de' ? 'Favoriten' : 'Favorites'}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{stats.ratings}</div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'de' ? 'Bewertungen' : 'Ratings'}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <Users className="h-6 w-6 text-secondary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{stats.groups}</div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'de' ? 'Gruppen' : 'Groups'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {language === 'de' ? 'Geplante Mahlzeiten' : 'Planned Meals'}
                    </span>
                    <Badge variant="secondary">{stats.mealPlans}</Badge>
                  </div>
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
