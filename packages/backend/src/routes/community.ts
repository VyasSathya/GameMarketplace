import { Router } from 'express';
import { supabaseClient } from '../config/supabase';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * GET /api/community/discussions
 * Get community discussions
 */
router.get('/discussions', optionalAuth, asyncHandler(async (req, res) => {
  const { type = 'discussion', gameId, limit = 20, offset = 0 } = req.query;

  let query = supabaseClient
    .from('discussions')
    .select(`
      id, title, content, type, likes, replies, created_at, updated_at,
      user:user_id (
        id, username, display_name, avatar_url
      ),
      game:game_id (
        id, title
      )
    `)
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (type !== 'all') {
    query = query.eq('type', type);
  }

  if (gameId) {
    query = query.eq('game_id', gameId);
  }

  const { data: discussions, error } = await query;

  if (error) {
    throw new CustomError('Failed to get discussions', 500);
  }

  res.json({ discussions });
}));

/**
 * GET /api/community/discussions/:id
 * Get discussion details with replies
 */
router.get('/discussions/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get discussion
  const { data: discussion, error: discussionError } = await supabaseClient
    .from('discussions')
    .select(`
      id, title, content, type, likes, replies, created_at, updated_at,
      user:user_id (
        id, username, display_name, avatar_url
      ),
      game:game_id (
        id, title
      )
    `)
    .eq('id', id)
    .single();

  if (discussionError || !discussion) {
    throw new CustomError('Discussion not found', 404);
  }

  // Get replies
  const { data: replies, error: repliesError } = await supabaseClient
    .from('discussion_replies')
    .select(`
      id, content, likes, created_at, updated_at,
      user:user_id (
        id, username, display_name, avatar_url
      )
    `)
    .eq('discussion_id', id)
    .order('created_at', { ascending: true });

  if (repliesError) {
    throw new CustomError('Failed to get replies', 500);
  }

  res.json({
    discussion,
    replies
  });
}));

export default router;
