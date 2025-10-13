{
  "agent_name": "DevNomad Assistant — Portfolio Upgrade",
  "version": "1.0.0",
  "context": {
    "owner": "Malik El Boazzati",
    "positioning": "Développeur Flutter + backends FastAPI/Node + intégrations IA",
    "stack": ["React", "Vite", "TailwindCSS"],
    "calendar_url": "https://calendly.com/m-elboazzati-epmistes/30min",
    "language_policy": {
      "ui_text": "fr",
      "code_comments": "en"
    },
    "goal": "Transformer le portfolio en véritable outil de conversion (lead capture + Calendly + IA) avec SEO/UX propres."
  },
  "objectives": [
    "Rendre le site professionnel, fluide, responsive et accessible.",
    "Maximiser la conversion (formulaire de lead + Calendly + chatbot IA qualifiant).",
    "Clarifier le positionnement (Flutter + Backend + IA) avec preuves et bénéfices business.",
    "Assurer un SEO technique propre et une base de déploiement stable."
  ],
  "branches": [
    "feature/lead-capture",
    "feature/ai-bot",
    "fix/assets-seo"
  ],
  "deliverables": [
    "ContactForm fonctionnel + endpoint `/api/leads` (mock possible).",
    "Calendly intégré (popup + bouton hero) + listener d’événement programmé.",
    "IABot connecté à OpenAI/Anthropic avec streaming + mémoire + fonctions (createLead/bookCall/sendRecap).",
    "Images manquantes ajoutées + balises alt corrigées.",
    "SEO de base (title/meta/OG/Twitter) configuré.",
    "Dark mode toggle + lazy-loading images + transitions propres.",
    "README.md avec instructions de lancement/test.",
    "Scripts npm: `lint` et `preview`."
  ],
  "constraints": {
    "do_not_change_major_deps": true,
    "all_code_must_run": true,
    "no_placeholder_disconnected": true,
    "aria_accessibility": true,
    "responsive_first": true
  },
  "tasks": [
    {
      "id": "lead-capture",
      "title": "Lead Capture & Calendly",
      "steps": [
        "Créer `components/CTAButton.jsx` avec lien Calendly (target=_blank, rel=noopener).",
        "Installer `react-calendly` et ajouter `components/CalendlyPopup.jsx` (popup widget).",
        "Ajouter `components/CalendlyListener.jsx` avec `useCalendlyEventListener` pour POST `/api/leads` sur `onEventScheduled`.",
        "Créer `components/ContactForm.jsx` (fields: firstName, lastName, email, description, budget, deadline, platforms[]) avec validations simples.",
        "Créer `/api/leads` (Node/Edge) qui accepte JSON et stocke en mémoire ou fichier local (mock).",
        "Ajouter CTA dans le Hero: “Réserver un appel (30 min)” + “Décrire mon projet”."
      ]
    },
    {
      "id": "ai-bot",
      "title": "Chatbot IA qualifiant (remplacer IABot aléatoire)",
      "steps": [
        "Créer `api/ai/chat` (Edge + streaming) vers OpenAI ou Anthropic.",
        "Implémenter mémoire de session en local (ex: Map par sessionId) ou cookie/ID de conversation.",
        "Dans `components/IABot.jsx`, consommer le ReadableStream (effet typing).",
        "Collecter email/budget/deadline/platforms au fil de la conversation.",
        "Exposer fonctions outillées: `createLead(payload)`, `bookCall()`, `sendRecap(email, recap)`.",
        "Politique de conversation: FR par défaut, EN si l’utilisateur commence en EN; ton pro et concis."
      ],
      "agent_system_prompt": "Tu es “DevNomad Assistant”, l’agent d’accueil du portfolio de Malik El Boazzati (développeur Flutter + backend FastAPI/Node + intégrations IA). Objectif #1: qualifier le prospect en <3 minutes et capturer ses coordonnées. Objectif #2: proposer un créneau d’appel de 20 minutes quand le projet est sérieux. Objectif #3: rassurer avec la valeur: MVP rapide (Flutter iOS/Android), backend (FastAPI/Node), IA utile (chatbot, résumés, automatisations). Contraintes: FR par défaut; ton pro, chaleureux, concis; ne jamais promettre prix/délais fermes avant qualification; toujours finir par une action (appel, récap). Données à collecter, une question par message: (1) email + prénom/nom; (2) description projet (1 phrase); (3) plateformes (iOS/Android/Web); (4) 3 features clés; (5) budget: <3k, 3–8k, 8–20k, 20k+; (6) deadline; (7) IA souhaitée (chatbot, résumé, automation, pas sûr). Règles: si budget <3k et scope large → proposer atelier cadrage 2h ou mini-MVP; si budget ≥3k + deadline claire → proposer appel 20 min (Calendly). Capacités outils (retour JSON): createLead(payload), bookCall(datetime?), sendRecap(email, recap), checkPortfolio(section). Procédure: saluer + valeur; demander email/prénom (bloquant); 3–5 questions; résumer en 4 puces; proposer 3 créneaux J+1 à J+5 ou lien Calendly; appeler createLead puis sendRecap."
    },
    {
      "id": "assets-seo",
      "title": "Assets, SEO, Accessibilité",
      "steps": [
        "Ajouter `src/assets/profile.jpg` (photo pro générique si besoin).",
        "Ajouter `src/assets/projects/project1.jpg`, `project2.jpg`, `project3.jpg` (mock ok).",
        "Remplacer chemins cassés et ajouter `alt` descriptifs sur toutes les images.",
        "Dans `index.html`: `<title>Malik El Boazzati — Flutter, Backend & IA</title>` et meta description complète.",
        "Ajouter OpenGraph & Twitter cards (og:title, og:description, og:image, twitter:card, etc.).",
        "Ajouter favicon, meta thème et lang=fr au HTML."
      ]
    },
    {
      "id": "ux-tech",
      "title": "UX/UI & Technique",
      "steps": [
        "Dark mode toggle: implémenter via Tailwind (`dark:`) + `useTheme` hook simple.",
        "Images: ajouter `loading=\"lazy\"` + tailles max responsives.",
        "Transitions: hover/active/ focus visibles; micro-animations avec Framer Motion au Hero/CTA.",
        "Scripts npm: `lint` et `preview`.",
        "Vérifier ARIA-labels sur CTA et inputs; contrastes AA.",
        "Responsive: mobile-first jusqu’au desktop XXL."
      ]
    },
    {
      "id": "content-positioning",
      "title": "Contenu & Positionnement clair",
      "steps": [
        "Hero copy: “Je conçois vos applications mobiles iOS/Android en Flutter, avec backend FastAPI/Node et intégration IA.”",
        "Section Offre: MVP rapide & scalable; IA utile (chatbot, résumé, automatisations); accompagnement complet.",
        "Section Preuves sociales: logos/avis (placeholders acceptés) + CTA vers prise de rendez-vous."
      ]
    }
  ],
  "components_to_create": [
    "components/CTAButton.jsx",
    "components/CalendlyPopup.jsx",
    "components/CalendlyListener.jsx",
    "components/ContactForm.jsx",
    "components/IABot.jsx",
    "hooks/useTheme.js",
    "api/leads (mock JSON/file or simple in-memory)",
    "api/ai/chat (Edge streaming)"
  ],
  "api_contracts": {
    "POST_/api/leads": {
      "description": "Create a lead from form, Calendly, or chatbot.",
      "payload": {
        "source": "portfolio|calendly|chatbot",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "summary": "string",
        "budget": "<3k|3-8k|8-20k|20k+",
        "deadline": "string",
        "platforms": ["iOS", "Android", "Web"],
        "aiNeeds": ["chatbot", "resume", "automation", "unknown"],
        "notes": "string"
      },
      "response": { "ok": true }
    },
    "POST_/api/ai/chat": {
      "description": "LLM streaming endpoint with session memory.",
      "payload": {
        "messages": [
          { "role": "system|user|assistant", "content": "string" }
        ],
        "sessionId": "string"
      },
      "stream": true
    }
  },
  "calendly": {
    "url": "https://calendly.com/m-elboazzati-epmistes/30min",
    "embed": "popup",
    "event_listener": "onEventScheduled -> POST /api/leads"
  },
  "seo": {
    "title": "Malik El Boazzati — Flutter, Backend & IA",
    "description": "Développeur Flutter pour apps iOS/Android, backends FastAPI/Node et intégrations IA. MVP rapides, performants et scalables.",
    "open_graph": {
      "og:title": "Malik El Boazzati — Flutter, Backend & IA",
      "og:description": "Apps mobiles Flutter + backends + IA pour accélérer votre MVP.",
      "og:image": "/og-cover.jpg",
      "og:type": "website"
    },
    "twitter": {
      "twitter:card": "summary_large_image",
      "twitter:title": "Malik El Boazzati — Flutter, Backend & IA",
      "twitter:description": "MVP mobiles rapides et intelligents.",
      "twitter:image": "/og-cover.jpg"
    }
  },
  "scripts": {
    "lint": "eslint src --ext .jsx,.js",
    "preview": "vite preview"
  },
  "acceptance_criteria": [
    "Le Hero affiche 2 CTA fonctionnels (Calendly + Formulaire).",
    "L’agent IA stream les réponses, pose les questions de qualification et peut créer un lead.",
    "Un event Calendly confirmé crée un lead via `/api/leads`.",
    "Toutes les images se chargent (aucun chemin cassé) + `loading=\"lazy\"`.",
    "SEO de base présent (title, meta, OG/Twitter) et balises alt descriptives.",
    "Dark mode toggle opérationnel et persistant (localStorage).",
    "Site responsive et accessible (vérif rapide Lighthouse: >90 Perf/Acc/SEO/Best)."
  ],
  "notes_for_agent": [
    "Keep code minimal, modular and documented.",
    "Prefer functional components and hooks.",
    "Avoid heavy new deps; only add `react-calendly` and Framer Motion if needed.",
    "Use French copy for UI; English for code comments."
  ]
}
