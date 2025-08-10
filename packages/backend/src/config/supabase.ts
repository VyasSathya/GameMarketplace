import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Environment variables with validation
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Missing Supabase environment variables. Using mock configuration for development.');
  console.warn('   To use real Supabase, set SUPABASE_URL and SUPABASE_ANON_KEY in .env file');
}

/**
 * Standard Supabase client for regular operations
 * Used for user-authenticated requests
 */
export const supabaseClient: SupabaseClient<Database> = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      global: {
        headers: {
          'x-client-info': 'gamemarketplace-backend@1.0.0'
        }
      }
    })
  : null as any; // Mock client for development

/**
 * Admin Supabase client for privileged operations
 * Used for server-side operations that bypass RLS
 */
export const supabaseAdmin: SupabaseClient<Database> = (supabaseServiceKey && supabaseUrl)
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-client-info': 'gamemarketplace-backend-admin@1.0.0'
        }
      }
    })
  : supabaseClient; // Fallback to regular client if no service key

/**
 * Helper function to get user from JWT token
 */
export async function getUserFromToken(token: string) {
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

/**
 * Helper function to verify user session
 */
export async function verifySession(token: string) {
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}

export { Database };
