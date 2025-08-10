import { z } from 'zod';

export const UserRoleSchema = z.enum([
  'player',
  'developer',
  'publisher',
  'admin'
]);

export const UserStatusSchema = z.enum([
  'online',
  'away',
  'in_game',
  'offline'
]);

export const DeveloperProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  companyName: z.string(),
  companyWebsite: z.string().optional(),
  taxId: z.string().optional(),
  businessAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string()
  }).optional(),
  payoutBitcoinAddress: z.string(),
  payoutThresholdSats: z.number(),
  autoPayoutEnabled: z.boolean(),
  verificationStatus: z.enum(['pending', 'verified', 'rejected']),
  verificationDocuments: z.record(z.any()),
  platformFeePercent: z.number(),
  totalRevenueUsd: z.number(),
  totalRevenueSats: z.number(),
  gamesPublished: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  verifiedAt: z.string().optional()
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  displayName: z.string(),
  avatar: z.string().optional(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  verified: z.boolean(),
  profileLevel: z.number(),
  steamId: z.string().optional(),
  epicId: z.string().optional(),
  bitcoinAddress: z.string().optional(),
  lightningAddress: z.string().optional(),
  developerProfile: DeveloperProfileSchema.optional(),
  profile: z.object({
    bio: z.string().optional(),
    location: z.string().optional(),
    website: z.string().optional(),
    steamId: z.string().optional()
  }),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    language: z.string(),
    currency: z.enum(['usd', 'btc', 'sats']),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      gameUpdates: z.boolean(),
      friendActivity: z.boolean(),
      promotions: z.boolean()
    }),
    privacy: z.object({
      showOnlineStatus: z.boolean(),
      showGameActivity: z.boolean(),
      allowFriendRequests: z.boolean()
    })
  }),
  stats: z.object({
    gamesOwned: z.number(),
    totalHoursPlayed: z.number(),
    achievementsUnlocked: z.number(),
    friendsCount: z.number(),
    reviewsWritten: z.number()
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastLoginAt: z.string().optional()
});

export const FriendSchema = z.object({
  id: z.string(),
  userId: z.string(),
  friendId: z.string(),
  status: z.enum(['pending', 'accepted', 'blocked']),
  createdAt: z.string(),
  acceptedAt: z.string().optional()
});

export const UserSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  expiresAt: z.string(),
  createdAt: z.string(),
  lastActiveAt: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

// Game ownership and licensing schemas
export const GameLicenseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  gameId: z.string(),
  licenseKey: z.string(),
  purchaseDate: z.string(),
  paymentTxId: z.string().optional(),
  paymentMethod: z.enum(['bitcoin_onchain', 'lightning_network', 'key_activation']),
  amountPaidUsd: z.number().optional(),
  amountPaidSats: z.number().optional(),
  status: z.enum(['active', 'revoked', 'refunded', 'suspended']),
  region: z.string().optional(),
  activationCount: z.number(),
  maxActivations: z.number(),
  lastPlayed: z.string().optional(),
  totalPlaytimeMinutes: z.number(),
  createdAt: z.string()
});

export const GameKeySchema = z.object({
  id: z.string(),
  gameId: z.string(),
  keyCode: z.string(),
  batchId: z.string(),
  status: z.enum(['unused', 'activated', 'revoked', 'expired']),
  activatedBy: z.string().optional(),
  activatedAt: z.string().optional(),
  region: z.string().optional(),
  resellerId: z.string().optional(),
  expiresAt: z.string().optional(),
  createdAt: z.string()
});

export const KeyBatchSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  developerId: z.string(),
  quantity: z.number(),
  purpose: z.enum(['retail', 'press', 'internal', 'giveaway']),
  region: z.string().optional(),
  expiresAt: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string()
});

export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type User = z.infer<typeof UserSchema>;
export type DeveloperProfile = z.infer<typeof DeveloperProfileSchema>;
export type Friend = z.infer<typeof FriendSchema>;
export type UserSession = z.infer<typeof UserSessionSchema>;
export type GameLicense = z.infer<typeof GameLicenseSchema>;
export type GameKey = z.infer<typeof GameKeySchema>;
export type KeyBatch = z.infer<typeof KeyBatchSchema>;
