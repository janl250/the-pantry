import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { z } from 'zod';

const groupSchema = z.object({
  name: z.string().trim().min(1, 'Group name is required').max(50, 'Group name must be less than 50 characters'),
});

type CreateGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function CreateGroupDialog({ open, onOpenChange, onSuccess }: CreateGroupDialogProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user) return;

    try {
      // Validate with Zod
      const validatedData = groupSchema.parse({ name: groupName });
      
      setLoading(true);

      // Generate invite code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_invite_code');

      if (codeError) throw codeError;

      // Create group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: validatedData.name,
          invite_code: codeData,
          created_by: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'creator'
        });

      if (memberError) throw memberError;

      toast({
        title: language === 'de' ? "Gruppe erstellt!" : "Group Created!",
        description: t('createGroup.success')
      });

      setGroupName("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: language === 'de' ? "Ungültige Eingabe" : "Invalid Input",
          description: error.issues[0].message,
          variant: "destructive"
        });
      } else {
        toast({
          title: language === 'de' ? "Fehler" : "Error",
          description: t('createGroup.error'),
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
          <DialogTitle>{t('createGroup.title')}</DialogTitle>
          <DialogDescription>
            {t('createGroup.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">{t('createGroup.nameLabel')}</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={t('createGroup.namePlaceholder')}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('createGroup.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={loading || !groupName.trim()}>
              {loading ? (language === 'de' ? 'Wird erstellt...' : 'Creating...') : t('createGroup.create')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
