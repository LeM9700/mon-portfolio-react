import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createLead } from './createLead.js';
import prisma from './prismaClient.js';

// Utility functions
function getFallbackResponse(messages) {
  const lastMessage = messages[messages.length - 1]?.content || '';
  
  if (lastMessage.toLowerCase().includes('email') || lastMessage.includes('@')) {
    return "Merci de m'avoir donné vos coordonnées ! Je vais traiter votre demande et vous recontacter rapidement. En attendant, vous pouvez aussi réserver un appel : https://calendly.com/m-elboazzati-epmistes/30min";
  }
  
  return "👋 Bonjour ! Je suis l'assistant de Malik pour vos projets Flutter/IA. Pouvez-vous me parler de votre projet et me donner votre email pour que je puisse vous recontacter ?";
}

async function handleAIChat(messages) {
  return await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Tu es Malik AI — l'assistant commercial de Malik El Boazzati, développeur expert Flutter, FastAPI/Node.js et intégrations IA (+5 ans d'expérience, projets livrés en 2 à 4 semaines).

LANGUE : Réponds TOUJOURS en français, quelle que soit la langue du visiteur.
TON : Chaleureux, direct, expert. Maximum 3-4 phrases par réponse. Une seule question à la fois.

PÉRIMÈTRE STRICT :
Tu réponds UNIQUEMENT sur : apps mobiles Flutter/iOS/Android, backends FastAPI/Node.js, intégrations IA/LLM, MVP, estimations coût/délai.
Toute question hors sujet → redirige poliment vers le projet du visiteur.

FLOW DE QUALIFICATION (ordre impératif — ne saute aucune étape) :
1. Accueil + question ouverte sur le projet (jamais demander l'email en premier)
2. Comprendre le besoin : type d'app, utilisateurs cibles, problème résolu
3. Détails : plateformes souhaitées (iOS/Android/Web), fonctionnalités clés
4. Qualification : budget approximatif, délai souhaité
5. Seulement après les étapes 1-4 → demande prénom + email pour envoyer un récap personnalisé
6. Appelle createLead() avec toutes les infos collectées — UNE SEULE FOIS par conversation
7. Propose le Calendly pour approfondir

RÉPONSES AUX OBJECTIONS :
- "Combien ça coûte ?" → "Selon le scope : MVP Flutter simple ~3 000-5 000€, avec backend + IA ~8 000-20 000€. Qu'est-ce que vous avez en tête comme projet ?"
- "C'est trop cher" → "On peut prioriser le cœur fonctionnel d'abord et itérer par versions. Quel budget avez-vous pour la V1 ?"
- "Vous avez des références ?" → "Oui — un e-commerce Flutter livré en 3 semaines, un SaaS multi-tenant avec IA, une marketplace mobile. Je vous envoie les détails par email."
- "C'est urgent" → "Je prends 2 à 4 nouvelles missions par mois. Un appel de 30 min permet de bloquer un créneau rapidement."
- "Je veux juste regarder" → "Pas de problème ! Quel type de projet vous intéresse en ce moment ?"

CALL-TO-ACTION :
Appel découverte (30 min, gratuit) : https://calendly.com/m-elboazzati-epmistes/30min

RÈGLES ABSOLUES :
- Ne demande jamais plusieurs informations dans un seul message
- N'invente aucun prix, délai ou fonctionnalité non mentionné dans ce prompt
- N'appelle createLead() que si tu as : prénom + email + description du projet
- createLead() = une seule fois par session, jamais deux fois
- Si le visiteur donne son email sans le reste, continue à qualifier avant d'appeler createLead()`
      },
      ...messages.slice(-12)
    ],
    stream: true,
    tools: [
      {
        type: 'function',
        function: {
          name: 'createLead',
          description: 'Créer un lead qualifié avec les informations client',
          parameters: {
            type: 'object',
            properties: {
              firstName: { type: 'string', description: 'Prénom du client' },
              lastName: { type: 'string', description: 'Nom du client' },
              email: { type: 'string', description: 'Email du client' },
              summary: { type: 'string', description: 'Résumé du projet' },
              budget: { type: 'string', description: 'Budget estimé' },
              deadline: { type: 'string', description: 'Délai souhaité' },
              platforms: { type: 'string', description: 'Plateformes cibles (iOS/Android/Web)' }
            },
            required: ['firstName', 'email', 'summary']
          }
        }
      }
    ]
  });
}

