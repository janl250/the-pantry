import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

type JoinGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function JoinGroupDialog({ open, onOpenChange, onSuccess }: JoinGroupDialogProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!user || !inviteCode.trim()) return;

    setLoading(true);
    try {
      // Join via secure RPC to avoid RLS issues when looking up by invite code
      const { data: result, error: rpcError } = await supabase.rpc('join_group_by_code', {
        p_invite_code: inviteCode.trim().toUpperCase(),
      });

      if (rpcError) throw rpcError;

      const status = (result && (result as any).status) as string | undefined;

      if (status === 'not_found') {
        // Generic error message to prevent enumeration
        toast({
          title: language === 'de' ? "Fehler" : "Error",
          description: language === 'de' ? "Gruppe konnte nicht beigetreten werden" : "Unable to join group",
          variant: "destructive"
        });
        return;
      }

      if (status === 'already_member') {
        toast({
          title: language === 'de' ? "Bereits Mitglied" : "Already Member",
          description: t('joinGroup.alreadyMember'),
          variant: "destructive"
        });
        return;
      }

      toast({
        title: language === 'de' ? "Beigetreten!" : "Joined!",
        description: t('joinGroup.success')
      });

      setInviteCode("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      const msg = error?.message || '';
      if (msg.includes('not_authenticated')) {
        toast({
          title: language === 'de' ? 'Bitte anmelden' : 'Please sign in',
          description: t('rating.loginRequired') ?? (language === 'de' ? 'Bitte zuerst einloggen.' : 'Please log in first.'),
          variant: 'destructive'
        });
      } else {
        toast({
          title: language === 'de' ? "Fehler" : "Error",
          description: language === 'de' ? "Gruppe konnte nicht beigetreten werden" : "Unable to join group",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('joinGroup.title')}</DialogTitle>
          <DialogDescription>
            {t('joinGroup.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteCode">{t('joinGroup.codeLabel')}</Label>
            <Input
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder={t('joinGroup.codePlaceholder')}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              className="font-mono"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('joinGroup.cancel')}
            </Button>
            <Button onClick={handleJoin} disabled={loading || !inviteCode.trim()}>
              {loading ? (language === 'de' ? 'Wird beigetreten...' : 'Joining...') : t('joinGroup.join')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
