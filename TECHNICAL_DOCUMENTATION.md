# Documentation Technique - Tchiix Platform

## 📋 Vue d'ensemble du Projet

**Tchiix** est une plateforme moderne de réservation pour salons de beauté et coiffure, développée avec une architecture full-stack scalable. La plateforme connecte les clients aux professionnels de la beauté avec un système de réservation intelligent, gestion temps réel et interface multi-rôles.

### 🎯 Objectifs Principaux
- Simplifier la réservation de services de beauté
- Optimiser la gestion d'agenda pour les professionnels
- Centraliser la gestion administrative
- Offrir une expérience utilisateur moderne et responsive

---

## 🏗️ Architecture Technique

### Stack Technologique

#### **Frontend**
- **React 18** - Bibliothèque UI avec hooks modernes
- **TypeScript** - Typage statique strict
- **Vite** - Build tool rapide avec HMR
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Composants UI pré-construits
- **React Router v6** - Navigation côté client
- **React Query** - Gestion d'état serveur et cache
- **React Hook Form** - Gestion de formulaires performante
- **Zustand** - Store global léger
- **Lucide React** - Icônes vectorielles

#### **Backend & Infrastructure**
- **Supabase** - Backend-as-a-Service
  - **PostgreSQL** - Base de données relationnelle
  - **Row Level Security (RLS)** - Sécurité au niveau des lignes
  - **Real-time subscriptions** - Synchronisation temps réel
  - **Authentication** - OAuth Google intégré
  - **Edge Functions** - Logique métier serverless
  - **Storage** - Stockage de fichiers sécurisé

#### **DevOps & Qualité**
- **Vitest** - Tests unitaires et d'intégration
- **Cypress** - Tests end-to-end
- **Storybook** - Documentation composants
- **GitHub Actions** - CI/CD automatisé
- **Netlify/Vercel** - Déploiement automatique
- **ESLint + TypeScript** - Qualité de code

---

## 🗄️ Architecture de la Base de Données

### Schéma Principal

```sql
-- Gestion des utilisateurs et profils
profiles {
  id: uuid (PK)
  user_id: uuid (FK -> auth.users)
  role: user_role (client|coiffeur|coiffeuse|cosmetique|admin)
  full_name: text
  avatar_url: text
  created_at: timestamp
  updated_at: timestamp
}

-- Professionnels de la beauté
hairdressers {
  id: uuid (PK)
  auth_id: uuid (FK -> auth.users)
  name: text
  email: text (sécurisé par RLS)
  phone: text (sécurisé par RLS)
  specialties: text[]
  rating: numeric (défaut: 5.0)
  experience: text
  location: text
  salon_address: text
  bio: text
  website: text
  instagram: text
  working_hours: jsonb
  image_url: text
  gender: text
  is_active: boolean
}

-- Services disponibles
services {
  id: uuid (PK)
  name: text
  description: text
  price: numeric
  duration: integer (minutes)
  category: text
  created_at: timestamp
  updated_at: timestamp
}

-- Relation professionnels-services
hairdresser_services {
  id: uuid (PK)
  hairdresser_id: uuid (FK)
  service_id: uuid (FK)
  created_at: timestamp
}

-- Nouvelles réservations
new_reservations {
  id: uuid (PK)
  client_user_id: uuid (FK -> auth.users)
  stylist_user_id: uuid (FK -> auth.users)
  service_id: uuid (FK -> services)
  scheduled_at: timestamp
  status: booking_status (pending|confirmed|declined|completed)
  notes: text
  created_at: timestamp
  updated_at: timestamp
}

-- Système d'évaluations
reviews {
  id: uuid (PK)
  reservation_id: uuid (FK)
  client_id: uuid (FK)
  stylist_id: uuid (FK)
  professional_id: uuid (FK)
  rating: integer (1-5)
  comment: text
  status: text (pending|completed)
  review_token: uuid
  is_approved: boolean
  created_at: timestamp
}

-- Messagerie temps réel
messages {
  id: uuid (PK)
  sender_id: uuid (FK)
  receiver_id: uuid (FK)
  body: text
  message_type: text
  is_read: boolean
  created_at: timestamp
}

-- Portfolio des professionnels
portfolio {
  id: uuid (PK)
  stylist_id: uuid (FK)
  service_id: uuid (FK)
  image_url: text
  hairstyle_name: text
  is_featured: boolean
  display_order: integer
  created_at: timestamp
}

-- Audit de sécurité
security_audit_logs {
  id: uuid (PK)
  user_id: uuid (FK)
  event_type: text
  event_data: jsonb
  ip_address: inet
  user_agent: text
  severity: text (low|medium|high|critical)
  created_at: timestamp
}

-- Journalisation système
system_logs {
  id: serial (PK)
  event_type: text
  message: text
  metadata: jsonb
  created_at: timestamp
}
```

### Sécurité RLS (Row Level Security)

**Politiques de sécurité implémentées :**

