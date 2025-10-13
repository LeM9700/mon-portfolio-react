import prisma from './prismaClient.js';

export async function createLead(payload) {
  // Champs autorisés - mapping flexible pour compatibilité frontend
  const allowedFields = [
    'email', 'name', 'firstName', 'lastName', 'message', 'summary', 
    'platforms', 'features', 'budget', 'deadline', 'aiNeeds', 
    'variant', 'source', 'notes'
  ];

  // Validation de base
  const email = payload.email?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Email invalide ou manquant');
  }

  // Mapping et nettoyage des données
  const data = {};
  
  for (const field of allowedFields) {
    if (payload[field] !== undefined && payload[field] !== null) {
      let value = payload[field];
      
      // Troncature des chaînes longues (max 2000 chars)
      if (typeof value === 'string') {
        value = value.trim().slice(0, 2000);
      }
      
      // Mapping spéciaux pour compatibilité
      if (field === 'firstName' || field === 'lastName') {
        // Combine firstName/lastName dans name si name n'existe pas
        if (!data.name && !payload.name) {
          const firstName = payload.firstName?.trim() || '';
          const lastName = payload.lastName?.trim() || '';
          if (firstName || lastName) {
            data.name = `${firstName} ${lastName}`.trim();
          }
        }
      } else if (field === 'summary' && !payload.message) {
        // summary -> message
        data.message = value;
      } else if (field !== 'firstName' && field !== 'lastName' && field !== 'summary') {
        data[field] = value;
      }
    }
  }

  // Valeurs par défaut
  data.source = data.source || 'chatbot';
  data.variant = data.variant || 'A';

  const lead = await prisma.lead.create({ data });
  return lead;
}