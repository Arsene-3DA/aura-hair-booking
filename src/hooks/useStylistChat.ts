import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  created_at: string;
}

export const useStylistChat = (stylistId?: string, clientId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMessages = async () => {
    if (!stylistId || !clientId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${stylistId},receiver_id.eq.${clientId}),and(sender_id.eq.${clientId},receiver_id.eq.${stylistId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (body: string) => {
    if (!stylistId || !clientId || !body.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: stylistId,
          receiver_id: clientId,
          body: body.trim(),
        });

      if (error) throw error;

      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel(`chat:${stylistId}:${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stylistId, clientId]);

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages,
  };
};