1. **Isolation des données utilisateur**
   - Chaque utilisateur ne peut accéder qu'à ses propres données
   - Les professionnels voient leurs clients et réservations
   - Les admins ont accès global avec audit trail

2. **Protection des informations sensibles**
   - Les emails/téléphones des professionnels ne sont pas publics
   - Accès conditionnel basé sur l'authentification
   - Fonction sécurisée pour données publiques

3. **Validation et intégrité**
   - Triggers de validation automatique
   - Contraintes d'intégrité référentielle
   - Limitation de taux pour éviter les abus

---

## 🔐 Système d'Authentification et Autorisation

### OAuth Google Integration

```typescript
// Configuration OAuth
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Connexion Google
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
};
```

### Gestion des Rôles

**Types d'utilisateurs :**
- **Client** : Réservation, historique, évaluations
- **Coiffeur/Coiffeuse** : Gestion agenda, clients, services
- **Cosmétique** : Spécialiste soins esthétiques
- **Admin** : Gestion globale, analytics, modération

### Protection des Routes

```typescript
// Composant de protection par rôle
<RoleProtectedRoute allowedRoles={['admin']}>
  <AdminDashboard />
</RoleProtectedRoute>

// Hook de vérification d'autorisation
const { user, role, isAuthorized } = useAuth();
```

---

## 🎨 Architecture Frontend

### Structure des Composants

```
src/
├── components/           # Composants réutilisables
│   ├── ui/              # Components de base (shadcn)
│   ├── client/          # Composants spécifiques clients
│   ├── stylist/         # Composants professionnels
│   └── admin/           # Composants administration
├── pages/               # Pages principales
│   ├── client/          # Espace client
│   ├── stylist/         # Espace professionnel
│   └── admin/           # Espace admin
├── hooks/               # Hooks personnalisés
├── layouts/             # Layouts par rôle
├── utils/               # Fonctions utilitaires
├── stores/              # État global (Zustand)
└── locales/             # Traductions i18n
```

### Hooks Personnalisés

**Hooks de données :**
- `useAuth()` - Gestion authentification
- `useCompleteProfessionals()` - Liste des professionnels
- `useSecureHairdresserData()` - Données sécurisées professionnels
- `useProfessionalServices()` - Services par professionnel
- `useClientReservations()` - Réservations client
- `useStylistReservations()` - Réservations professionnel

**Hooks UI :**
- `useToast()` - Notifications
- `useResponsive()` - Responsive design
- `useMobile()` - Détection mobile

### État Global (Zustand)

```typescript
interface UIState {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
  sidebarOpen: boolean;
  currentUser: User | null;
  notifications: Notification[];
}
```

### Internationalisation (i18n)

**Namespaces supportés :**
- `common` - Éléments communs
- `auth` - Authentification
- `client` - Interface client
- `stylist` - Interface professionnel
- `admin` - Interface admin

---

## 🔄 Fonctionnalités Temps Réel

### Subscriptions Supabase

```typescript
// Écoute des nouvelles réservations
const channel = supabase
  .channel('reservations-realtime')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'new_reservations',
    filter: `stylist_user_id=eq.${userId}`
  }, (payload) => {
    // Mise à jour temps réel
    handleNewReservation(payload.new);
  })
  .subscribe();
```

### Fonctionnalités Temps Réel Actives

1. **Réservations** - Notifications instantanées
2. **Messages** - Chat en temps réel
3. **Disponibilités** - Mise à jour calendrier
4. **Évaluations** - Nouvelles notes/commentaires
5. **Portfolio** - Ajout/modification photos

---

## 📱 Responsive Design & PWA

### Breakpoints Tailwind

```css
/* Mobile first approach */
sm: 640px   /* Tablets */
md: 768px   /* Small laptops */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Progressive Web App

**Caractéristiques PWA :**
- **Manifest** - Installation sur mobile
- **Service Worker** - Cache et offline
- **Web Push** - Notifications push
- **Responsive** - Adaptation automatique

---

## 🧪 Tests et Qualité

### Tests Unitaires (Vitest)

```typescript
// Exemple de test hook
describe('useAuth', () => {
  test('should return user data when authenticated', async () => {
    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.user).toBeDefined();
      expect(result.current.role).toBe('client');
    });
  });
});
```

### Tests E2E (Cypress)

```typescript
// Test de flux de réservation
describe('Booking Flow', () => {
  it('should allow client to book appointment', () => {
    cy.login('client@example.com');
    cy.visit('/professionals');
    cy.get('[data-testid="professional-card"]').first().click();
    cy.get('[data-testid="book-button"]').click();
    cy.selectDate('2024-01-15');
    cy.selectTime('14:00');
    cy.get('[data-testid="confirm-booking"]').click();
    cy.contains('Réservation confirmée').should('be.visible');
  });
});
```

### Couverture de Tests

- **Hooks personnalisés** : >85% couverture
- **Composants UI** : >80% couverture
- **Flux principaux E2E** : 100% scénarios critiques
- **Sécurité** : Tests RLS automatisés

---

## 🚀 Déploiement et CI/CD

### Pipeline GitHub Actions

```yaml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:coverage
      - name: E2E tests
        run: npm run cypress:run
  
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Netlify
        run: npm run build && netlify deploy --prod
