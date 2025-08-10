import { z } from 'zod';

export const GameGenreSchema = z.enum([
  'action',
  'adventure',
  'rpg',
  'strategy',
  'simulation',
  'sports',
  'racing',
  'puzzle',
  'indie',
  'multiplayer',
  'vr'
]);

export const GameRatingSchema = z.enum([
  'everyone',
  'teen',
  'mature',
  'adults_only'
]);

export const GameStatusSchema = z.enum([
  'coming_soon',
  'available',
  'early_access',
  'discontinued'
]);

export const SystemRequirementsSchema = z.object({
  os: z.string(),
  processor: z.string(),
  memory: z.string(),
  graphics: z.string(),
  storage: z.string(),
  additional: z.string().optional()
});

export const GameSchema = z.object({
  id: z.string(),
  title: z.string(),
  developer: z.string(),
  publisher: z.string(),
  description: z.string(),
  shortDescription: z.string(),
  price: z.object({
    usd: z.number(),
    btc: z.number(),
    sats: z.number()
  }),
  discountPercent: z.number().min(0).max(100).optional(),
  genres: z.array(GameGenreSchema),
  tags: z.array(z.string()),
  rating: GameRatingSchema,
  status: GameStatusSchema,
  releaseDate: z.string(),
  lastUpdated: z.string(),
  media: z.object({
    headerImage: z.string(),
    screenshots: z.array(z.string()),
    videos: z.array(z.string()).optional(),
    logo: z.string().optional()
  }),
  systemRequirements: z.object({
    minimum: SystemRequirementsSchema,
    recommended: SystemRequirementsSchema.optional()
  }),
  features: z.array(z.string()),
  languages: z.array(z.string()),
  achievements: z.object({
    total: z.number(),
    unlocked: z.number().optional()
  }),
  reviews: z.object({
    positive: z.number(),
    negative: z.number(),
    score: z.number().min(0).max(10)
  }),
  fileSize: z.string(),
  version: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const GameLibraryEntrySchema = z.object({
  gameId: z.string(),
  userId: z.string(),
  purchasedAt: z.string(),
  installed: z.boolean(),
  installPath: z.string().optional(),
  hoursPlayed: z.number(),
  lastPlayed: z.string().optional(),
  achievements: z.array(z.object({
    id: z.string(),
    unlockedAt: z.string()
  })),
  cloudSaveEnabled: z.boolean(),
  autoUpdateEnabled: z.boolean()
});

export type GameGenre = z.infer<typeof GameGenreSchema>;
export type GameRating = z.infer<typeof GameRatingSchema>;
export type GameStatus = z.infer<typeof GameStatusSchema>;
export type SystemRequirements = z.infer<typeof SystemRequirementsSchema>;
export type Game = z.infer<typeof GameSchema>;
export type GameLibraryEntry = z.infer<typeof GameLibraryEntrySchema>;
