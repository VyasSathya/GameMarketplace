import { Router } from 'express';
import { z } from 'zod';
import { supabaseClient, supabaseAdmin } from '../config/supabase';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username too long'),
  displayName: z.string().min(1, 'Display name is required').max(50, 'Display name too long')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const updateProfileSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
  bitcoinAddress: z.string().optional(),
  lightningAddress: z.string().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.string().optional(),
  currency: z.enum(['usd', 'btc', 'sats']).optional()
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, username, displayName } = registerSchema.parse(req.body);

  // Check if username is already taken
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('username')
    .eq('username', username)
    .single();

  if (existingUser) {
    throw new CustomError('Username already taken', 409);
  }

  // Create user with Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true // Auto-confirm for development
  });

  if (authError || !authData.user) {
    throw new CustomError(authError?.message || 'Failed to create user', 400);
  }

  // Create user profile
  const { error: profileError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      username,
      display_name: displayName,
      role: 'user',
      status: 'offline'
    });

  if (profileError) {
    // Clean up auth user if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    throw new CustomError('Failed to create user profile', 500);
  }

  // Generate session for immediate login
  const { data: sessionData, error: sessionError } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (sessionError || !sessionData.session) {
    throw new CustomError('User created but login failed', 500);
  }

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: authData.user.id,
      email,
      username,
      displayName
    },
    session: {
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      expires_at: sessionData.session.expires_at
    }
  });
}));

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.session) {
    throw new CustomError('Invalid email or password', 401);
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabaseClient
    .from('users')
    .select('id, email, username, display_name, role, avatar_url')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    throw new CustomError('Failed to get user profile', 500);
  }

  // Update last login
  await supabaseClient
    .from('users')
    .update({ 
      last_login_at: new Date().toISOString(),
      status: 'online'
    })
    .eq('id', data.user.id);

  res.json({
    message: 'Login successful',
    user: {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      displayName: profile.display_name,
      role: profile.role,
      avatarUrl: profile.avatar_url
    },
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at
    }
  });
}));

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authMiddleware, asyncHandler(async (req, res) => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    throw new CustomError('Logout failed', 500);
  }

  // Update user status
  await supabaseClient
    .from('users')
    .update({ status: 'offline' })
    .eq('id', req.user!.id);

  res.json({ message: 'Logout successful' });
}));

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    throw new CustomError('Refresh token is required', 400);
  }

  const { data, error } = await supabaseClient.auth.refreshSession({
    refresh_token
  });

  if (error || !data.session) {
    throw new CustomError('Invalid refresh token', 401);
  }

  res.json({
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at
    }
  });
}));

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  // Handle mock user in development
  if (process.env.NODE_ENV === 'development' && req.user!.id === '1') {
    return res.json({
      user: {
        id: '1',
        email: 'demo@gamer.com',
        username: 'demo_gamer',
        display_name: 'Demo Gamer',
        avatar_url: null,
        role: 'player',
        status: 'online',
        bio: 'Demo user for development',
        location: null,
        website: null,
        bitcoin_address: null,
        lightning_address: null,
        theme: 'dark',
        language: 'en',
        currency: 'USD',
        notifications_email: true,
        notifications_push: true,
        notifications_game_updates: true,
        notifications_friend_activity: true,
        notifications_promotions: false,
        privacy_show_online_status: true,
        privacy_show_game_activity: true,
        privacy_allow_friend_requests: true,
        games_owned: 5,
        total_hours_played: 120,
        achievements_unlocked: 25,
        friends_count: 3,
        reviews_written: 2,
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString()
      }
    });
  }

  const { data: profile, error } = await supabaseClient
    .from('users')
    .select(`
      id, email, username, display_name, avatar_url, role, status,
      bio, location, website, bitcoin_address, lightning_address,
      theme, language, currency,
      notifications_email, notifications_push, notifications_game_updates,
      notifications_friend_activity, notifications_promotions,
      privacy_show_online_status, privacy_show_game_activity, privacy_allow_friend_requests,
      games_owned, total_hours_played, achievements_unlocked, friends_count, reviews_written,
      created_at, last_login_at
    `)
    .eq('id', req.user!.id)
    .single();

  if (error) {
    throw new CustomError('Failed to get user profile', 500);
  }

  res.json({ user: profile });
}));

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authMiddleware, asyncHandler(async (req, res) => {
  const updates = updateProfileSchema.parse(req.body);

  // Check username uniqueness if updating
  if (updates.username) {
    const { data: existingUser } = await supabaseClient
      .from('users')
      .select('id')
      .eq('username', updates.username)
      .neq('id', req.user!.id)
      .single();

    if (existingUser) {
      throw new CustomError('Username already taken', 409);
    }
  }

  const { data, error } = await supabaseClient
    .from('users')
    .update({
      username: updates.username,
      display_name: updates.displayName,
      bio: updates.bio,
      location: updates.location,
      website: updates.website,
      bitcoin_address: updates.bitcoinAddress,
      lightning_address: updates.lightningAddress,
      theme: updates.theme,
      language: updates.language,
      currency: updates.currency,
      updated_at: new Date().toISOString()
    })
    .eq('id', req.user!.id)
    .select()
    .single();

  if (error) {
    throw new CustomError('Failed to update profile', 500);
  }

  res.json({
    message: 'Profile updated successfully',
    user: data
  });
}));

export default router;