```

### Environnements

1. **Development** - Hot reload local
2. **Staging** - Déploiement automatique sur PR
3. **Production** - Déploiement sur merge main

---

## 🔧 Configuration et Variables

### Variables d'Environnement

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Développement
VITE_DEV_MODE=true
VITE_ENABLE_DEVTOOLS=true
```

### Configuration Build

```javascript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast']
        }
      }
    }
  }
});
```

---

## 🔒 Sécurité et Conformité

### Mesures de Sécurité Implémentées

1. **Authentification forte**
   - OAuth 2.0 / OpenID Connect
   - Tokens JWT sécurisés
   - Session timeout automatique

2. **Autorisation granulaire**
   - RBAC (Role-Based Access Control)
   - RLS au niveau base de données
   - Validation côté serveur

3. **Protection des données**
   - Chiffrement en transit (HTTPS)
   - Chiffrement au repos (Supabase)
   - Anonymisation logs sensibles

4. **Audit et monitoring**
   - Logs d'accès complets
   - Détection d'anomalies
   - Alertes sécurité automatiques

### Conformité

- **RGPD** - Gestion données personnelles
- **Accessibilité** - WCAG 2.1 AA
- **Performance** - Core Web Vitals optimisés

---

## 📊 Performance et Optimisation

### Métriques de Performance

- **First Contentful Paint** : <1.5s
- **Largest Contentful Paint** : <2.5s
- **Time to Interactive** : <3.5s
- **Cumulative Layout Shift** : <0.1

### Optimisations Implémentées

1. **Code Splitting**
   - Lazy loading des routes
   - Chunks vendor séparés
   - Dynamic imports

2. **Cache Strategy**
   - React Query cache
   - Service Worker cache
   - CDN pour assets statiques

3. **Images**
   - Lazy loading natif
   - Formats optimisés (WebP)
   - Responsive images

---

## 🛠️ Guide de Développement

### Installation Locale

```bash
# Clone du repository
git clone https://github.com/your-org/tchiix-platform.git
cd tchiix-platform

# Installation des dépendances
npm install

# Configuration environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés

# Base de données locale (optionnel)
npx supabase start

# Démarrage développement
npm run dev
```

### Commandes Utiles

```bash
# Développement
npm run dev              # Serveur de développement
npm run build            # Build production
npm run preview          # Aperçu build local

# Tests
npm run test             # Tests unitaires
npm run test:coverage    # Couverture de tests
npm run cypress:open     # Tests E2E interface
npm run cypress:run      # Tests E2E CLI

# Qualité
npm run lint             # Vérification ESLint
npm run type-check       # Vérification TypeScript
npm run storybook        # Documentation composants

# Base de données
npx supabase db reset    # Reset DB locale
npx supabase db diff     # Différences schéma
npx supabase gen types   # Génération types TS
```

### Contribution

1. **Fork** du repository
2. **Branch** feature : `git checkout -b feature/nouvelle-fonctionnalite`
3. **Commit** : `git commit -m 'Ajout nouvelle fonctionnalité'`
4. **Push** : `git push origin feature/nouvelle-fonctionnalite`
5. **Pull Request** avec description détaillée

---

## 📈 Monitoring et Analytics

### Métriques Business

- **Utilisateurs actifs** (DAU/MAU)
- **Taux de conversion** réservations
- **Satisfaction client** (évaluations)
- **Revenus générés** par professionnel
- **Taux de retention** clients

### Métriques Techniques

- **Disponibilité service** (>99.9%)
- **Temps de réponse** API (<200ms)
- **Erreurs applicatives** (<0.1%)
- **Performance frontend** (Core Web Vitals)

### Alertes Configurées

- **Erreurs critiques** → Notification immédiate
- **Performance dégradée** → Alerte 5min
- **Quotas Supabase** → Monitoring continu
- **Tentatives d'intrusion** → Blocage automatique

---

## 🚀 Roadmap Technique

### Version 2.0 (Q2 2024)

- **Machine Learning** - Recommandations intelligentes
- **API publique** - Intégrations partenaires
- **Multi-langues** - Support international
- **Mobile native** - Applications iOS/Android

### Version 3.0 (Q4 2024)

- **Microservices** - Architecture distribuée
- **IA conversationnelle** - Chatbot intelligent
- **Blockchain** - Système de récompenses
- **IoT** - Intégration objets connectés

---

**📞 Support Technique**

- **Documentation** : [docs.tchiix.com](https://docs.tchiix.com)
- **Issues GitHub** : [github.com/tchiix/platform/issues](https://github.com/tchiix/platform/issues)
- **Discord** : [discord.gg/tchiix-dev](https://discord.gg/tchiix-dev)
- **Email** : dev@tchiix.com

---

*Dernière mise à jour : Janvier 2024*