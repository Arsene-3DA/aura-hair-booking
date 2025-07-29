import { useState, useEffect } from 'react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useStylistChat } from '@/hooks/useStylistChat';
import { validateUUID } from '@/utils/validateUUID';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  full_name: string;
  avatar_url?: string;
  last_message?: {
    body: string;
    created_at: string;
  };
  unread_count: number;
}

const StylistChatPage = () => {
  const { session } = useRoleAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const { messages, sendMessage } = useStylistChat(
    session?.user?.id,
    selectedClientId
  );

  // Fetch clients who have messaged the stylist
  const fetchClients = async () => {
    if (!validateUUID(session?.user?.id)) return;

    try {
      setLoading(true);
      
      // Get unique clients from messages
      const { data: messageClients, error } = await supabase
        .from('messages')
        .select(`
          sender_id,
          receiver_id,
          body,
          created_at
        `)
        .or(`sender_id.eq.${session?.user?.id},receiver_id.eq.${session?.user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by client and get latest message
      const clientsMap = new Map<string, Client>();
      const clientIds = new Set<string>();
      
      messageClients?.forEach((msg) => {
        const isFromClient = msg.sender_id !== session?.user?.id;
        const clientId = isFromClient ? msg.sender_id : msg.receiver_id;
        
        if (!clientsMap.has(clientId)) {
          clientIds.add(clientId);
          clientsMap.set(clientId, {
            id: clientId,
            full_name: 'Client', // Will be updated below
            last_message: {
              body: msg.body,
              created_at: msg.created_at,
            },
            unread_count: 0, // TODO: Implement unread count
          });
        }
      });

      // Fetch client profiles
      if (clientIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', Array.from(clientIds));

        profiles?.forEach((profile) => {
          const client = clientsMap.get(profile.user_id);
          if (client) {
            client.full_name = profile.full_name || 'Client';
            client.avatar_url = profile.avatar_url;
          }
        });
      }

      setClients(Array.from(clientsMap.values()));
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedClientId) return;

    try {
      await sendMessage(newMessage);
      setNewMessage('');
      await fetchClients(); // Refresh client list
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [session?.user?.id]);

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedClient = clients.find(c => c.id === selectedClientId);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          Communiquez avec vos clients
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Liste des clients */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {filteredClients.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune conversation</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className={`p-4 cursor-pointer hover:bg-muted/50 border-b ${
                        selectedClientId === client.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">
                              {client.full_name}
                            </h3>
                            {client.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {client.unread_count}
                              </Badge>
                            )}
                          </div>
                          {client.last_message && (
                            <>
                              <p className="text-sm text-muted-foreground truncate">
                                {client.last_message.body}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(client.last_message.created_at), 'PPp', { locale: fr })}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Zone de chat */}
        <Card className="lg:col-span-2">
          {selectedClient ? (
            <>
              <CardHeader className="border-b">
                <CardTitle>{selectedClient.full_name}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-full">
                <ScrollArea className="flex-1 p-4 h-[300px]">
                  {messages.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun message</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_id === session?.user?.id
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.sender_id === session?.user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.body}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {format(new Date(message.created_at), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tapez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez une conversation pour commencer</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StylistChatPage;