import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database helper functions
export const dbHelpers = {
  // Get user by ID with developer profile
  async getUserWithProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        developer_profiles (*)
      `)
      .eq('id', userId)
      .single();
    
    return { data, error };
  },

  // Get user's game library
  async getUserLibrary(userId: string) {
    const { data, error } = await supabase
      .from('game_licenses')
      .select(`
        *,
        games (
          id, title, developer, short_description, header_image,
          genres, rating, review_score, price_usd, price_sats
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('purchase_date', { ascending: false });
    
    return { data, error };
  },

  // Check game ownership
  async checkGameOwnership(userId: string, gameId: string) {
    const { data, error } = await supabase
      .from('game_licenses')
      .select('id, status')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .eq('status', 'active')
      .single();
    
    return { owned: !!data && !error, data, error };
  },

  // Get developer's games
  async getDeveloperGames(developerId: string) {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        game_licenses (
          id, amount_paid_usd, amount_paid_sats, created_at
        )
      `)
      .eq('developer_id', developerId);
    
    return { data, error };
  },

  // Get game analytics
  async getGameAnalytics(gameId: string, developerId: string) {
    // Verify ownership
    const { data: game } = await supabase
      .from('games')
      .select('id, title')
      .eq('id', gameId)
      .eq('developer_id', developerId)
      .single();
    
    if (!game) {
      return { data: null, error: { message: 'Game not found or access denied' } };
    }

    // Get sales data
    const { data: licenses } = await supabase
      .from('game_licenses')
      .select('amount_paid_usd, amount_paid_sats, created_at, region')
      .eq('game_id', gameId);

    // Get key stats
    const { data: keyStats } = await supabase
      .from('game_keys')
      .select('status, activated_at, region')
      .eq('game_id', gameId);

    return {
      data: {
        game,
        licenses: licenses || [],
        keyStats: keyStats || []
      },
      error: null
    };
  },

  // Create game license
  async createGameLicense(licenseData: {
    userId: string;
    gameId: string;
    licenseKey: string;
    paymentTxId?: string;
    paymentMethod: string;
    amountPaidUsd?: number;
    amountPaidSats?: number;
    region?: string;
  }) {
    const { data, error } = await supabase
      .from('game_licenses')
      .insert({
        user_id: licenseData.userId,
        game_id: licenseData.gameId,
        license_key: licenseData.licenseKey,
        payment_tx_id: licenseData.paymentTxId,
        payment_method: licenseData.paymentMethod,
        amount_paid_usd: licenseData.amountPaidUsd,
        amount_paid_sats: licenseData.amountPaidSats,
        region: licenseData.region
      })
      .select()
      .single();
    
    return { data, error };
  },

  // Update playtime
  async updatePlaytime(userId: string, gameId: string, sessionMinutes: number) {
    const { data, error } = await supabase
      .rpc('update_playtime', {
        p_user_id: userId,
        p_game_id: gameId,
        p_session_minutes: sessionMinutes
      });
    
    return { data, error };
  },

  // Get unused game key
  async getUnusedGameKey(gameId: string, region?: string) {
    let query = supabase
      .from('game_keys')
      .select('*')
      .eq('game_id', gameId)
      .eq('status', 'unused')
      .is('expires_at', null); // Only get non-expiring keys for purchases
    
    if (region) {
      query = query.eq('region', region);
    }
    
    const { data, error } = await query.limit(1).single();
    
    return { data, error };
  },

  // Mark key as activated
  async activateGameKey(keyId: string, userId: string) {
    const { data, error } = await supabase
      .from('game_keys')
      .update({
        status: 'activated',
        activated_by: userId,
        activated_at: new Date().toISOString()
      })
      .eq('id', keyId)
      .select()
      .single();
    
    return { data, error };
  }
};

// Database functions that need to be created in Supabase
export const requiredDbFunctions = `
-- Function to update playtime
CREATE OR REPLACE FUNCTION update_playtime(
  p_user_id UUID,
  p_game_id UUID,
  p_session_minutes INTEGER
)
RETURNS TABLE(total_playtime_minutes INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE game_licenses 
  SET 
    total_playtime_minutes = COALESCE(total_playtime_minutes, 0) + p_session_minutes,
    last_played = NOW()
  WHERE user_id = p_user_id AND game_id = p_game_id;
  
  RETURN QUERY
  SELECT gl.total_playtime_minutes
  FROM game_licenses gl
  WHERE gl.user_id = p_user_id AND gl.game_id = p_game_id;
END;
$$;
`;

export default supabase;
