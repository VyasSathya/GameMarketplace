import { Request, Response, NextFunction } from 'express';
import { supabaseClient, getUserFromToken } from '../config/supabase';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        aud: string;
        exp: number;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Handle mock tokens in development
    if (process.env.NODE_ENV === 'development' && token.startsWith('mock_jwt_token')) {
      // Create mock user for development
      req.user = {
        id: '1',
        email: 'demo@gamer.com',
        role: 'player',
        aud: 'authenticated',
        exp: Date.now() + 3600000 // 1 hour from now
      };
      return next();
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }

    // Get user profile from our database
    const { data: profile, error: profileError } = await supabaseClient
      .from('users')
      .select('id, email, username, role, status')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User profile not found'
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email || '',
      role: profile.role || 'user',
      aud: user.aud || '',
      exp: 0 // Will be set from JWT if needed
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(roles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
}

/**
 * Optional authentication middleware
 * Attaches user if token is present but doesn't require it
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without user
    }

    const token = authHeader.substring(7);

    // Handle mock tokens in development
    if (process.env.NODE_ENV === 'development' && token.startsWith('mock_jwt_token')) {
      req.user = {
        id: '1',
        email: 'demo@gamer.com',
        role: 'player',
        aud: 'authenticated',
        exp: Date.now() + 3600000
      };
      return next();
    }

    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    if (!error && user) {
      const { data: profile } = await supabaseClient
        .from('users')
        .select('id, email, username, role, status')
        .eq('id', user.id)
        .single();

      if (profile) {
        req.user = {
          id: user.id,
          email: user.email || '',
          role: profile.role || 'user',
          aud: user.aud || '',
          exp: 0
        };
      }
    }

    next();
  } catch (error) {
    // Log error but continue without user
    console.error('Optional auth error:', error);
    next();
  }
}
