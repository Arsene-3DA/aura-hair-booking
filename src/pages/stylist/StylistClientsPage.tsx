import { useState } from 'react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useClientHistory } from '@/hooks/useClientHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Calendar, MessageSquare, Plus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const StylistClientsPage = () => {
  const { userProfile } = useRoleAuth();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState('');
  const { bookings, notes, loading, addNote } = useClientHistory(
    userProfile?.user_id,
    selectedClientId
  );

  // Mock clients data - In real app, fetch from bookings table
  const clients = [
    { id: '1', name: 'Marie Dupont', email: 'marie@example.com', lastVisit: '2024-01-15', totalVisits: 5 },
    { id: '2', name: 'Sophie Martin', email: 'sophie@example.com', lastVisit: '2024-01-10', totalVisits: 3 },
    { id: '3', name: 'Lucie Bernard', email: 'lucie@example.com', lastVisit: '2024-01-08', totalVisits: 8 },
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNote = async () => {
    if (newNote.trim() && selectedClientId) {
      await addNote(newNote);
      setNewNote('');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      confirmed: { label: 'Confirmé', variant: 'default' as const },
      declined: { label: 'Refusé', variant: 'destructive' as const },
      completed: { label: 'Terminé', variant: 'outline' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-8 w-8" />
          Mes Clients
        </h1>
        <p className="text-muted-foreground">
          Gérez vos clients et consultez leur historique
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Sheet key={client.id}>
            <SheetTrigger asChild>
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedClientId(client.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Dernière visite</p>
                      <p className="text-sm font-medium">
                        {format(new Date(client.lastVisit), 'd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total visites</p>
                      <p className="text-lg font-bold text-primary">{client.totalVisits}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>{client.name}</SheetTitle>
                <SheetDescription>
                  Historique et notes du client
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Historique des rendez-vous */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Historique des rendez-vous
                  </h3>
                  {loading ? (
                    <p className="text-muted-foreground">Chargement...</p>
                  ) : bookings.length === 0 ? (
                    <p className="text-muted-foreground">Aucun rendez-vous trouvé</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div>
                            <p className="font-medium">{booking.service}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(booking.scheduled_at), 'd MMM yyyy', { locale: fr })}
                            </p>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Notes privées
                  </h3>
                  
                  {/* Ajouter une note */}
                  <div className="space-y-2 mb-4">
                    <Textarea
                      placeholder="Ajouter une note sur ce client..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter la note
                    </Button>
                  </div>

                  {/* Liste des notes */}
                  {loading ? (
                    <p className="text-muted-foreground">Chargement...</p>
                  ) : notes.length === 0 ? (
                    <p className="text-muted-foreground">Aucune note pour ce client</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          className="p-3 bg-muted rounded"
                        >
                          <p className="text-sm">{note.note}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(note.created_at), 'd MMM yyyy à HH:mm', { locale: fr })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Aucun client trouvé
          </h3>
          <p className="text-muted-foreground">
            Essayez de modifier votre recherche
          </p>
        </div>
      )}
    </div>
  );
};

export default StylistClientsPage;