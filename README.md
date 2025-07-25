# Beauty Salon - Plateforme de Réservation

[![CI](https://github.com/your-username/beauty-salon/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/beauty-salon/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/your-username/beauty-salon/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/beauty-salon)
[![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=flat&logo=storybook&logoColor=white)](https://your-username.github.io/beauty-salon/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat&logo=vercel)](https://beauty-salon.vercel.app)

**✅ Phase 6 - Qualité & DevOps terminée avec succès !**

Plateforme moderne de réservation pour salons de beauté avec architecture full-stack complète.

## 🚀 Fonctionnalités Complètes (6 Phases)

### ✅ Phase 1 - Architecture de Base
- **React + TypeScript** avec Vite
- **Tailwind CSS + shadcn/ui** pour l'interface
- **Supabase** pour backend et authentification
- **React Router** pour navigation multi-pages

### ✅ Phase 2 - Authentification Multi-Rôles  
- **3 rôles** : Client, Coiffeur/Stylist, Admin
- **Sécurité RLS** avec Row-Level Security
- **Routes protégées** par rôle
- **Session management** persistant

### ✅ Phase 3 - Interface Client
- **Réservation complète** : sélection pro + service + créneau
- **Calendrier interactif** avec disponibilités temps réel
- **Historique rendez-vous** avec statuts
- **Design responsive** mobile-first

### ✅ Phase 4 - Dashboard Stylist
- **Planning hebdomadaire** avec vue calendrier
- **Gestion file d'attente** des réservations
- **Chat client** temps réel
- **Paramètres salon** (horaires, services, tarifs)

### ✅ Phase 5 - Dashboard Admin
- **Analytics complètes** avec graphiques Recharts
- **Gestion utilisateurs** (promote, suspend, reset)
- **Export CSV** des réservations
- **Audit trail** temps réel des actions
- **Quotas Supabase** monitoring

### ✅ Phase 6 - UX Globales  
- **Thème Dark/Light** avec persistance
- **i18n** (FR/EN) avec namespaces
- **Store Zustand** pour état UI global
- **Toast notifications** contextuelles
- **Accessibilité** WCAG AA compliant

### ✅ Phase 7 - Qualité & DevOps
- **Tests Vitest** >80% couverture
- **Tests E2E Cypress** scénarios rôle-basés
- **Storybook** documentation composants
- **CI/CD GitHub Actions** lint + test + build
- **Déploiement automatique** Vercel

## 🛠 Stack Technique

**Frontend**
- React 18 + TypeScript strict
- Tailwind CSS + shadcn/ui
- React Query + Zustand
- React Router + React Hook Form

**Backend**  
- Supabase (Auth + DB + Realtime)
- PostgreSQL avec RLS
- Edge Functions pour logique métier

**DevOps**
- Vitest + Testing Library
- Cypress pour E2E
- GitHub Actions CI/CD
- Vercel déploiement

## 📦 Installation Rapide

```bash
# Clone et installation
git clone https://github.com/your-username/beauty-salon.git
cd beauty-salon
npm install

# Configuration Supabase
cp .env.example .env.local
# Ajouter VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

# Démarrage
npm run dev
```

## 🧪 Tests & Qualité

```bash
# Tests unitaires avec couverture
npm run test:coverage

# Tests E2E Cypress  
npm run cypress:open

# Storybook documentation
npm run storybook

# Linting TypeScript
npm run type-check
```

## 📊 Métriques Qualité

- ✅ **Tests unitaires** : >80% couverture
- ✅ **Tests E2E** : Scénarios complets par rôle
- ✅ **TypeScript** : Mode strict activé
- ✅ **Accessibilité** : Focus management + ARIA
- ✅ **Performance** : Lazy loading + Code splitting
- ✅ **CI/CD** : Pipeline automatisé complet

## 🚀 Déploiement

**Production automatique** : Push sur `main` → Deploy Vercel  
**Storybook** : Auto-deployed sur GitHub Pages  
**Tests** : Lancés sur chaque PR

## 📚 Documentation

- **Storybook** : [Components docs](https://your-username.github.io/beauty-salon/)
- **API** : Documentation Supabase intégrée  
- **Tests** : Couverture dans `coverage/`

---

**🎉 Projet production-ready avec architecture scalable !**