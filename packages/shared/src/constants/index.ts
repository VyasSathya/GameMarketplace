export const BITCOIN_NETWORKS = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
  REGTEST: 'regtest'
} as const;

export const PAYMENT_TIMEOUTS = {
  LIGHTNING: 15 * 60 * 1000, // 15 minutes
  ONCHAIN: 60 * 60 * 1000,   // 1 hour
} as const;

export const GAME_CATEGORIES = {
  FEATURED: 'featured',
  NEW_TRENDING: 'new',
  TOP_SELLERS: 'topsellers',
  SPECIALS: 'specials',
  YOUR_QUEUE: 'queue'
} as const;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  
  // Games
  GAMES: '/api/games',
  GAME_DETAILS: '/api/games/:id',
  
  // User
  PROFILE: '/api/users/profile',
  LIBRARY: '/api/users/library',
  FRIENDS: '/api/users/friends',
  
  // Payments
  CREATE_INVOICE: '/api/payments/invoice',
  PAYMENT_STATUS: '/api/payments/:id/status',
  WEBHOOK: '/api/payments/webhook',
  
  // Downloads
  START_DOWNLOAD: '/api/downloads/start',
  DOWNLOAD_PROGRESS: '/api/downloads/progress',
  DOWNLOAD_FILE: '/api/downloads/file/:token'
} as const;

export const WEBSOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Chat
  MESSAGE: 'message',
  TYPING: 'typing',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  
  // Downloads
  DOWNLOAD_PROGRESS: 'download_progress',
  DOWNLOAD_COMPLETE: 'download_complete',
  DOWNLOAD_ERROR: 'download_error',
  
  // Payments
  PAYMENT_UPDATE: 'payment_update',
  
  // Presence
  USER_STATUS: 'user_status',
  FRIEND_ONLINE: 'friend_online',
  FRIEND_OFFLINE: 'friend_offline'
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'gamemarketplace_auth_token',
  REFRESH_TOKEN: 'gamemarketplace_refresh_token',
  USER_PREFERENCES: 'gamemarketplace_user_preferences',
  THEME: 'gamemarketplace_theme',
  LANGUAGE: 'gamemarketplace_language'
} as const;

export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_-]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true
  },
  GAME_TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100
  },
  DESCRIPTION: {
    MAX_LENGTH: 5000
  }
} as const;
