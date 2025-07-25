import type { Meta, StoryObj } from '@storybook/react';
import { StylistCard } from '@/components/StylistCard';

const meta = {
  title: 'Components/StylistCard',
  component: StylistCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## StylistCard

Composant carte stylist avec accessibilité complète et données dynamiques.

### Fonctionnalités
- **Accessibilité** : Support ARIA, navigation clavier, screen readers
- **Responsive** : S'adapte aux différentes tailles d'écran
- **Données dynamiques** : Services, spécialités, notation depuis Supabase
- **Actions** : Réservation et visualisation de profil
- **États** : Actif/Inactif avec indicateurs visuels

### Accessibilité
- Utilise \`role="article"\` et \`aria-labelledby\`
- Navigation clavier (Enter, Espace)
- Labels ARIA descriptifs pour les actions
- Indicateurs visuels pour les utilisateurs malvoyants

### Performance
- Avatar avec fallback intelligent (ui-avatars.com)
- Lazy loading des images
- Hover effects optimisés CSS
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    rating: {
      control: { type: 'range', min: 0, max: 5, step: 0.1 }
    },
    isActive: {
      control: 'boolean'
    },
    specialties: {
      control: 'object'
    },
    services: {
      control: 'object'
    }
  }
} satisfies Meta<typeof StylistCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock services data
const mockServices = [
  { id: '1', name: 'Coupe Femme', price: 45, duration: 60 },
  { id: '2', name: 'Coupe Homme', price: 25, duration: 30 },
  { id: '3', name: 'Coloration', price: 80, duration: 120 },
  { id: '4', name: 'Mèches', price: 60, duration: 90 },
  { id: '5', name: 'Brushing', price: 25, duration: 30 }
];

export const Default: Story = {
  args: {
    id: '1',
    name: 'Sophie Martin',
    avatar_url: 'https://ui-avatars.com/api/?name=Sophie+Martin&background=6366f1&color=ffffff&size=400&bold=true&format=png',
    email: 'sophie.martin@salon.com',
    phone: '06 12 34 56 78',
    location: 'Paris 11ème',
    specialties: ['Coloration', 'Coupe Femme', 'Mèches'],
    rating: 4.8,
    experience: '8 ans d\'expérience',
    services: mockServices.slice(0, 3),
    isActive: true,
    onBooking: (id) => alert(`Booking with stylist ${id}`),
    onViewProfile: (id) => alert(`View profile of stylist ${id}`)
  }
};

export const WithoutAvatar: Story = {
  args: {
    ...Default.args,
    avatar_url: null,
    name: 'Marc Dubois'
  }
};

export const Inactive: Story = {
  args: {
    ...Default.args,
    name: 'Amélie Rousseau',
    isActive: false,
    specialties: ['Balayage', 'Soins'],
    rating: 4.6
  }
};

export const HighRating: Story = {
  args: {
    ...Default.args,
    name: 'Luna Moreau',
    rating: 4.9,
    specialties: ['Coupe Pixie', 'Coloration Fantaisie', 'Coiffure Mariage'],
    experience: '10 ans d\'expérience',
    services: mockServices
  }
};

export const MinimalData: Story = {
  args: {
    id: '5',
    name: 'Thomas Chen',
    specialties: ['Coupe Moderne'],
    isActive: true
  }
};

export const ManyServices: Story = {
  args: {
    ...Default.args,
    name: 'Expert Stylist',
    services: mockServices,
    specialties: ['Coloration', 'Coupe', 'Balayage', 'Soins', 'Styling', 'Mariage']
  }
};

export const LongName: Story = {
  args: {
    ...Default.args,
    name: 'Marie-Claire Dubois-Fontaine',
    location: 'Paris 16ème - Passy',
    experience: '15 ans d\'expérience en coiffure de luxe'
  }
};