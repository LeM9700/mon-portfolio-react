import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createLead } from './createLead.js';

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
        content: `Tu es DevNomad Assistant, l'assistant de Malik El Boazzati, développeur spécialisé en Flutter, FastAPI/Node.js et intégrations IA.

MISSION: Qualifier les prospects et capturer les leads pour des projets mobiles/web.

STYLE: Professionnel mais accessible, enthousiaste, centré sur la valeur business.

PROCESS DE QUALIFICATION:
1. Accueillir et comprendre le projet
2. Demander les coordonnées (nom, email, entreprise)
3. Qualifier: budget, délai, plateformes (iOS/Android/Web)
4. Proposer un appel Calendly pour approfondir

CALL-TO-ACTION:
- Appel découverte: https://calendly.com/m-elboazzati-epmistes/30min
- Email direct: contact@malik-elboazzati.com

Quand tu as email + nom + projet, utilise createLead().`
      },
      ...messages
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
console.log('🔒 Server Secret present:', !!process.env.SERVER_SECRET);
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

// Simple in-memory rate limiter per IP
const rateMap = new Map();
function rateLimitMiddleware(req, res, next) {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60_000; // 1 minute
  const maxRequests = 10; // 10 requests max per minute per IP
  
  const entry = rateMap.get(clientIp) || { count: 0, start: now };
  
  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }
  
  entry.count++;
  rateMap.set(clientIp, entry);
  
  if (entry.count > maxRequests) {
    return res.status(429).json({ error: 'Trop de tentatives. Veuillez patienter.' });
  }
  
  next();
}

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
app.post('/api/leads', rateLimitMiddleware, async (req, res) => {
  try {
    // Security: check X-API-SECRET header
    const secret = req.headers['x-api-secret'] || req.query.secret;
    if (!process.env.SERVER_SECRET || secret !== process.env.SERVER_SECRET) {
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

app.get('/api/leads', (req, res) => {
  const { secret } = req.query;
  
  // Simple protection
  if (secret !== 'malik_admin_2024') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.status(200).json({
    leads: leads.map(lead => ({
      ...lead,
      email: lead.email.replace(/(.{2}).*(@.*)/, '$1***$2') // Mask email for privacy
    })),
    total: leads.length
  });
});

// AI Chat endpoint with OpenAI integration
const sessions = new Map(); // In-memory sessions for context

app.post('/api/ai/chat', async (req, res) => {
  const { messages, sessionId = 'default' } = req.body;

  // Validate messages
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
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
            // Add to leads array
            const lead = {
              id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              ...leadData,
              createdAt: new Date().toISOString(),
              status: 'new'
            };
            
            leads.push(lead);
            saveLeads();
            
            console.log(`✅ NEW LEAD FROM AI CHAT:`);
            console.log(`👤 ${lead.firstName} ${lead.lastName} (${lead.email})`);
            console.log(`📋 Project: ${lead.summary}`);
            console.log(`💰 Budget: ${lead.budget} | ⏰ Deadline: ${lead.deadline}\n`);
            
            return { leadId: lead.id };
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

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve built React app static files
  app.use(express.static(path.join(process.cwd(), 'dist')));
  
  // Handle React Router - fallback to index.html for SPA routes
  app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    // For all other routes, serve index.html (React Router will handle)
    try {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    } catch (error) {
      console.error('Error serving index.html:', error);
      res.status(500).json({ error: 'Unable to serve application' });
    }
  });
} else {
  // Development: Show API info
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Portfolio API Server (Development)',
      status: 'running',
      endpoints: [
        'GET /api/health',
        'POST /api/leads',
        'GET /api/leads',
        'POST /api/ai/chat'
      ]
    });
  });
}

// 404 handler for API routes not found
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Leads endpoint: http://localhost:${PORT}/api/leads?secret=malik_admin_2024`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});