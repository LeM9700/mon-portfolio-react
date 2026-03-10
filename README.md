# Portfolio de Malik El Boazzati

> **Développeur Flutter & Backend spécialisé en IA**  
> Portfolio professionnel avec système de capture de leads et chatbot qualifiant

## 🚀 Vue d'ensemble

Ce portfolio moderne présente mes compétences en développement mobile (Flutter), backend (FastAPI/Node.js) et intégrations IA. Il intègre des fonctionnalités avancées de conversion :

- **Lead Capture System** : Formulaire de contact + intégration Calendly
- **Chatbot IA Qualifiant** : Agent conversationnel pour qualifier les prospects
- **SEO Optimisé** : Meta tags, Open Graph, Schema.org
- **Dark Mode** : Thème sombre persistant
- **Responsive Design** : Mobile-first avec Tailwind CSS

## 🛠 Stack Technique

- **Frontend** : React 18, Vite, Tailwind CSS, Framer Motion
- **Backend API** : Node.js + Express (pour leads et IA)
- **Intégrations** : Calendly, streaming IA
- **Déploiement** : Prêt pour Vercel/Netlify

## 📋 Installation & Lancement

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation
```bash
# Cloner le repo
git clone <url-du-repo>
cd mon-portfolio-react

# Installer les dépendances
npm install

# Lancer en développement
npm run dev:full  # Lance frontend + API en parallèle
```

### Scripts disponibles
```bash
npm run dev        # Frontend seul (port 5173)
npm run api        # API serveur seul (port 3001)
npm run dev:full   # Frontend + API en parallèle
npm run build      # Build de production
npm run preview    # Preview du build
npm run lint       # Vérification ESLint
```

## 🔧 Configuration

### Variables d'environnement (optionnel)
Créer un fichier `.env.local` :
```env
VITE_CALENDLY_URL=https://calendly.com/votre-lien
VITE_API_URL=http://localhost:3001
```

### Personnalisation
1. **Images** : Remplacer les placeholders dans `/src/assets/` et `/public/`
2. **Contenu** : Modifier les textes dans les composants
3. **Calendly** : Changer l'URL dans les composants CTA
4. **Couleurs** : Adapter le thème dans `tailwind.config.js`

## 📊 Fonctionnalités Principales

### 1. Lead Capture System
- **Formulaire de contact** avec validation
- **Intégration Calendly** en popup
- **API /api/leads** pour stocker les prospects
- **Listener automatique** pour événements Calendly

### 2. Chatbot IA Qualifiant
- **Streaming conversationnel** avec effet typing
- **Mémoire de session** par utilisateur  
- **Qualification automatique** : email, projet, budget, deadline
- **Fonctions outillées** : createLead, bookCall, sendRecap
- **Système de prompt** configurable

### 3. SEO & Performance
- **Meta tags complets** (title, description, OG, Twitter)
- **Schema.org** structured data
- **Images lazy-loaded** avec alt descriptifs
- **Dark mode** avec persistance localStorage
- **Responsive design** mobile-first

## 🎯 Flux de Conversion

1. **Visiteur arrive** sur le Hero avec 2 CTA principaux
2. **Option A** : Réservation directe via Calendly → Lead automatique
3. **Option B** : Formulaire détaillé → Lead qualifié
4. **Option C** : Chatbot IA → Qualification progressive + Lead
5. **Suivi** : Tous les leads centralisés via l'API

## 📈 Analytics & Monitoring

### Consultation des leads
```bash
# API endpoint (dev)
GET http://localhost:3001/api/leads?secret=VOTRE_API_SECRET

# Health check
GET http://localhost:3001/api/health
```

### Logs automatiques
- Nouveaux leads loggés en console
- Statistiques de sessions IA
- Événements Calendly trackés

## 🚀 Déploiement

### Vercel (recommandé)
```bash
# Build automatique depuis GitHub
# Configurer les variables d'environnement dans Vercel
```

### Netlify
```bash
npm run build
# Upload du dossier dist/
```

### Configuration serveur
- **API** : Déployer `server.js` sur un service Node.js
- **Base de données** : Remplacer le stockage fichier par PostgreSQL/MongoDB
- **Sécurité** : Ajouter authentification et rate limiting

## 🔒 Sécurité & Production

### Recommandations
- [ ] Changer le secret d'admin dans `server.js`
- [ ] Ajouter validation côté serveur stricte
- [ ] Implémenter rate limiting sur les APIs
- [ ] Utiliser HTTPS en production
- [ ] Sauvegarder les leads en base de données

## 🎨 Personnalisation Avancée

### Thème et couleurs
Modifier `tailwind.config.js` pour adapter la palette de couleurs.

### Contenus
- `Header.jsx` : Hero copy et CTAs
- `About.jsx` : Présentation et stack technique  
- `Projects.jsx` : Portfolio de projets
- `IASection.jsx` : Offre de services

### Chatbot IA
Personnaliser le prompt système dans `server.js` ligne ~95.

## 📞 Support

Pour toute question technique ou personnalisation :
- **Email** : malik@example.com
- **Calendly** : [Réserver un appel](https://calendly.com/m-elboazzati-epmistes/30min)

---

**🎯 Objectif** : Transformer ce portfolio en véritable outil de conversion pour décrocher des projets clients qualifiés.

**💡 Next Steps** : 
- Intégrer OpenAI/Anthropic pour l'IA
- Connecter une vraie base de données
- Ajouter un dashboard admin
- A/B tester les CTAs
