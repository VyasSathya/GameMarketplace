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
  // Handle mock user in development
  if (process.env.NODE_ENV === 'development' && req.user!.id === '1') {
    const mockFriends = [
      {
        id: 'friend-1',
        status: 'accepted',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        accepted_at: new Date(Date.now() - 86400000).toISOString(),
        friend: {
          id: 'user-2',
          username: 'alice_gamer',
          display_name: 'Alice Cooper',
          avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
          status: 'online'
        }
      },
      {
        id: 'friend-2',
        status: 'accepted',
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        accepted_at: new Date(Date.now() - 172800000).toISOString(),
        friend: {
          id: 'user-3',
          username: 'bob_builder',
          display_name: 'Bob Builder',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          status: 'offline'
        }
      }
    ];
    return res.json({ friends: mockFriends });
  }

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