async function executeFunctionCall(functionName, args, sessionId, handlers) {
  if (handlers[functionName]) {
    try {
      const result = await handlers[functionName](args);
      
      // Return formatted message based on function
      if (functionName === 'createLead') {
        return {
          message: `✅ Parfait ! J'ai bien enregistré vos informations. Je vous envoie un récapitulatif par email et Malik vous recontactera rapidement.

📅 Pour accélérer, vous pouvez aussi réserver un appel direct : https://calendly.com/m-elboazzati-epmistes/30min`
        };
      }
      
      return result;
    } catch (error) {
      console.error(`Error executing ${functionName}:`, error);
      return { message: "Une erreur est survenue lors du traitement de votre demande." };
    }
  }
  
  return { message: `Fonction ${functionName} non trouvée.` };
}

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting server...');
console.log('📊 Environment:', process.env.NODE_ENV);
console.log('🔌 Port:', PORT);
console.log('🔑 OpenAI Key present:', !!process.env.OPENAI_API_KEY);
console.log('🔒 API Secret present:', !!process.env.API_SECRET);
console.log('💾 Database URL present:', !!process.env.DATABASE_URL);

// Initialize OpenAI
let openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI initialized successfully');
  } else {
    console.warn('⚠️  OpenAI API key not found - AI features disabled');
  }
} catch (error) {
  console.error('❌ OpenAI initialization failed:', error.message);
}

// Middleware
app.use(cors());
app.use(express.json());

// In-memory rate limiter factory
function createRateLimiter(maxRequests, windowMs = 60_000) {
  const map = new Map();
  return function (req, res, next) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = map.get(ip) || { count: 0, start: now };
    if (now - entry.start > windowMs) { entry.count = 0; entry.start = now; }
    entry.count++;
    map.set(ip, entry);
    if (entry.count > maxRequests) {
      return res.status(429).json({ error: 'Trop de tentatives. Veuillez patienter.' });
    }
    next();
  };
}

const rateLimitLeads = createRateLimiter(10);  // 10 req/min — création de leads
const rateLimitChat  = createRateLimiter(25);  // 25 req/min — conversations chatbot

// Simple in-memory storage for development
let leads = [];

// File-based persistence
const LEADS_FILE = path.join(process.cwd(), 'leads.json');

// Load existing leads on startup
try {
  if (fs.existsSync(LEADS_FILE)) {
    const data = fs.readFileSync(LEADS_FILE, 'utf8');
    leads = JSON.parse(data);
    console.log(`Loaded ${leads.length} existing leads`);
  }
} catch (error) {
  console.log('No existing leads file found, starting fresh');
}

// Save leads to file
const saveLeads = () => {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  } catch (error) {
    console.error('Error saving leads:', error);
  }
};

// API Routes with security
app.post('/api/leads', rateLimitLeads, async (req, res) => {
  try {
    // Security: check X-API-SECRET header
    const secret = req.headers['x-api-secret'] || req.query.secret;
    if (!process.env.API_SECRET || secret !== process.env.API_SECRET) {
      return res.status(401).json({ error: 'Unauthorized - Invalid or missing API secret' });
    }

    // Basic validation for email
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return res.status(400).json({ error: 'Email invalide ou manquant' });
    }

    // Use Prisma createLead function
    const lead = await createLead(req.body);
    
    console.log(`\n✅ NEW LEAD CAPTURED via Prisma:`);
    console.log(`👤 ${lead.name || 'N/A'} (${lead.email})`);
    console.log(`📋 Project: ${lead.message || 'N/A'}`);
    console.log(`💰 Budget: ${lead.budget || 'N/A'} | ⏰ Deadline: ${lead.deadline || 'N/A'}`);
    console.log(`📱 Platforms: ${lead.platforms || 'N/A'}`);
    console.log(`🔗 Source: ${lead.source} | Variant: ${lead.variant}\n`);

    return res.status(201).json({ ok: true, lead });

  } catch (error) {
    console.error('createLead error:', error);
    
    // More specific error messages
    if (error.message.includes('Email invalide')) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Erreur serveur interne' });
  }
});

