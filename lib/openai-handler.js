import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for DevNomad Assistant
const SYSTEM_PROMPT = `Tu es "DevNomad Assistant", l'agent d'accueil du portfolio de Malik El Boazzati, développeur Flutter spécialisé en backend FastAPI/Node.js et intégrations IA.

OBJECTIFS PRINCIPAUX :
1. QUALIFIER le prospect en moins de 3 minutes
2. CAPTURER ses coordonnées (email obligatoire)
3. PROPOSER un créneau d'appel de 30 minutes pour les projets sérieux

VALEUR PROPOSÉE :
- MVP rapides (2-4 semaines) avec Flutter iOS/Android
- Backend robuste (FastAPI/Node.js)
- IA utile (chatbots, résumés, automatisations)
- Architecture évolutive qui grandit avec le business

STYLE DE CONVERSATION :
- Français par défaut (basculer en anglais si l'utilisateur commence en anglais)
- Ton professionnel, chaleureux et concis
- Orienté résultat et business
- Ne jamais promettre de prix/délais fermes avant qualification
- Toujours terminer par une suggestion d'action

DONNÉES À COLLECTER (une question par message) :
1. Email professionnel + prénom/nom (OBLIGATOIRE)
2. Description du projet (1 phrase)
3. Plateformes cibles (iOS/Android/Web)
4. Top 3 fonctionnalités clés
5. Budget estimé (<3k, 3-8k, 8-20k, 20k+)
6. Deadline/urgence
7. Besoins IA (chatbot, résumé, automation, pas sûr)

RÈGLES DE DÉCISION :
- Si budget <3k ET scope large → proposer atelier cadrage 2h payant
- Si budget ≥3k ET deadline claire → proposer appel 30min
- Si email + 3 réponses minimum → créer le LEAD

FONCTIONS DISPONIBLES :
- createLead(email, firstName, lastName, projectData) : enregistre le prospect
- bookCall() : ouvre Calendly
- sendRecap(email, summary) : envoie un récapitulatif

PROCÉDURE :
1. Saluer avec une phrase sur la valeur
2. Demander email + prénom (bloquant)
3. Poser les questions de qualification progressivement
4. APRÈS avoir collecté : email + projet + plateformes + budget + besoins IA :
   - TOUJOURS appeler createLead() pour enregistrer le prospect
   - PUIS proposer bookCall() si budget >3k ou sendRecap() pour résumer

DÉCLENCHEMENT DES FONCTIONS :
- createLead() → DÈS que tu as email + projet + budget (minimum requis)
- bookCall() → Après createLead + si prospect qualifié
- sendRecap() → Pour résumer et engager le prospect
4. Résumer en 4 puces : objectifs, plateformes, budget, timeline
5. Si lead qualifié → proposer 3 créneaux ou Calendly
6. Appeler createLead() puis sendRecap()

Sois naturel, empathique et focus sur leurs besoins business. Pose UNE question à la fois.`;

// Available functions for OpenAI
const AVAILABLE_FUNCTIONS = [
  {
    name: 'createLead',
    description: 'Crée un lead qualifié dans le système',
    parameters: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email professionnel du prospect'
        },
        firstName: {
          type: 'string',
          description: 'Prénom du prospect'
        },
        lastName: {
          type: 'string',
          description: 'Nom du prospect'
        },
        projectDescription: {
          type: 'string',
          description: 'Description du projet'
        },
        platforms: {
          type: 'array',
          items: { type: 'string' },
          description: 'Plateformes ciblées (iOS, Android, Web)'
        },
        budget: {
          type: 'string',
          enum: ['<3k', '3-8k', '8-20k', '20k+'],
          description: 'Budget estimé'
        },
        deadline: {
          type: 'string',
          description: 'Deadline ou urgence'
        },
        aiNeeds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Besoins en IA'
        }
      },
      required: ['email', 'firstName', 'projectDescription']
    }
  },
  {
    name: 'bookCall',
    description: 'Propose de réserver un appel via Calendly',
    parameters: {
      type: 'object',
      properties: {
        urgency: {
          type: 'string',
          enum: ['normal', 'urgent'],
          description: 'Niveau d\'urgence'
        }
      }
    }
  },
  {
    name: 'sendRecap',
    description: 'Envoie un récapitulatif par email',
    parameters: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email du destinataire'
        },
        summary: {
          type: 'string',
          description: 'Résumé de la conversation'
        }
      },
      required: ['email', 'summary']
    }
  }
];

