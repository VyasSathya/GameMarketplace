import { Router } from 'express';
import { z } from 'zod';
import { supabaseClient } from '../config/supabase';
import { asyncHandler, CustomError } from '../middleware/errorHandler';

const router = Router();

// Mock payment routes for now
const createInvoiceSchema = z.object({
  gameId: z.string().uuid(),
  method: z.enum(['bitcoin_onchain', 'lightning_network'])
});

/**
 * POST /api/payments/invoice
 * Create payment invoice
 */
router.post('/invoice', asyncHandler(async (req, res) => {
  const { gameId, method } = createInvoiceSchema.parse(req.body);

  // Get game details
  const { data: game, error: gameError } = await supabaseClient
    .from('games')
    .select('id, title, price_usd, price_btc, price_sats')
    .eq('id', gameId)
    .single();

  if (gameError || !game) {
    throw new CustomError('Game not found', 404);
  }

  // Check if user already owns the game
  const { data: existing } = await supabaseClient
    .from('user_libraries')
    .select('id')
    .eq('user_id', req.user!.id)
    .eq('game_id', gameId)
    .single();

  if (existing) {
    throw new CustomError('You already own this game', 409);
  }

  // Create mock invoice for development
  const mockInvoice = {
    id: crypto.randomUUID(),
    btcpay_invoice_id: `mock_${Date.now()}`,
    user_id: req.user!.id,
    game_id: gameId,
    amount_usd: game.price_usd,
    amount_btc: game.price_btc,
    amount_sats: game.price_sats,
    method,
    status: 'pending',
    qr_code: 'data:image/png;base64,mock-qr-code',
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    order_id: `order_${Date.now()}`,
    description: `Purchase ${game.title}`,
    metadata: { game_title: game.title }
  };

  // Save invoice to database
  const { data: invoice, error } = await supabaseClient
    .from('invoices')
    .insert(mockInvoice)
    .select()
    .single();

  if (error) {
    throw new CustomError('Failed to create invoice', 500);
  }

  res.status(201).json({
    message: 'Invoice created successfully',
    invoice: {
      id: invoice.id,
      amount: {
        usd: invoice.amount_usd,
        btc: invoice.amount_btc,
        sats: invoice.amount_sats
      },
      method: invoice.method,
      status: invoice.status,
      qrCode: invoice.qr_code,
      expiresAt: invoice.expires_at,
      checkoutUrl: `http://localhost:7777/checkout/${invoice.id}`
    }
  });
}));

/**
 * GET /api/payments/:id/status
 * Get payment status
 */
router.get('/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: invoice, error } = await supabaseClient
    .from('invoices')
    .select('id, status, confirmed_at, expires_at')
    .eq('id', id)
    .eq('user_id', req.user!.id)
    .single();

  if (error || !invoice) {
    throw new CustomError('Invoice not found', 404);
  }

  res.json({
    status: invoice.status,
    confirmedAt: invoice.confirmed_at,
    expiresAt: invoice.expires_at
  });
}));

/**
 * POST /api/payments/webhook
 * Handle BTCPay Server webhooks (mock for development)
 */
router.post('/webhook', asyncHandler(async (req, res) => {
  // Mock webhook handler for development
  console.log('Received webhook:', req.body);
  
  res.status(200).json({ received: true });
}));

export default router;
