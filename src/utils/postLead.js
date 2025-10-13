


function getVariant() {
  let v = null;
  try {
    v = localStorage.getItem('cta_variant');
    if (!v) {
      v = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem('cta_variant', v);
    }
  } catch (e) {
    v = 'A';
  }
  return v;
}

export async function postLead(payload) {
  const variant = payload.variant ?? getVariant();
  const source = payload.source ?? 'chatbot';
  const url = import.meta.env.VITE_API_URL ?? '/api/leads';
  
  // Prepare headers with API secret if available
  const headers = { 'Content-Type': 'application/json' };
  if (import.meta.env.VITE_API_SECRET) {
    headers['X-API-SECRET'] = import.meta.env.VITE_API_SECRET;
  }
  
  const body = { ...payload, variant, source };
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `Erreur ${res.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch (e) {
        // Keep default error message if JSON parsing fails
      }
      
      // Surface specific error messages to UI
      if (res.status === 401) {
        errorMessage = 'Accès non autorisé';
      } else if (res.status === 429) {
        errorMessage = 'Trop de tentatives, veuillez patienter';
      } else if (res.status === 400) {
        errorMessage = errorMessage.includes('Email') ? errorMessage : 'Données invalides';
      }
      
      throw new Error(errorMessage);
    }
    
    return res.json();
    
  } catch (error) {
    // Network or other errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Impossible de contacter le serveur');
    }
    throw error;
  }
}