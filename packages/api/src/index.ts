import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes and utilities
import authRouter from './routes/auth';
import developerRouter from './routes/developer';
import libraryRouter from './routes/library';
import { supabase } from './lib/supabase';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 7778;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:7777',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/developer', developerRouter);
app.use('/api/library', libraryRouter);

// Games endpoint with real data from Supabase
app.get('/api/games', async (req, res) => {
  try {
    const { data: games, error } = await supabase
      .from('games')
      .select(`
        id, title, developer, publisher, short_description,
        price_usd, price_btc, price_sats, discount_percent,
        header_image, genres, rating, review_score,
        positive_reviews, negative_reviews, release_date,
        file_size, created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Games fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch games' });
    }

    res.json({ games: games || [] });
  } catch (error) {
    console.error('Games fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Downloads endpoint
app.get('/api/downloads', async (req, res) => {
  try {
    const { data: downloads, error } = await supabase
      .from('game_downloads')
      .select(`
        *,
        games (
          id, title, developer, header_image
        )
      `)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Downloads fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch downloads' });
    }

    res.json({ downloads: downloads || [] });
  } catch (error) {
    console.error('Downloads fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch downloads' });
  }
});

// Payment invoice endpoint (simplified)
app.post('/api/payments/invoice', async (req, res) => {
  try {
    const { gameId, method } = req.body;

    // Mock invoice creation
    const invoice = {
      id: `inv_${Date.now()}`,
      gameId,
      method,
      amount_sats: 50000,
      payment_request: 'lnbc500u1p...',
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };

    res.json({ invoice });
  } catch (error) {
    console.error('Invoice creation error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GameMarketplace API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
