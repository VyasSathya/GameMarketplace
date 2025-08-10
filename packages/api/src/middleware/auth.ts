import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@gamemarketplace/shared/types/user';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        role: UserRole;
      };
    }
  }
}

// JWT token verification middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Token verification failed' });
  }
};

// Role-based access control middleware
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Admin-only middleware
export const requireAdmin = requireRole(['admin']);

// Developer/Publisher middleware
export const requireDeveloper = requireRole(['developer', 'publisher', 'admin']);

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // Continue without user info
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };
  } catch (error) {
    // Ignore token errors for optional auth
  }

  next();
};

// Rate limiting for sensitive operations
export const sensitiveOperationLimit = (req: Request, res: Response, next: NextFunction) => {
  // In a production app, you'd implement more sophisticated rate limiting
  // For now, we'll just add a simple delay for sensitive operations
  const sensitiveEndpoints = ['/register', '/login', '/activate', '/generate'];
  const isSensitive = sensitiveEndpoints.some(endpoint => req.path.includes(endpoint));
  
  if (isSensitive) {
    // Add a small delay to prevent brute force attacks
    setTimeout(() => next(), 100);
  } else {
    next();
  }
};

// Validate user account status
export const requireActiveAccount = (req: Request, res: Response, next: NextFunction) => {
  // In a real app, you'd check the user's account status from the database
  // For now, we'll assume all authenticated users have active accounts
  next();
};

// API key authentication for external services
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // In a real app, you'd validate the API key against a database
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};

// CORS preflight handler
export const handleCors = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:7777');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};
