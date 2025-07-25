import type { Meta, StoryObj } from '@storybook/react';
import { PhotoUpload } from '@/components/PhotoUpload';
import { useState } from 'react';

const meta = {
  title: 'Components/PhotoUpload',
  component: PhotoUpload,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## PhotoUpload

Composant d'upload de photos avec intégration Supabase Storage et fallbacks intelligents.

### Fonctionnalités
- **Upload vers Supabase Storage** : Sauvegarde sécurisée avec politiques RLS
- **Validation** : Format et taille de fichier (max 5MB, images uniquement)
- **Fallback intelligent** : ui-avatars.com pour génération automatique
- **Optimisation** : Compression et redimensionnement automatique
- **UX** : Prévisualisation en temps réel, indicateurs de progression

### Sécurité
- Upload dans bucket \`stylists\` avec nom de fichier \`{profileId}/{slug}.jpg\`
- Validation côté client et serveur
- Politiques RLS pour accès restreint par utilisateur

### Utilisation
\`\`\`tsx
<PhotoUpload 
  currentAvatarUrl={profile?.avatar_url}
  onAvatarUpdate={(url) => updateProfile({ avatar_url: url })}
/>
\`\`\`

### Formats supportés
- JPG, PNG, WebP
- Taille max : 5MB
- Dimensions recommandées : 400x400px
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    currentAvatarUrl: {
      control: 'text',
      description: 'URL de l\'avatar actuel'
    }
  }
} satisfies Meta<typeof PhotoUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component with state for interactive stories
const PhotoUploadWrapper = ({ currentAvatarUrl: initialUrl, ...props }: any) => {
  const [avatarUrl, setAvatarUrl] = useState(initialUrl);
  
  const handleAvatarUpdate = (url: string) => {
    setAvatarUrl(url);
    console.log('Avatar updated:', url);
  };

  return (
    <div className="w-full max-w-md">
      <PhotoUpload 
        currentAvatarUrl={avatarUrl}
        onAvatarUpdate={handleAvatarUpdate}
        {...props}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <PhotoUploadWrapper {...args} />,
  args: {
    currentAvatarUrl: null,
    onAvatarUpdate: () => {}
  }
};

export const WithExistingPhoto: Story = {
  render: (args) => <PhotoUploadWrapper {...args} />,
  args: {
    currentAvatarUrl: 'https://ui-avatars.com/api/?name=Sophie+Martin&background=6366f1&color=ffffff&size=400&bold=true&format=png',
    onAvatarUpdate: () => {}
  }
};

export const WithRealPhoto: Story = {
  render: (args) => <PhotoUploadWrapper {...args} />,
  args: {
    currentAvatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    onAvatarUpdate: () => {}
  }
};

export const EmptyState: Story = {
  render: (args) => <PhotoUploadWrapper {...args} />,
  args: {
    currentAvatarUrl: '',
    onAvatarUpdate: () => {}
  }
};