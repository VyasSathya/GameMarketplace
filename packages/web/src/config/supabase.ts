// Supabase configuration
export const SUPABASE_CONFIG = {
  url: 'https://uhgiaartjabgmjolksmb.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZ2lhYXJ0amFiZ21qb2xrc21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4MjgzMTQsImV4cCI6MjAzMjQwNDMxNH0.lYnhzxKhqKjJhkJhkJhkJhkJhkJhkJhkJhkJhkJhkJhk'
};

// Helper function for making Supabase API calls
export const supabaseFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${SUPABASE_CONFIG.url}/rest/v1${endpoint}`;
  
  const defaultHeaders = {
    'apikey': SUPABASE_CONFIG.anonKey,
    'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
