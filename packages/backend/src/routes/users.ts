import { Router } from 'express';
import { supabaseClient } from '../config/supabase';
import { asyncHandler, CustomError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/users/library
 * Get user's game library
 */
router.get('/library', asyncHandler(async (req, res) => {
  const { data: library, error } = await supabaseClient
    .rpc('get_user_library', { user_uuid: req.user!.id });

  if (error) {
    throw new CustomError('Failed to get user library', 500);
  }

  res.json({ library });
}));

/**
 * GET /api/users/stats
 * Get user statistics
 */
router.get('/stats', asyncHandler(async (req, res) => {
  const { data: stats, error } = await supabaseClient
    .rpc('get_user_stats', { user_uuid: req.user!.id });

  if (error) {
    throw new CustomError('Failed to get user stats', 500);
  }

  res.json({ stats: stats[0] });
}));

/**
 * GET /api/users/friends
 * Get user's friends list
 */
router.get('/friends', asyncHandler(async (req, res) => {
  const { data: friends, error } = await supabaseClient
    .from('friends')
    .select(`
      id, status, created_at, accepted_at,
      friend:friend_id (
        id, username, display_name, avatar_url, status
      )
    `)
    .eq('user_id', req.user!.id)
    .eq('status', 'accepted');

  if (error) {
    throw new CustomError('Failed to get friends list', 500);
  }

  res.json({ friends });
}));

export default router;
