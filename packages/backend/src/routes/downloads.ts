import { Router } from 'express';
import { supabaseClient } from '../config/supabase';
import { asyncHandler, CustomError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/downloads
 * Get user's downloads
 */
router.get('/', asyncHandler(async (req, res) => {
  // Handle mock user in development
  if (process.env.NODE_ENV === 'development' && req.user!.id === '1') {
    const mockDownloads = [
      {
        id: 'download-1',
        status: 'completed',
        progress: 100,
        speed_mbps: 0,
        bytes_downloaded: 2147483648, // 2GB
        total_bytes: 2147483648,
        started_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        completed_at: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
        game: {
          id: 'game-1',
          title: 'Cyber Runner 2077',
          header_image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
          file_size: '2.0 GB'
        }
      },
      {
        id: 'download-2',
        status: 'downloading',
        progress: 65,
        speed_mbps: 12.5,
        bytes_downloaded: 1073741824, // 1GB
        total_bytes: 1610612736, // 1.5GB
        started_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        completed_at: null,
        game: {
          id: 'game-2',
          title: 'Mystic Realms',
          header_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
          file_size: '1.5 GB'
        }
      }
    ];
    return res.json({ downloads: mockDownloads });
  }

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
