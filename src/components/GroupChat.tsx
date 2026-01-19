import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
  } | null;
}

interface GroupChatProps {
  groupId: string;
}

export function GroupChat({ groupId }: GroupChatProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [groupId]);

  // Setup realtime subscription
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        async (payload) => {
          // Fetch the new message with profile data
          const { data: msgData, error: msgError } = await supabase
            .from('group_messages')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (!msgError && msgData) {
            // Fetch profile separately
            const { data: profileData } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', msgData.user_id)
              .single();

            const messageWithProfile: Message = {
              ...msgData,
              profiles: profileData || null
            };
            setMessages(prev => [...prev, messageWithProfile]);
            scrollToBottom();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const loadMessages = async () => {
    if (!groupId) return;

    setLoading(true);
    try {
      // First load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesError) throw messagesError;

      if (messagesData && messagesData.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(messagesData.map(m => m.user_id))];
        
        // Fetch profiles for all users
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds);

        // Create a map of user_id to profile
        const profilesMap = new Map(
          (profilesData || []).map(p => [p.id, { display_name: p.display_name }])
        );

        // Merge messages with profiles
        const messagesWithProfiles: Message[] = messagesData.map(msg => ({
          ...msg,
          profiles: profilesMap.get(msg.user_id) || null
        }));

        setMessages(messagesWithProfiles);
      } else {
        setMessages([]);
      }
      
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          user_id: user.id,
          message: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: language === 'de' ? "Fehler" : "Error",
        description: language === 'de' ? "Nachricht konnte nicht gesendet werden" : "Could not send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('group_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: language === 'de' ? "Fehler" : "Error",
        description: language === 'de' ? "Nachricht konnte nicht gelöscht werden" : "Could not delete message",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          {language === 'de' ? 'Gruppen-Chat' : 'Group Chat'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea 
          className="h-80 px-4"
          ref={scrollRef as any}
        >
          <div ref={scrollRef} className="h-80 overflow-y-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {language === 'de' ? 'Laden...' : 'Loading...'}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center py-8">
                <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">
                  {language === 'de' 
                    ? 'Noch keine Nachrichten. Starte die Konversation!' 
                    : 'No messages yet. Start the conversation!'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                {messages.map((msg) => {
                  const isOwn = msg.user_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {!isOwn && (
                          <div className="text-xs font-semibold mb-1 opacity-80">
                            {msg.profiles?.display_name || (language === 'de' ? 'Unbekannt' : 'Unknown')}
                          </div>
                        )}
                        <p className="text-sm break-words">{msg.message}</p>
                        <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs opacity-60">
                            {formatDistanceToNow(new Date(msg.created_at), {
                              addSuffix: true,
                              locale: language === 'de' ? de : undefined
                            })}
                          </span>
                          {isOwn && (
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="opacity-40 hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={language === 'de' ? 'Nachricht schreiben...' : 'Type a message...'}
              disabled={sending}
              maxLength={500}
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}