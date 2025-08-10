import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { supabase } from '../lib/supabase';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Generate game key utility
function generateGameKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];
  
  for (let i = 0; i < 5; i++) {
    let segment = '';
    for (let j = 0; j < 5; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  
  return segments.join('-');
}

// Get developer dashboard data
router.get('/dashboard', authenticateToken, requireRole(['developer', 'publisher']), async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get developer profile
    const { data: profile } = await supabase
      .from('developer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // Get published games
    const { data: games } = await supabase
      .from('games')
      .select(`
        id, title, price_usd, price_sats, created_at,
        game_licenses (
          id, amount_paid_usd, amount_paid_sats, created_at
        )
      `)
      .eq('developer_id', userId);
    
    // Calculate revenue and stats
    let totalRevenue = 0;
    let totalSales = 0;
    let recentSales = [];
    
    if (games) {
      for (const game of games) {
        if (game.game_licenses) {
          for (const license of game.game_licenses) {
            totalRevenue += license.amount_paid_usd || 0;
            totalSales++;
            recentSales.push({
              gameTitle: game.title,
              amount: license.amount_paid_usd,
              date: license.created_at
            });
          }
        }
      }
    }
    
    // Sort recent sales by date
    recentSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    recentSales = recentSales.slice(0, 10); // Last 10 sales
    
    res.json({
      profile,
      stats: {
        gamesPublished: games?.length || 0,
        totalRevenue,
        totalSales,
        pendingPayout: totalRevenue * (1 - (profile?.platform_fee_percent || 15) / 100)
      },
      games: games || [],
      recentSales
    });
    
  } catch (error) {
    console.error('Developer dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Generate game keys
const GenerateKeysSchema = z.object({
  gameId: z.string().uuid(),
  quantity: z.number().min(1).max(1000),
  purpose: z.enum(['retail', 'press', 'internal', 'giveaway']),
  region: z.string().optional(),
  expiresAt: z.string().optional(),
  notes: z.string().optional()
});

router.post('/games/:gameId/keys/generate', authenticateToken, requireRole(['developer', 'publisher']), async (req, res) => {
  try {
    const { gameId } = req.params;
    const data = GenerateKeysSchema.parse(req.body);
    const userId = req.user.userId;
    
    // Verify game ownership
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id, title')
      .eq('id', gameId)
      .eq('developer_id', userId)
      .single();
    
    if (gameError || !game) {
      return res.status(404).json({ error: 'Game not found or access denied' });
    }
    
    // Create key batch
    const batchId = crypto.randomUUID();
    const { error: batchError } = await supabase
      .from('key_batches')
      .insert({
        id: batchId,
        game_id: gameId,
        developer_id: userId,
        quantity: data.quantity,
        purpose: data.purpose,
        region: data.region,
        expires_at: data.expiresAt,
        notes: data.notes
      });
    
    if (batchError) {
      console.error('Batch creation error:', batchError);
      return res.status(500).json({ error: 'Failed to create key batch' });
    }
    
    // Generate keys
    const keys = [];
    for (let i = 0; i < data.quantity; i++) {
      const keyCode = generateGameKey();
      keys.push({
        id: crypto.randomUUID(),
        game_id: gameId,
        key_code: keyCode,
        batch_id: batchId,
        region: data.region,
        expires_at: data.expiresAt
      });
    }
    
    // Insert keys in batches of 100
    const batchSize = 100;
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      const { error: keysError } = await supabase
        .from('game_keys')
        .insert(batch);
      
      if (keysError) {
        console.error('Keys insertion error:', keysError);
        return res.status(500).json({ error: 'Failed to generate keys' });
      }
    }
    
    res.json({
      batchId,
      quantity: data.quantity,
      keys: keys.map(k => k.key_code),
      message: `Generated ${data.quantity} keys for ${game.title}`
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    console.error('Key generation error:', error);
    res.status(500).json({ error: 'Failed to generate keys' });
  }
});

// Get game analytics
router.get('/games/:gameId/analytics', authenticateToken, requireRole(['developer', 'publisher']), async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.userId;
    
    // Verify game ownership
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id, title, created_at')
      .eq('id', gameId)
      .eq('developer_id', userId)
      .single();
    
    if (gameError || !game) {
      return res.status(404).json({ error: 'Game not found or access denied' });
    }
    
    // Get sales data
    const { data: licenses } = await supabase
      .from('game_licenses')
      .select('amount_paid_usd, amount_paid_sats, created_at, region')
      .eq('game_id', gameId);
    
    // Get key usage data
    const { data: keyStats } = await supabase
      .from('game_keys')
      .select('status, activated_at, region')
      .eq('game_id', gameId);
    
    // Process analytics data
    const salesByDate = {};
    const salesByRegion = {};
    let totalRevenue = 0;
    let totalSales = 0;
    
    if (licenses) {
      for (const license of licenses) {
        const date = license.created_at.split('T')[0];
        const region = license.region || 'Unknown';
        
        salesByDate[date] = (salesByDate[date] || 0) + (license.amount_paid_usd || 0);
        salesByRegion[region] = (salesByRegion[region] || 0) + (license.amount_paid_usd || 0);
        
        totalRevenue += license.amount_paid_usd || 0;
        totalSales++;
      }
    }
    
    const keyUsage = {
      total: keyStats?.length || 0,
      activated: keyStats?.filter(k => k.status === 'activated').length || 0,
      unused: keyStats?.filter(k => k.status === 'unused').length || 0,
      revoked: keyStats?.filter(k => k.status === 'revoked').length || 0
    };
    
    res.json({
      game,
      revenue: {
        total: totalRevenue,
        salesCount: totalSales,
        byDate: salesByDate,
        byRegion: salesByRegion
      },
      keys: keyUsage,
      conversionRate: keyUsage.total > 0 ? (keyUsage.activated / keyUsage.total * 100).toFixed(2) : 0
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

// Update developer profile
const UpdateProfileSchema = z.object({
  companyName: z.string().optional(),
  companyWebsite: z.string().url().optional(),
  payoutBitcoinAddress: z.string().optional(),
  payoutThresholdSats: z.number().min(10000).optional(),
  autoPayoutEnabled: z.boolean().optional()
});

router.put('/profile', authenticateToken, requireRole(['developer', 'publisher']), async (req, res) => {
  try {
    const data = UpdateProfileSchema.parse(req.body);
    const userId = req.user.userId;
    
    const { data: profile, error } = await supabase
      .from('developer_profiles')
      .update({
        company_name: data.companyName,
        company_website: data.companyWebsite,
        payout_bitcoin_address: data.payoutBitcoinAddress,
        payout_threshold_sats: data.payoutThresholdSats,
        auto_payout_enabled: data.autoPayoutEnabled,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    
    res.json({ profile });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
