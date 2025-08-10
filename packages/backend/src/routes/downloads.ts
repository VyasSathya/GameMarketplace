import { Router } from 'express';
import { supabaseClient } from '../config/supabase';
import { asyncHandler, CustomError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/downloads
 * Get user's downloads
 */
router.get('/', asyncHandler(async (req, res) => {
  const { data: downloads, error } = await supabaseClient
    .from('downloads')
    .select(`
      id, status, progress, speed_mbps, bytes_downloaded, total_bytes,
      started_at, completed_at,
      game:game_id (
        id, title, header_image, file_size
      )
    `)
    .eq('user_id', req.user!.id)
    .order('started_at', { ascending: false });

  if (error) {
    throw new CustomError('Failed to get downloads', 500);
  }

  res.json({ downloads });
}));

/**
 * POST /api/downloads/start
 * Start game download
 */
router.post('/start', asyncHandler(async (req, res) => {
  const { gameId } = req.body;

  // Check if user owns the game
  const { data: library, error: libraryError } = await supabaseClient
    .from('user_libraries')
    .select('id')
    .eq('user_id', req.user!.id)
    .eq('game_id', gameId)
    .single();

  if (libraryError || !library) {
    throw new CustomError('You do not own this game', 403);
  }

  // Get game details
  const { data: game, error: gameError } = await supabaseClient
    .from('games')
    .select('id, title, file_size')
    .eq('id', gameId)
    .single();

  if (gameError || !game) {
    throw new CustomError('Game not found', 404);
  }

  // Create download record
  const { data: download, error } = await supabaseClient
    .from('downloads')
    .insert({
      user_id: req.user!.id,
      game_id: gameId,
      status: 'pending',
      progress: 0,
      total_bytes: parseInt(game.file_size.replace(/[^\d]/g, '')) * 1024 * 1024 * 1024 // Convert GB to bytes
    })
    .select()
    .single();

  if (error) {
    throw new CustomError('Failed to start download', 500);
  }

  res.status(201).json({
    message: 'Download started',
    download
  });
}));

export default router;
