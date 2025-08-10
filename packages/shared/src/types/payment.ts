import { z } from 'zod';

export const PaymentMethodSchema = z.enum([
  'bitcoin_onchain',
  'lightning_network'
]);

export const PaymentStatusSchema = z.enum([
  'pending',
  'processing',
  'confirmed',
  'failed',
  'expired',
  'refunded'
]);

export const InvoiceSchema = z.object({
  id: z.string(),
  btcpayInvoiceId: z.string(),
  userId: z.string(),
  gameId: z.string(),
  amount: z.object({
    usd: z.number(),
    btc: z.number(),
    sats: z.number()
  }),
  method: PaymentMethodSchema,
  status: PaymentStatusSchema,
  bitcoinAddress: z.string().optional(),
  lightningInvoice: z.string().optional(),
  qrCode: z.string(),
  expiresAt: z.string(),
  confirmedAt: z.string().optional(),
  transactionId: z.string().optional(),
  confirmations: z.number().optional(),
  metadata: z.object({
    orderId: z.string(),
    description: z.string(),
    redirectUrl: z.string().optional(),
    webhookUrl: z.string().optional()
  }),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const PaymentSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  userId: z.string(),
  gameId: z.string(),
  amount: z.object({
    usd: z.number(),
    btc: z.number(),
    sats: z.number()
  }),
  method: PaymentMethodSchema,
  status: PaymentStatusSchema,
  transactionId: z.string(),
  confirmations: z.number(),
  networkFee: z.number().optional(),
  processingTime: z.number().optional(),
  createdAt: z.string(),
  confirmedAt: z.string().optional()
});

export const RefundSchema = z.object({
  id: z.string(),
  paymentId: z.string(),
  userId: z.string(),
  amount: z.object({
    usd: z.number(),
    btc: z.number(),
    sats: z.number()
  }),
  reason: z.string(),
  status: PaymentStatusSchema,
  refundAddress: z.string(),
  transactionId: z.string().optional(),
  processedAt: z.string().optional(),
  createdAt: z.string()
});

export const WalletSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['hot', 'cold', 'hardware']),
  name: z.string(),
  bitcoinAddress: z.string(),
  lightningAddress: z.string().optional(),
  balance: z.object({
    confirmed: z.number(),
    unconfirmed: z.number(),
    lightning: z.number().optional()
  }),
  isDefault: z.boolean(),
  createdAt: z.string(),
  lastUsedAt: z.string().optional()
});

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type Refund = z.infer<typeof RefundSchema>;
export type Wallet = z.infer<typeof WalletSchema>;
