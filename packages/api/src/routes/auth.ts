import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase';
import { UserRole } from '@gamemarketplace/shared/types/user';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Enhanced registration schema
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(20),
  displayName: z.string().min(1).max(50),
  role: z.enum(['player', 'developer']).default('player'),
  // Developer-specific fields
  companyName: z.string().optional(),
  companyWebsite: z.string().url().optional(),
  payoutBitcoinAddress: z.string().optional()
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Register endpoint with role-based account creation
router.post('/register', async (req, res) => {
  try {
    const data = RegisterSchema.parse(req.body);
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    // Create user account
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: data.email,
        username: data.username,
        display_name: data.displayName,
        password_hash: hashedPassword,
        role: data.role,
        verified: false,
        profile_level: 1
      })
      .select()
      .single();
    
    if (userError) {
      console.error('User creation error:', userError);
      return res.status(500).json({ error: 'Failed to create user' });
    }
    
    // Create developer profile if role is developer
    if (data.role === 'developer') {
      if (!data.companyName || !data.payoutBitcoinAddress) {
        return res.status(400).json({ 
          error: 'Company name and Bitcoin payout address required for developer accounts' 
        });
      }
      
      const { error: devError } = await supabase
        .from('developer_profiles')
        .insert({
          user_id: user.id,
          company_name: data.companyName,
          company_website: data.companyWebsite,
          payout_bitcoin_address: data.payoutBitcoinAddress,
          verification_status: 'pending'
        });
      
      if (devError) {
        console.error('Developer profile creation error:', devError);
        // Don't fail registration, but log the error
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    // Remove sensitive data
    const { password_hash, ...safeUser } = user;
    
    res.status(201).json({
      user: safeUser,
      session: {
        access_token: token,
        expires_in: 604800 // 7 days
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enhanced login with developer profile loading
router.post('/login', async (req, res) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    
    // Get user with developer profile
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        developer_profiles (*)
      `)
      .eq('email', email)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    // Remove sensitive data and format response
    const { password_hash, ...safeUser } = user;
    
    res.json({
      user: {
        ...safeUser,
        developerProfile: user.developer_profiles?.[0] || null
      },
      session: {
        access_token: token,
        expires_in: 604800
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        developer_profiles (*)
      `)
      .eq('id', req.user.userId)
      .single();
    
    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password_hash, ...safeUser } = user;
    
    res.json({
      user: {
        ...safeUser,
        developerProfile: user.developer_profiles?.[0] || null
      }
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (invalidate token - in a real app you'd maintain a blacklist)
router.post('/logout', authenticateToken, async (req, res) => {
  // In a production app, you would add the token to a blacklist
  // For now, we'll just return success and let the client remove the token
  res.json({ message: 'Logged out successfully' });
});

export default router;
