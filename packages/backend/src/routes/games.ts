import { Router } from 'express';
import { z } from 'zod';
import { supabaseClient } from '../config/supabase';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Validation schemas
const searchGamesSchema = z.object({
  search: z.string().optional(),
  genre: z.string().optional(),
  maxPrice: z.number().optional(),
  sortBy: z.enum(['title', 'price', 'rating', 'release_date']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

/**
 * GET /api/games
 * Search and filter games
 */
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const {
    search = '',
    genre = '',
    maxPrice,
    sortBy = 'title',
    sortOrder = 'asc',
    limit = 20,
    offset = 0
  } = searchGamesSchema.parse(req.query);

  // Check if Supabase is available
  if (!supabaseClient) {
    // Return mock data for development
    const mockGames = [
      {
        id: '1',
        title: 'Bitcoin Miner Simulator',
        developer: 'Satoshi Studios',
        short_description: 'Build and manage your Bitcoin mining empire',
        price_usd: 29.99,
        price_btc: 0.00045000,
        price_sats: 45000,
        discount_percent: 0,
        header_image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
        genres: ['Simulation', 'Strategy', 'Cryptocurrency'],
        rating: 'teen',
        review_score: 8.7,
        positive_reviews: 1250,
        negative_reviews: 85
      },
      {
        id: '2',
        title: 'Lightning Network Adventure',
        developer: 'Channel Games',
        short_description: 'Adventure through the Lightning Network',
        price_usd: 19.99,
        price_btc: 0.00030000,
        price_sats: 30000,
        discount_percent: 0,
        header_image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800',
        genres: ['Adventure', 'Puzzle', 'Educational'],
        rating: 'everyone',
        review_score: 9.1,
        positive_reviews: 890,
        negative_reviews: 45
      }
    ];

    const filteredGames = mockGames.filter(game => {
      if (search && !game.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (genre && !game.genres.includes(genre)) return false;
      if (maxPrice && game.price_usd > maxPrice) return false;
      return true;
    });

    const paginatedGames = filteredGames.slice(offset, offset + limit);
    const total = filteredGames.length;

    return res.json({
      games: paginatedGames,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  }

  // Use the search function from our database
  const { data: games, error } = await supabaseClient
    .rpc('search_games', {
      search_term: search,
      genre_filter: genre,
      max_price_usd: maxPrice,
      sort_by: sortBy,
      sort_order: sortOrder
    });

  if (error) {
    throw new CustomError('Failed to search games', 500);
  }

  // Apply pagination
  const paginatedGames = games.slice(offset, offset + limit);
  const total = games.length;

  res.json({
    games: paginatedGames,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    }
  });
}));

/**
 * GET /api/games/:id
 * Get game details
 */
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: game, error } = await supabaseClient
    .from('games')
    .select(`
      id, title, developer, publisher, description, short_description,
      price_usd, price_btc, price_sats, discount_percent,
      genres, tags, rating, status, release_date, last_updated,
      header_image, screenshots, videos, logo,
      system_requirements_minimum, system_requirements_recommended,
      features, languages, total_achievements,
      positive_reviews, negative_reviews, review_score,
      file_size, version, created_at, updated_at
    `)
    .eq('id', id)
    .single();

  if (error || !game) {
    throw new CustomError('Game not found', 404);
  }

  // Check if user owns this game (if authenticated)
  let owned = false;
  if (req.user) {
    const { data: library } = await supabaseClient
      .from('user_libraries')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('game_id', id)
      .single();
    
    owned = !!library;
  }

  res.json({
    game: {
      ...game,
      owned
    }
  });
}));

/**
 * GET /api/games/featured
 * Get featured games
 */
router.get('/featured', optionalAuth, asyncHandler(async (req, res) => {
  const { data: games, error } = await supabaseClient
    .from('games')
    .select(`
      id, title, developer, short_description,
      price_usd, price_btc, price_sats, discount_percent,
      header_image, genres, rating, review_score
    `)
    .eq('status', 'available')
    .order('review_score', { ascending: false })
    .limit(10);

  if (error) {
    throw new CustomError('Failed to get featured games', 500);
  }

  res.json({ games });
}));

/**
 * GET /api/games/categories/:category
 * Get games by category (new, top-sellers, specials)
 */
router.get('/categories/:category', optionalAuth, asyncHandler(async (req, res) => {
  const { category } = req.params;
  const limit = parseInt(req.query.limit as string) || 20;

  let query = supabaseClient
    .from('games')
    .select(`
      id, title, developer, short_description,
      price_usd, price_btc, price_sats, discount_percent,
      header_image, genres, rating, review_score,
      release_date, positive_reviews, negative_reviews
    `)
    .eq('status', 'available')
    .limit(limit);

  switch (category) {
    case 'new':
      query = query.order('release_date', { ascending: false });
      break;
    case 'top-sellers':
      query = query.order('positive_reviews', { ascending: false });
      break;
    case 'specials':
      query = query.gt('discount_percent', 0).order('discount_percent', { ascending: false });
      break;
    default:
      throw new CustomError('Invalid category', 400);
  }

  const { data: games, error } = await query;

  if (error) {
    throw new CustomError(`Failed to get ${category} games`, 500);
  }

  res.json({ games });
}));

export default router;
