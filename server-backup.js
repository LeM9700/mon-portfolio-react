import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// API Routes
app.post('/api/leads', (req, res) => {
  try {
    const {
      source = 'unknown',
      firstName = '',
      lastName = '',
      email = '',
      summary = '',
      budget = '',
      deadline = '',
      platforms = [],
      aiNeeds = [],
      notes = ''
    } = req.body;

    // Basic validation
    if (!email || !firstName) {
      return res.status(400).json({
        error: 'Email and firstName are required'
      });
    }

    // Create lead object
    const lead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source,
      firstName,
      lastName,
      email,
      summary,
      budget,
      deadline,
      platforms,
      aiNeeds,
      notes,
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    // Add to leads array
    leads.push(lead);
    
    // Save to file
    saveLeads();

    console.log(`\n✅ NEW LEAD CAPTURED:`);
    console.log(`👤 ${firstName} ${lastName} (${email})`);
    console.log(`📋 Project: ${summary}`);
    console.log(`💰 Budget: ${budget} | ⏰ Deadline: ${deadline}`);
    console.log(`📱 Platforms: ${platforms.join(', ')}`);
    console.log(`🔗 Source: ${source}`);
    console.log(`📝 Notes: ${notes}\n`);

    return res.status(200).json({
      ok: true,
      message: 'Lead created successfully',
      leadId: lead.id
    });

  } catch (error) {
    console.error('Error creating lead:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
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

// AI Chat endpoint with session management
const sessions = new Map(); // In-memory sessions

app.post('/api/ai/chat', (req, res) => {
  const { messages, sessionId = 'default' } = req.body;
  
  // Get or create session
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      messages: [],
      collectedData: {
        email: null,
        firstName: null,
        lastName: null,
        description: null,
        platforms: [],
        budget: null,
        deadline: null,
        aiNeeds: []
      },
      step: 'greeting'
    });
  }
  
  const session = sessions.get(sessionId);
  const userMessage = messages[messages.length - 1];
  
  // Add user message to session
  session.messages.push(userMessage);
  
  // Generate response based on session state
  const response = generateAIResponse(session, userMessage);
  session.messages.push(response);
  
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Simulate streaming
  const text = response.content;
  let index = 0;
  
  const interval = setInterval(() => {
    if (index < text.length) {
      res.write(text.charAt(index));
      index++;
    } else {
      res.end();
      clearInterval(interval);
    }
  }, 30); // 30ms delay between characters for typing effect
});

// Generate AI response based on session state and user input
function generateAIResponse(session, userMessage) {
  const { collectedData, step } = session;
  const content = userMessage.content.toLowerCase().trim();
  
  // System personality
  const responses = {
    greeting: () => {
      if (step === 'greeting') {
        session.step = 'email_request';
        return {
          role: 'assistant',
          content: `Bonjour ! 👋 Je suis DevNomad Assistant, votre interlocuteur pour discuter de vos projets digitaux avec Malik.\n\nMalik est spécialisé dans le développement d'applications mobiles Flutter (iOS/Android), d'APIs backend performantes (FastAPI/Node.js) et d'intégrations IA intelligentes.\n\nSon approche : créer des MVP fonctionnels rapidement, avec une architecture solide pour évoluer sereinement.\n\nPour mieux comprendre votre projet, puis-je avoir votre **email professionnel** et votre **prénom** ?`
        };
      }
      return null;
    },
    
    email_request: () => {
      // Try to extract email and name
      const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const words = content.split(/\\s+/);
      
      if (emailMatch) {
        session.collectedData.email = emailMatch[0];
        
        // Try to extract name
        const emailIndex = words.findIndex(word => word.includes('@'));
        if (emailIndex > 0) {
          session.collectedData.firstName = words[emailIndex - 1];
        } else if (words.length > 1) {
          session.collectedData.firstName = words[0];
        }
        
        session.step = 'project_description';
        return {
          role: 'assistant',
          content: `Parfait ! Ravi de faire votre connaissance${session.collectedData.firstName ? ` ${session.collectedData.firstName}` : ''} 😊\n\nMaintenant, parlons de votre projet : **Pouvez-vous me décrire en une phrase ce que vous souhaitez développer ?**\n\nPar exemple : "Une app mobile de gestion de tâches pour étudiants" ou "Une plateforme web de mise en relation entre freelances et entreprises"...`
        };
      } else {
        return {
          role: 'assistant',
          content: `Je n'ai pas pu identifier votre email. Pouvez-vous me donner votre **email professionnel** et votre **prénom** ?\n\nPar exemple : "Mon email est john.doe@entreprise.com, je m'appelle John"`
        };
      }
    },
    
    project_description: () => {
      if (content.length > 10) {
        session.collectedData.description = userMessage.content;
        session.step = 'platforms';
        return {
          role: 'assistant',
          content: `Très intéressant ! "${userMessage.content}"\n\n**Quelles plateformes souhaitez-vous cibler ?**\n\n📱 iOS (iPhone/iPad)\n🤖 Android \n💻 Application Web\n\nVous pouvez me dire "iOS et Android" ou "Les trois plateformes" par exemple.`
        };
      } else {
        return {
          role: 'assistant',
          content: `Pouvez-vous me donner un peu plus de détails sur votre projet ? Une description en quelques mots m'aiderait à mieux comprendre vos besoins.`
        };
      }
    },
    
    platforms: () => {
      const platforms = [];
      if (content.includes('ios') || content.includes('iphone') || content.includes('ipad')) {
        platforms.push('iOS');
      }
      if (content.includes('android')) {
        platforms.push('Android');
      }
      if (content.includes('web') || content.includes('site') || content.includes('navigateur')) {
        platforms.push('Web');
      }
      if (content.includes('toutes') || content.includes('trois') || content.includes('tout')) {
        platforms.push('iOS', 'Android', 'Web');
      }
      
      if (platforms.length > 0) {
        session.collectedData.platforms = [...new Set(platforms)]; // Remove duplicates
        session.step = 'budget';
        return {
          role: 'assistant',
          content: `Parfait ! ${platforms.join(' + ')} 🎯\n\n**Quel est votre budget estimé pour ce projet ?**\n\n💰 Moins de 3 000€\n💰 3 000€ - 8 000€ \n💰 8 000€ - 20 000€\n💰 Plus de 20 000€\n\nOu simplement "budget flexible" si vous souhaitez d'abord connaître les options.`
        };
      } else {
        return {
          role: 'assistant',
          content: `Pouvez-vous préciser les plateformes ? Par exemple :\n- "iOS et Android pour une app mobile"\n- "Web pour commencer"\n- "Les trois plateformes"`
        };
      }
    },
    
    budget: () => {
      let budget = null;
      if (content.includes('moins') || content.includes('<') || content.includes('3000') || content.includes('3k')) {
        budget = '<3k';
      } else if (content.includes('3') && content.includes('8')) {
        budget = '3-8k';
      } else if (content.includes('8') && content.includes('20')) {
        budget = '8-20k';
      } else if (content.includes('20') || content.includes('plus')) {
        budget = '20k+';
      }
      
      if (budget) {
        session.collectedData.budget = budget;
        session.step = 'deadline';
        return {
          role: 'assistant',
          content: `Noté pour le budget ! 📊\n\n**Avez-vous une deadline particulière ?**\n\nPar exemple :\n- "Dans 2 mois"\n- "Pour avril 2025" \n- "Pas d'urgence particulière"\n- "Le plus vite possible"`
        };
      } else {
        return {
          role: 'assistant',
          content: `Pouvez-vous préciser votre budget ? Vous pouvez dire :\n- "Moins de 3000 euros"\n- "Entre 5000 et 10000 euros" \n- "Budget flexible, dépend du scope"\n\nCela m'aide à adapter mes recommandations.`
        };
      }
    },
    
    deadline: () => {
      session.collectedData.deadline = userMessage.content;
      session.step = 'ai_needs';
      return {
        role: 'assistant',
        content: `Parfait ! ⏰\n\n**Dernière question : Souhaitez-vous intégrer de l'IA dans votre projet ?**\n\n🤖 Chatbot conversationnel\n📄 Résumé/analyse de contenu\n⚡ Automatisations intelligentes\n❓ Pas sûr(e) des possibilités\n🚫 Pas d'IA pour l'instant\n\nL'IA peut vraiment différencier votre produit !`
      };
    },
    
    ai_needs: () => {
      const aiNeeds = [];
      if (content.includes('chatbot') || content.includes('chat') || content.includes('conversation')) {
        aiNeeds.push('chatbot');
      }
      if (content.includes('résumé') || content.includes('analyse') || content.includes('contenu')) {
        aiNeeds.push('resume');
      }
      if (content.includes('automation') || content.includes('automatisation')) {
        aiNeeds.push('automation');
      }
      if (content.includes('pas sûr') || content.includes('possibilités') || content.includes('découvrir')) {
        aiNeeds.push('unknown');
      }
      if (content.includes('pas d') || content.includes('non') || content.includes('sans')) {
        aiNeeds.push('none');
      }
      
      session.collectedData.aiNeeds = aiNeeds.length > 0 ? aiNeeds : ['unknown'];
      session.step = 'summary';
      
      return {
        role: 'assistant',
        content: generateSummaryAndProposal(session.collectedData)
      };
    }
  };
  
  // Execute the appropriate response generator
  const responseGenerator = responses[step];
  if (responseGenerator) {
    const response = responseGenerator();
    if (response) return response;
  }
  
  // Fallback response
  return {
    role: 'assistant',
    content: `Je n'ai pas bien compris. Pouvez-vous reformuler ? 🤔`
  };
}

function generateSummaryAndProposal(data) {
  const { firstName, email, description, platforms, budget, deadline, aiNeeds } = data;
  
  let summary = `Récapitulatif de votre projet :\n\n`;
  summary += `👤 **Contact :** ${firstName || 'Prospect'}\n`;
  summary += `📋 **Projet :** ${description}\n`;
  summary += `📱 **Plateformes :** ${platforms.join(' + ')}\n`;
  summary += `💰 **Budget :** ${budget}\n`;
  summary += `⏰ **Délai :** ${deadline}\n`;
  summary += `🤖 **IA :** ${aiNeeds.includes('none') ? 'Non souhaitée' : aiNeeds.join(', ')}\n\n`;
  
  // Decision logic based on budget
  if (budget === '<3k' && platforms.length > 1) {
    summary += `**🎯 Ma recommandation :**\n`;
    summary += `Avec ce budget, je vous propose un **atelier de cadrage de 2h** (150€) pour :\n`;
    summary += `- Définir précisément les fonctionnalités prioritaires\n`;
    summary += `- Concevoir un MVP minimal mais impactant\n`;
    summary += `- Établir une roadmap par phases\n\n`;
    summary += `Cela vous permettra d'avoir une vision claire avant de vous engager sur le développement complet.\n\n`;
  } else if (budget !== '<3k') {
    summary += `**🎯 Ma recommandation :**\n`;
    summary += `Votre projet a un scope intéressant ! Je vous propose un **appel de 30 minutes** pour :\n`;
    summary += `- Affiner les spécifications techniques\n`;
    summary += `- Vous présenter des exemples similaires\n`;
    summary += `- Vous donner un devis détaillé\n\n`;
  }
  
  summary += `**⚡ Avantages de travailler avec Malik :**\n`;
  summary += `- MVP fonctionnel en 2-4 semaines\n`;
  summary += `- Architecture Flutter native iOS + Android\n`;
  summary += `- API backend robuste (FastAPI/Node)\n`;
  summary += `- Intégration IA sur-mesure\n`;
  summary += `- Accompagnement post-lancement\n\n`;
  
  summary += `**🎯 Souhaitez-vous que je réserve un créneau dans l'agenda de Malik ?**\n\n`;
  summary += `Je peux également créer votre dossier prospect dès maintenant pour accélérer les choses ! 🚀`;
  
  return summary;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    leads_count: leads.length,
    active_sessions: sessions.size
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Leads endpoint: http://localhost:${PORT}/api/leads?secret=malik_admin_2024`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});