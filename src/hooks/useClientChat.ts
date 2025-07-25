import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  stylist_id: string;
  client_id: string;
  message: string;
  sender_type: 'stylist' | 'client';
  created_at: string;
  read: boolean;
}

interface UseClientChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  markAsRead: () => Promise<void>;
}

export const useClientChat = (stylistId?: string, clientId?: string): UseClientChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!stylistId || !clientId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Note: This would require a chat_messages table in real implementation
      // For now, returning empty array as this is beta feature
      setMessages([]);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      setError('Erreur de chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (!stylistId || !clientId || !message.trim()) return;
    
    try {
      // Note: This would require implementing chat_messages table
      console.log('Sending message (beta):', { stylistId, clientId, message });
      
      // Optimistic update for demo
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        stylist_id: stylistId,
        client_id: clientId,
        message: message.trim(),
        sender_type: 'stylist',
        created_at: new Date().toISOString(),
        read: false,
      };
      
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Impossible d\'envoyer le message');
    }
  };

  const markAsRead = async () => {
    if (!stylistId || !clientId) return;
    
    try {
      // Mark messages as read
      setMessages(prev => 
        prev.map(msg => ({ ...msg, read: true }))
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    if (!stylistId || !clientId) {
      setLoading(false);
      return;
    }

    fetchMessages();

    // Set up real-time subscription (beta)
    const channel = supabase
      .channel(`chat:${stylistId}:${clientId}`)
      .on('broadcast', { event: 'message' }, (payload) => {
        console.log('New chat message:', payload);
        // Handle real-time messages
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stylistId, clientId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
  };
};