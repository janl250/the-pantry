import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Crown, Shield, Search, UserCheck, UserX, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

interface AdminUser {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  is_premium: boolean;
}

const Admin = () => {
  const { isAdmin } = useAdmin();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("manage-premium", {
        body: { action: "list-users" },
      });
      if (res.error) throw res.error;
      setUsers(res.data.users || []);
    } catch (err: any) {
      toast({
        title: language === "de" ? "Fehler" : "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  if (!isAuthenticated) return <Navigate to="/auth" />;
  if (!isAdmin) return <Navigate to="/" />;

  const togglePremium = async (userId: string, currentlyPremium: boolean) => {
    setActionLoading(userId);
    try {
      const res = await supabase.functions.invoke("manage-premium", {
        body: {
          action: currentlyPremium ? "revoke-premium" : "grant-premium",
          userId,
        },
      });
      if (res.error) throw res.error;
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_premium: !currentlyPremium } : u))
      );
      toast({
        title: currentlyPremium
          ? (language === "de" ? "Premium entzogen" : "Premium revoked")
          : (language === "de" ? "Premium freigeschaltet" : "Premium granted"),
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.display_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            {language === "de" ? "Admin-Dashboard" : "Admin Dashboard"}
          </h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              {language === "de" ? "Nutzer verwalten" : "Manage Users"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === "de" ? "Nutzer suchen..." : "Search users..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <span className="text-sm text-muted-foreground ml-auto">
                {filtered.length} {language === "de" ? "Nutzer" : "users"}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>E-Mail</TableHead>
                      <TableHead>{language === "de" ? "Anzeigename" : "Display Name"}</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>{language === "de" ? "Registriert" : "Joined"}</TableHead>
                      <TableHead>{language === "de" ? "Aktion" : "Action"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-sm">{user.email}</TableCell>
                        <TableCell>{user.display_name || "—"}</TableCell>
                        <TableCell>
                          {user.is_premium ? (
                            <Badge className="gap-1 bg-yellow-500/90 text-white border-0">
                              <Crown className="h-3 w-3" />
                              Premium
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Free</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString(language === "de" ? "de-DE" : "en-US")}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={user.is_premium ? "destructive" : "default"}
                            disabled={actionLoading === user.id}
                            onClick={() => togglePremium(user.id, user.is_premium)}
                            className="gap-1"
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : user.is_premium ? (
                              <>
                                <UserX className="h-3 w-3" />
                                {language === "de" ? "Entziehen" : "Revoke"}
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3 w-3" />
                                {language === "de" ? "Freischalten" : "Grant"}
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
