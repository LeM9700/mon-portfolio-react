import fs from 'fs';
import path from 'path';

// Simple in-memory storage for development
let leads = [];

// File-based persistence (optional)
const LEADS_FILE = path.join(process.cwd(), 'leads.json');

// Load existing leads on startup
try {
  if (fs.existsSync(LEADS_FILE)) {
    const data = fs.readFileSync(LEADS_FILE, 'utf8');
    leads = JSON.parse(data);
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

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
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

      console.log(`New lead captured: ${email} (${source})`);
      console.log(`Project: ${summary}`);
      console.log(`Budget: ${budget}, Deadline: ${deadline}`);

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
  }

  if (req.method === 'GET') {
    // Return leads (for admin purposes)
    const { secret } = req.query;
    
    // Simple protection - in production, use proper auth
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
  }

  res.status(405).json({ error: 'Method not allowed' });
}