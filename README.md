
# SalonBook - Plateforme de Réservation de Coiffure

Une application web moderne pour la réservation de services de coiffure à Ottawa, développée avec React, TypeScript et Supabase.

## 🌟 Fonctionnalités

### Pour les Clients
- **Recherche de professionnels** : Parcourir les coiffeurs et coiffeuses par spécialité et genre
- **Réservation en ligne** : Système de calendrier interactif pour choisir date et heure
- **Profils détaillés** : Voir les spécialités, notes et expérience des professionnels
- **Gestion des rendez-vous** : Suivi des réservations en attente et confirmées

### Pour les Professionnels
- **Dashboard personnel** : Gestion des réservations et du planning
- **Validation des demandes** : Accepter ou refuser les demandes de réservation (30min max)
- **Profil professionnel** : Gestion des spécialités, photos et informations
- **Calendrier intégré** : Vue d'ensemble des créneaux disponibles et réservés

### Pour les Administrateurs
- **Gestion globale** : Vue d'ensemble de tous les utilisateurs et réservations
- **Statistiques** : Tableau de bord avec métriques de performance
- **Gestion des comptes** : Création et modification des comptes professionnels

## 🏗️ Architecture Technique

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build et le développement
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants UI
- **React Router** pour la navigation
- **TanStack Query** pour la gestion des données
- **Lucide React** pour les icônes

### Backend
- **Supabase** comme Backend-as-a-Service
- **PostgreSQL** pour la base de données
- **Row Level Security (RLS)** pour la sécurité
- **Real-time subscriptions** pour les mises à jour en temps réel

### Authentification
- **Supabase Auth** avec gestion des rôles (client, coiffeur, admin)
- **Sécurité par RLS** basée sur les rôles utilisateur

## 📋 Prérequis

- **Node.js** 18+ et npm/yarn
- **Compte Supabase** (gratuit)
- **Git** pour le versioning

## 🚀 Installation Locale

### 1. Cloner le Projet

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Installer les Dépendances

```bash
npm install
```

### 3. Configuration Supabase

1. Créer un projet sur [Supabase](https://supabase.com)
2. Récupérer les clés API dans Settings > API
3. Copier les informations dans `src/integrations/supabase/client.ts`

```typescript
const SUPABASE_URL = "votre-url-supabase"
const SUPABASE_PUBLISHABLE_KEY = "votre-cle-publique"
```

### 4. Configuration de la Base de Données

Le projet utilise les tables suivantes :
- **users** : Utilisateurs avec rôles (client, coiffeur, admin)
- **hairdressers** : Profils des professionnels
- **bookings** : Réservations avec statuts et expiration
- **clients** : Informations clients étendues

Les migrations SQL sont disponibles dans le dossier `supabase/migrations/`.

### 5. Démarrer le Serveur de Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🗄️ Structure du Projet

```
src/
├── components/           # Composants réutilisables
│   ├── ui/              # Composants shadcn/ui
│   ├── HairdresserCard.tsx
│   ├── BookingCalendar.tsx
│   ├── Footer.tsx
│   └── Header.tsx
├── pages/               # Pages principales
│   ├── Index.tsx        # Page d'accueil
│   ├── AuthPage.tsx     # Authentification
│   └── Dashboard/       # Tableaux de bord
├── hooks/               # Hooks personnalisés
├── integrations/        # Configuration Supabase
├── contexts/            # Contexts React
└── utils/               # Utilitaires
```

## 🎯 Fonctionnement des Réservations

### Processus de Réservation
1. **Client** : Sélectionne un professionnel et un créneau
2. **Système** : Crée une réservation avec statut "en_attente" et expiration 30min
3. **Professionnel** : Reçoit la demande et peut accepter/refuser
4. **Nettoyage automatique** : Les demandes non traitées expirent automatiquement

### Statuts des Réservations
- `en_attente` : En attente de validation (expire après 30min)
- `confirmé` : Acceptée par le professionnel
- `refusé` : Refusée par le professionnel
- `annulé` : Annulée par le client

## 🔧 Scripts Disponibles

```bash
npm run dev          # Démarrage en mode développement
npm run build        # Build de production
npm run preview      # Aperçu du build
npm run lint         # Vérification du code
```

## 🌐 Déploiement

### Via Lovable (Recommandé)
1. Cliquer sur "Publish" dans l'interface Lovable
2. Le site sera déployé automatiquement

### Déploiement Manuel
Le projet peut être déployé sur :
- **Vercel** : Connecter le repo GitHub
- **Netlify** : Drag & drop du dossier `dist/`
- **Autres** : Tout hébergeur supportant les SPA React

## 🔑 Variables d'Environnement

```env
# Configuration Supabase (déjà dans le code)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🎨 Personnalisation

### Thème et Couleurs
- **Couleurs principales** : Gold (#D4AF37) et Orange
- **Classes Tailwind personnalisées** : `gradient-gold`, `bg-gradient-gold`
- **Configuration** : `tailwind.config.ts`

### Ajout de Nouvelles Fonctionnalités
1. Créer les composants dans `src/components/`
2. Ajouter les pages dans `src/pages/`
3. Mettre à jour les routes dans `src/App.tsx`
4. Configurer Supabase si nécessaire

## 📊 Base de Données

### Modèle de Données
- **Authentification** : Gérée par Supabase Auth
- **Rôles** : client, coiffeur, admin
- **RLS** : Sécurité au niveau des lignes activée
- **Relations** : FK entre users, hairdressers, bookings

### Fonctions SQL Importantes
- `get_current_user_role()` : Récupère le rôle de l'utilisateur connecté
- `clean_expired_bookings()` : Nettoie les réservations expirées

## 🔍 Débogage

### Console de Développement
- Les logs sont visibles dans la console du navigateur
- Utilisation extensive de `console.log` pour le debug

### Supabase Dashboard
- **Tables** : Visualiser les données
- **Auth** : Gérer les utilisateurs
- **Logs** : Suivre les requêtes et erreurs

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📱 Contact & Support

- **Adresse** : 123 Rue Somerset, Ottawa, ON K1R 5T3, Canada
- **Téléphone** : (613) 990-1234
- **Email** : contact@salonottawa.ca

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Développé avec ❤️ pour les professionnels de la coiffure d'Ottawa**