app.get('/api/leads', async (req, res) => {
  const { secret } = req.query;

  if (!process.env.API_SECRET || secret !== process.env.API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const allLeads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
    return res.status(200).json({
      leads: allLeads.map(lead => ({
        ...lead,
        email: lead.email.replace(/(.{2}).*(@.*)/, '$1***$2')
      })),
      total: allLeads.length
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return res.status(500).json({ error: 'Erreur serveur interne' });
  }
});

// AI Chat endpoint with OpenAI integration
const sessions = new Map(); // In-memory sessions for context

app.post('/api/ai/chat', rateLimitChat, async (req, res) => {
  const { messages, sessionId = 'default' } = req.body;

  // Validate messages
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }
  if (messages.length > 20) {
    return res.status(400).json({ error: 'Trop de messages dans la requête' });
  }
  const lastContent = messages[messages.length - 1]?.content;
  if (typeof lastContent === 'string' && lastContent.length > 1000) {
    return res.status(400).json({ error: 'Message trop long (max 1000 caractères)' });
  }

  try {
    // Set streaming headers
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Check if OpenAI is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-real-api-key-here') {
      console.log('📝 Using fallback response (OpenAI not configured)');
      
      const fallbackText = getFallbackResponse(messages);
      
      // Simulate typing effect
      let index = 0;
      const interval = setInterval(() => {
        if (index < fallbackText.length) {
          res.write(fallbackText.charAt(index));
          index++;
        } else {
          res.end();
          clearInterval(interval);
        }
      }, 30);
      
      return;
    }

    // Use OpenAI for real conversations
    console.log(`🤖 Processing AI chat for session: ${sessionId}`);
    
    const stream = await handleAIChat(messages);
    
    let fullResponse = '';
    let functionCall = null;

    // Process the streaming response
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      
      if (delta?.content) {
        fullResponse += delta.content;
        res.write(delta.content);
      }
      
      // Handle tool calls (new API format)
      if (delta?.tool_calls) {
        for (const toolCall of delta.tool_calls) {
          if (toolCall.type === 'function') {
            if (!functionCall) {
              functionCall = { name: toolCall.function.name, arguments: '' };
            }
            if (toolCall.function.arguments) {
              functionCall.arguments += toolCall.function.arguments;
            }
          }
        }
      }
    }

    // Handle function calls if present
    if (functionCall && functionCall.arguments && functionCall.arguments.trim()) {
      try {
        const args = JSON.parse(functionCall.arguments);
        console.log(`🔧 Executing function: ${functionCall.name}`, args);
        
        const functionHandlers = {
          createLead: async (leadData) => {
            const lead = await createLead({ ...leadData, source: 'chatbot', variant: 'A' });

            console.log(`✅ NEW LEAD FROM AI CHAT (Prisma):`);
            console.log(`👤 ${lead.name} (${lead.email})`);
            console.log(`📋 Project: ${lead.message}`);
            console.log(`💰 Budget: ${lead.budget} | ⏰ Deadline: ${lead.deadline}\n`);

            return {
              leadId: lead.id,
              message: `✅ Parfait ! J'ai bien transmis vos informations à Malik. Il vous recontactera sous 24h.\n\nPour accélérer, réservez un appel directement : https://calendly.com/m-elboazzati-epmistes/30min`
            };
          },
          
          bookCall: async () => {
            console.log('📅 Calendly booking requested via AI');
            return { action: 'open_calendly' };
          },
          
          sendRecap: async (email, summary) => {
            console.log(`📧 Recap requested for ${email}: ${summary.substring(0, 100)}...`);
            return { sent: true };
          }
        };
        
        const result = await executeFunctionCall(
          functionCall.name, 
          args, 
          sessionId, 
          functionHandlers
        );
        
        // Send the formatted message from the function
        if (result.message) {
          res.write('\n\n' + result.message);
        }
        
      } catch (error) {
        console.error('Function call error:', error);
        console.error('Function call arguments were:', functionCall.arguments);
        console.error('Function call name was:', functionCall.name);
      }
    }

    res.end();

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    // Fallback error response
    const errorMessage = 'Désolé, une erreur technique est survenue. Vous pouvez me recontacter ou réserver directement un appel : https://calendly.com/m-elboazzati-epmistes/30min';
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < errorMessage.length) {
        res.write(errorMessage.charAt(index));
        index++;
      } else {
        res.end();
        clearInterval(interval);
      }
    }, 30);
  }
});

// Health check (BEFORE catch-all route)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    leads_count: leads.length,
    active_sessions: sessions.size
  });
});

// Serve static frontend when dist exists (production)
const distPath = path.join(process.cwd(), 'dist');

if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
  // Serve static files
  app.use(express.static(distPath));
  
  // Fallback for HTML5 history - avoid wildcard route that breaks Express v5+
  app.use((req, res, next) => {
    // Only send index.html for GET requests that accept HTML and are not API calls
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Development or no dist folder - show API info
  app.get('/', (req, res) => {
    res.json({ 
      message: process.env.NODE_ENV === 'production' ? 'Portfolio API (Frontend building...)' : 'Portfolio API (Development)',
      status: 'running',
      endpoints: ['GET /api/health', 'POST /api/leads', 'GET /api/leads', 'POST /api/ai/chat'],
      note: process.env.NODE_ENV === 'production' ? 'Frontend build in progress' : 'Use npm run dev for frontend'
    });
  });
}

// 404 handler for API routes not found
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Leads endpoint: http://localhost:${PORT}/api/leads?secret=${process.env.API_SECRET}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});