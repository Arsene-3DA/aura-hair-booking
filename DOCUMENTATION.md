# Documentation - Configuration Authentification Google

## Configuration Google OAuth

### 1. Créer un projet Google Cloud
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un projet existant
3. Activer l'API Google+ API et Google OAuth 2.0

### 2. Configurer OAuth 2.0
1. Dans Google Cloud Console, aller dans "APIs & Services" > "Credentials"
2. Cliquer sur "Create Credentials" > "OAuth Client ID"
3. Choisir "Web application" comme type d'application
4. Ajouter les URIs autorisées :
   - **JavaScript origins** : 
     - `http://localhost:5173` (développement)
     - `https://votre-domaine.com` (production)
   - **Redirect URIs** :
     - `http://localhost:5173/auth/v1/callback` (développement)
     - `https://yazsvadgmkpatqyjrzcw.supabase.co/auth/v1/callback` (Supabase)

### 3. Configuration Supabase
1. Dans le dashboard Supabase, aller dans "Authentication" > "Providers"
2. Activer "Google" 
3. Renseigner :
   - **Client ID** : obtenu depuis Google Cloud Console
   - **Client Secret** : obtenu depuis Google Cloud Console
4. Vérifier que les Redirect URLs sont correctes dans "URL Configuration"

### 4. URLs de redirection Supabase
Dans "Authentication" > "URL Configuration" :
- **Site URL** : `http://localhost:5173` (dev) ou URL de production
- **Redirect URLs** : 
  - `http://localhost:5173/post-auth`
  - URL de production avec `/post-auth`

### 5. Variables d'environnement
Copier `.env.example` vers `.env.local` et renseigner :
```
VITE_SUPABASE_URL=https://yazsvadgmkpatqyjrzcw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GOOGLE_CLIENT_ID=votre_client_id_google.apps.googleusercontent.com
```

## Système de rôles

### Rôles disponibles
- **client** : utilisateur standard, peut réserver
- **stylist** : coiffeur, peut gérer ses rendez-vous
- **admin** : administrateur, accès complet

### Attribution des rôles
- Nouveaux utilisateurs = rôle "client" par défaut
- Admins peuvent promouvoir via l'interface admin
- Fonction SQL : `set_user_role(user_id, new_role)`

### Tables principales
- `auth.users` : authentification Supabase
- `public.profiles` : profils utilisateurs + rôles
- Trigger automatique lors de l'inscription

## Architecture Auth

### Flux d'authentification
1. Utilisateur clique "Se connecter avec Google"
2. Redirection vers Google OAuth
3. Retour sur `/post-auth` avec session
4. Création automatique du profil dans `profiles`
5. Redirection vers dashboard selon le rôle

### Composants clés
- `GoogleAuthContext` : gestion session + rôles
- `RequireAuth` : protection des routes
- Layouts par rôle : `ClientLayout`, `StylistLayout`, `AdminLayout`