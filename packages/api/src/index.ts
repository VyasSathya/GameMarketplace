import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRouter from './routes/auth';
import developerRouter from './routes/developer';
import libraryRouter from './routes/library';

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

// Games endpoint (simplified for now)
app.get('/api/games', async (req, res) => {
  try {
    // Mock games data for now
    const games = [
      {
        id: '1',
        title: 'Bitcoin Miner Simulator',
        developer: 'Satoshi Studios',
        short_description: 'Build and manage your own Bitcoin mining operation in this realistic simulation game.',
        price_usd: 29.99,
        price_btc: 0.00075,
        price_sats: 75000,
        discount_percent: 0,
        header_image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
        genres: ['Simulation', 'Strategy'],
        rating: 'E',
        review_score: 8.5,
        positive_reviews: 1250,
        negative_reviews: 180
      },
      {
        id: '2',
        title: 'Lightning Network Adventure',
        developer: 'Channel Games',
        short_description: 'Navigate the Lightning Network in this fast-paced action-adventure game.',
        price_usd: 19.99,
        price_btc: 0.0005,
        price_sats: 50000,
        discount_percent: 25,
        header_image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800',
        genres: ['Action', 'Adventure'],
        rating: 'T',
        review_score: 9.2,
        positive_reviews: 2100,
        negative_reviews: 95
      },
      {
        id: '3',
        title: 'Crypto Trading Tycoon',
        developer: 'Blockchain Studios',
        short_description: 'Master the art of cryptocurrency trading in this comprehensive business simulation.',
        price_usd: 39.99,
        price_btc: 0.001,
        price_sats: 100000,
        discount_percent: 15,
        header_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
        genres: ['Simulation', 'Strategy'],
        rating: 'E',
        review_score: 7.8,
        positive_reviews: 890,
        negative_reviews: 210
      }
    ];

    res.json({ games });
  } catch (error) {
    console.error('Games fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
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