// Handle OpenAI streaming response
export async function handleAIChat(messages) {
  try {
    // Prepare messages for OpenAI
    const openaiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Create streaming completion
    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: openaiMessages,
      tools: AVAILABLE_FUNCTIONS.map(func => ({ type: 'function', function: func })),
      tool_choice: 'auto',
      stream: true,
      temperature: 0.7,
      max_tokens: 500
    });

    return stream;

  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Erreur de communication avec l\'IA');
  }
}

// Handle function calls
export async function executeFunctionCall(functionName, args, sessionId, { createLead, bookCall, sendRecap }) {
  try {
    switch (functionName) {
      case 'createLead': {
        const leadData = {
          source: 'chatbot',
          firstName: args.firstName,
          lastName: args.lastName || '',
          email: args.email,
          summary: args.projectDescription,
          platforms: args.platforms || [],
          budget: args.budget || 'unknown',
          deadline: args.deadline || 'not specified',
          aiNeeds: args.aiNeeds || ['unknown'],
          notes: `Lead qualifié via chatbot IA - Session: ${sessionId}`
        };
        
        const leadResult = await createLead(leadData);
        return {
          success: true,
          message: `Lead créé avec succès pour ${args.firstName} (${args.email})`,
          leadId: leadResult?.leadId
        };
      }

      case 'bookCall': {
        await bookCall(args.urgency);
        return {
          success: true,
          message: '🎯 Parfait ! Pour discuter de votre projet en détail :\n\n📅 Réserver un appel de 30 minutes\nhttps://calendly.com/m-elboazzati-epmistes/30min\n\nCet appel nous permettra de :\n• Affiner les spécifications techniques\n• Vous présenter des exemples similaires\n• Établir un devis précis et un planning\n\nÀ très bientôt ! 🚀',
          action: 'open_calendly'
        };
      }

      case 'sendRecap': {
        await sendRecap(args.email, args.summary);
        return {
          success: true,
          message: `✅ Récapitulatif envoyé à ${args.email} !\n\nEn attendant, n'hésitez pas à :\n\n🎯 Voir le portfolio\n📧 Envoyer un email\n📅 Réserver un appel\n\nMalik vous recontactera rapidement pour discuter de votre projet ! 🚀`
        };
      }

      default: {
        return {
          success: false,
          message: `Fonction inconnue: ${functionName}`
        };
      }
    }
  } catch (error) {
    console.error(`Erreur fonction ${functionName}:`, error);
    return {
      success: false,
      message: `Erreur lors de l'exécution de ${functionName}`
    };
  }
}

// Fallback responses when OpenAI is not available
export function getFallbackResponse(messages) {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
  
  if (lastMessage.includes('bonjour') || lastMessage.includes('hello') || messages.length <= 1) {
    return `Bonjour ! 👋 Je suis DevNomad Assistant, votre interlocuteur pour discuter de projets mobiles et IA avec Malik.

Malik crée des MVP mobiles iOS/Android en Flutter, avec backends robustes et IA intégrée, livrés en 2-4 semaines.

Pour mieux vous conseiller, puis-je avoir votre **email professionnel** et votre **prénom** ?`;
  }

  if (lastMessage.includes('@')) {
    return `Parfait ! Maintenant, pouvez-vous me décrire votre projet en **une phrase** ?

Par exemple : "Une app mobile de réservation pour restaurants" ou "Un dashboard analytique avec chatbot IA"...`;
  }

  return `Je comprends votre besoin. Pour vous proposer la meilleure approche, j'aurais besoin de quelques informations supplémentaires.

Souhaitez-vous que je vous mette en relation directe avec Malik pour un appel de 30 minutes ? 

🗓️ **Réserver un appel** : https://calendly.com/m-elboazzati-epmistes/30min`;
}

export { SYSTEM_PROMPT, AVAILABLE_FUNCTIONS };