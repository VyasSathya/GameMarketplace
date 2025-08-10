import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { supabase } from '../lib/supabase';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get user's game library
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const { data: licenses, error } = await supabase
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
    
    if (error) {
      console.error('Library fetch error:', error);
      return res.status(500).json({ error: 'Failed to load library' });
    }
    
    // Format response with game data and license info
    const library = licenses?.map(license => ({
      license: {
        id: license.id,
        licenseKey: license.license_key,
        purchaseDate: license.purchase_date,
        paymentTxId: license.payment_tx_id,
        amountPaid: {
          usd: license.amount_paid_usd,
          sats: license.amount_paid_sats
        },
        activationCount: license.activation_count,
        maxActivations: license.max_activations,
        lastPlayed: license.last_played,
        totalPlaytimeMinutes: license.total_playtime_minutes
      },
      game: license.games
    })) || [];
    
    res.json({ library });
    
  } catch (error) {
    console.error('Library error:', error);
    res.status(500).json({ error: 'Failed to load library' });
  }
});

// Activate game key
const ActivateKeySchema = z.object({
  keyCode: z.string().regex(/^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/, 'Invalid key format')
});

router.post('/activate', authenticateToken, async (req, res) => {
  try {
    const { keyCode } = ActivateKeySchema.parse(req.body);
    const userId = req.user.userId;
    
    // Start transaction
    const { data: key, error: keyError } = await supabase
      .from('game_keys')
      .select(`
        *,
        games (
          id, title, developer, short_description, header_image,
          genres, rating, review_score, price_usd, price_sats
        )
      `)
      .eq('key_code', keyCode)
      .eq('status', 'unused')
      .single();
    
    if (keyError || !key) {
      return res.status(400).json({ error: 'Invalid or already used key' });
    }
    
    // Check if key is expired
    if (key.expires_at && new Date(key.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Key has expired' });
    }
    
    // Check if user already owns this game
    const { data: existingLicense } = await supabase
      .from('game_licenses')
      .select('id')
      .eq('user_id', userId)
      .eq('game_id', key.game_id)
      .single();
    
    if (existingLicense) {
      return res.status(400).json({ error: 'You already own this game' });
    }
    
    // Generate license key
    const licenseKey = crypto.randomBytes(16).toString('hex').toUpperCase();
    
    // Create game license
    const { data: license, error: licenseError } = await supabase
      .from('game_licenses')
      .insert({
        user_id: userId,
        game_id: key.game_id,
        license_key: licenseKey,
        payment_method: 'key_activation',
        amount_paid_usd: key.games.price_usd,
        amount_paid_sats: key.games.price_sats,
        region: key.region
      })
      .select()
      .single();
    
    if (licenseError) {
      console.error('License creation error:', licenseError);
      return res.status(500).json({ error: 'Failed to activate key' });
    }
    
    // Mark key as activated
    const { error: updateError } = await supabase
      .from('game_keys')
      .update({
        status: 'activated',
        activated_by: userId,
        activated_at: new Date().toISOString()
      })
      .eq('id', key.id);
    
    if (updateError) {
      console.error('Key update error:', updateError);
      // Don't fail the activation, just log the error
    }
    
    res.json({
      message: 'Game activated successfully',
      game: key.games,
      license: {
        id: license.id,
        licenseKey: license.license_key,
        purchaseDate: license.purchase_date
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid key format' });
    }
    
    console.error('Key activation error:', error);
    res.status(500).json({ error: 'Failed to activate key' });
  }
});

// Update game playtime
const UpdatePlaytimeSchema = z.object({
  gameId: z.string().uuid(),
  sessionMinutes: z.number().min(0).max(1440) // Max 24 hours per session
});

router.post('/playtime', authenticateToken, async (req, res) => {
  try {
    const { gameId, sessionMinutes } = UpdatePlaytimeSchema.parse(req.body);
    const userId = req.user.userId;
    
    // Update playtime and last played
    const { data: license, error } = await supabase
      .from('game_licenses')
      .update({
        total_playtime_minutes: supabase.rpc('increment_playtime', { 
          minutes: sessionMinutes 
        }),
        last_played: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .eq('status', 'active')
      .select()
      .single();
    
    if (error) {
      console.error('Playtime update error:', error);
      return res.status(500).json({ error: 'Failed to update playtime' });
    }
    
    res.json({ 
      message: 'Playtime updated',
      totalPlaytimeMinutes: license.total_playtime_minutes 
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    console.error('Playtime error:', error);
    res.status(500).json({ error: 'Failed to update playtime' });
  }
});

// Get game launch info (for DRM verification)
router.get('/launch/:gameId', authenticateToken, async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.userId;
    
    // Verify ownership
    const { data: license, error } = await supabase
      .from('game_licenses')
      .select(`
        *,
        games (id, title, version, download_url, executable_hash)
      `)
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .eq('status', 'active')
      .single();
    
    if (error || !license) {
      return res.status(403).json({ error: 'Game not owned or access denied' });
    }
    
    // Check activation limits
    if (license.activation_count >= license.max_activations) {
      return res.status(403).json({ 
        error: 'Maximum activations reached',
        maxActivations: license.max_activations,
        currentActivations: license.activation_count
      });
    }
    
    // Generate launch token (valid for 1 hour)
    const launchToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Store launch session (in a real app, you'd use Redis or similar)
    // For now, we'll just return the token
    
    res.json({
      launchToken,
      expiresAt: expiresAt.toISOString(),
      game: license.games,
      license: {
        key: license.license_key,
        activationsRemaining: license.max_activations - license.activation_count
      }
    });
    
  } catch (error) {
    console.error('Launch info error:', error);
    res.status(500).json({ error: 'Failed to get launch info' });
  }
});

// Verify game ownership (for offline DRM)
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { gameId, licenseKey } = req.body;
    const userId = req.user.userId;
    
    const { data: license, error } = await supabase
      .from('game_licenses')
      .select('id, status, license_key')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .eq('license_key', licenseKey)
      .single();
    
    if (error || !license || license.status !== 'active') {
      return res.status(403).json({ valid: false });
    }
    
    res.json({ 
      valid: true,
      licenseId: license.id
    });
    
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
