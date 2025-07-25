import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, MapPin, Phone } from 'lucide-react';

// BookingRow component for documentation
interface BookingRowProps {
  id: string;
  clientName: string;
  clientPhone?: string;
  service: string;
  date: string;
  time: string;
  status: 'en_attente' | 'confirmé' | 'refusé' | 'terminé';
  price: number;
  duration: number;
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
  onComplete?: (id: string) => void;
}

const BookingRow = ({
  id,
  clientName,
  clientPhone,
  service,
  date,
  time,
  status,
  price,
  duration,
  onConfirm,
  onReject,
  onComplete
}: BookingRowProps) => {
  const statusConfig = {
    en_attente: { color: 'yellow', label: 'En attente' },
    confirmé: { color: 'green', label: 'Confirmé' },
    refusé: { color: 'red', label: 'Refusé' },
    terminé: { color: 'blue', label: 'Terminé' }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{clientName}</span>
          </div>
          {clientPhone && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{clientPhone}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{time} ({duration}min)</span>
          </div>
          <span className="font-medium">{service}</span>
          <span className="font-bold">{price}€</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={statusConfig[status].color as any}>
          {statusConfig[status].label}
        </Badge>
        
        {status === 'en_attente' && (
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => onConfirm?.(id)}>
              Confirmer
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onReject?.(id)}>
              Refuser
            </Button>
          </div>
        )}
        
        {status === 'confirmé' && (
          <Button size="sm" onClick={() => onComplete?.(id)}>
            Terminer
          </Button>
        )}
      </div>
    </div>
  );
};

const meta = {
  title: 'Components/BookingRow',
  component: BookingRow,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## BookingRow

Composant ligne de réservation pour la gestion des rendez-vous côté stylist.

### Fonctionnalités
- **Gestion d'états** : En attente, confirmé, refusé, terminé
- **Actions contextuelles** : Boutons adaptés selon le statut
- **Informations complètes** : Client, service, horaire, prix
- **Interface intuitive** : Layout responsive avec icônes
- **Callbacks** : Gestion des actions confirm/reject/complete

### États des réservations
- **En attente** : Nouvelle réservation à traiter (boutons Confirmer/Refuser)
- **Confirmé** : Réservation acceptée (bouton Terminer)
- **Refusé** : Réservation déclinée (lecture seule)
- **Terminé** : Service rendu (lecture seule)

### Usage stylist
\`\`\`tsx
<BookingRow
  {...booking}
  onConfirm={(id) => updateBookingStatus(id, 'confirmé')}
  onReject={(id) => updateBookingStatus(id, 'refusé')}
  onComplete={(id) => updateBookingStatus(id, 'terminé')}
/>
\`\`\`

### Accessibilité
- Icônes avec labels appropriés
- Contraste couleurs suffisant
- Actions claires et prévisibles
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['en_attente', 'confirmé', 'refusé', 'terminé']
    },
    price: {
      control: { type: 'number', min: 0, step: 5 }
    },
    duration: {
      control: { type: 'number', min: 15, step: 15 }
    }
  }
} satisfies Meta<typeof BookingRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  args: {
    id: '1',
    clientName: 'Marie Dupont',
    clientPhone: '06 12 34 56 78',
    service: 'Coupe + Brushing',
    date: '2024-07-26',
    time: '14:30',
    status: 'en_attente',
    price: 45,
    duration: 60,
    onConfirm: (id) => alert(`Confirmer réservation ${id}`),
    onReject: (id) => alert(`Refuser réservation ${id}`)
  }
};

export const Confirmed: Story = {
  args: {
    ...Pending.args,
    id: '2',
    clientName: 'Sophie Martin',
    service: 'Coloration',
    status: 'confirmé',
    price: 80,
    duration: 120,
    onComplete: (id) => alert(`Terminer réservation ${id}`)
  }
};

export const Rejected: Story = {
  args: {
    ...Pending.args,
    id: '3',
    clientName: 'Thomas Chen',
    service: 'Coupe Homme',
    status: 'refusé',
    price: 25,
    duration: 30
  }
};

export const Completed: Story = {
  args: {
    ...Pending.args,
    id: '4',
    clientName: 'Luna Moreau',
    service: 'Mèches + Coupe',
    status: 'terminé',
    price: 95,
    duration: 150
  }
};

export const WithoutPhone: Story = {
  args: {
    ...Pending.args,
    id: '5',
    clientName: 'Client Anonyme',
    clientPhone: undefined,
    service: 'Brushing',
    price: 25,
    duration: 30
  }
};