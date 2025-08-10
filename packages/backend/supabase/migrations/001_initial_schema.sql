-- GameMarketplace Database Schema
-- Initial migration for gaming marketplace with Bitcoin payments

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'developer', 'admin')),
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'in_game', 'offline')),
    
    -- Bitcoin integration
    bitcoin_address TEXT,
    lightning_address TEXT,
    
    -- Profile information
    bio TEXT,
    location TEXT,
    website TEXT,
    steam_id TEXT,
    
    -- Preferences
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
    language TEXT DEFAULT 'en',
    currency TEXT DEFAULT 'usd' CHECK (currency IN ('usd', 'btc', 'sats')),
    
    -- Notification preferences
    notifications_email BOOLEAN DEFAULT true,
    notifications_push BOOLEAN DEFAULT true,
    notifications_game_updates BOOLEAN DEFAULT true,
    notifications_friend_activity BOOLEAN DEFAULT true,
    notifications_promotions BOOLEAN DEFAULT false,
    
    -- Privacy settings
    privacy_show_online_status BOOLEAN DEFAULT true,
    privacy_show_game_activity BOOLEAN DEFAULT true,
    privacy_allow_friend_requests BOOLEAN DEFAULT true,
    
    -- Stats
    games_owned INTEGER DEFAULT 0,
    total_hours_played INTEGER DEFAULT 0,
    achievements_unlocked INTEGER DEFAULT 0,
    friends_count INTEGER DEFAULT 0,
    reviews_written INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Games table
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    developer TEXT NOT NULL,
    publisher TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT NOT NULL,
    
    -- Pricing in multiple currencies
    price_usd DECIMAL(10,2) NOT NULL,
    price_btc DECIMAL(16,8) NOT NULL,
    price_sats BIGINT NOT NULL,
    discount_percent INTEGER DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    
    -- Game metadata
    genres TEXT[] NOT NULL,
    tags TEXT[] DEFAULT '{}',
    rating TEXT NOT NULL CHECK (rating IN ('everyone', 'teen', 'mature', 'adults_only')),
    status TEXT DEFAULT 'available' CHECK (status IN ('coming_soon', 'available', 'early_access', 'discontinued')),
    release_date DATE NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Media
    header_image TEXT NOT NULL,
    screenshots TEXT[] DEFAULT '{}',
    videos TEXT[] DEFAULT '{}',
    logo TEXT,
    
    -- System requirements (stored as JSONB)
    system_requirements_minimum JSONB NOT NULL,
    system_requirements_recommended JSONB,
    
    -- Game features
    features TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    
    -- Achievements
    total_achievements INTEGER DEFAULT 0,
    
    -- Reviews
    positive_reviews INTEGER DEFAULT 0,
    negative_reviews INTEGER DEFAULT 0,
    review_score DECIMAL(3,1) DEFAULT 0.0 CHECK (review_score >= 0 AND review_score <= 10),
    
    -- File information
    file_size TEXT NOT NULL,
    version TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User game library
CREATE TABLE public.user_libraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    installed BOOLEAN DEFAULT false,
    install_path TEXT,
    hours_played INTEGER DEFAULT 0,
    last_played TIMESTAMP WITH TIME ZONE,
    cloud_save_enabled BOOLEAN DEFAULT true,
    auto_update_enabled BOOLEAN DEFAULT true,
    
    UNIQUE(user_id, game_id)
);

-- User achievements
CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, game_id, achievement_id)
);

-- Bitcoin payments and invoices
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    btcpay_invoice_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    
    -- Amount in multiple currencies
    amount_usd DECIMAL(10,2) NOT NULL,
    amount_btc DECIMAL(16,8) NOT NULL,
    amount_sats BIGINT NOT NULL,
    
    method TEXT NOT NULL CHECK (method IN ('bitcoin_onchain', 'lightning_network')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'confirmed', 'failed', 'expired', 'refunded')),
    
    -- Bitcoin specific data
    bitcoin_address TEXT,
    lightning_invoice TEXT,
    qr_code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    transaction_id TEXT,
    confirmations INTEGER DEFAULT 0,
    
    -- Metadata
    order_id TEXT NOT NULL,
    description TEXT NOT NULL,
    redirect_url TEXT,
    webhook_url TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments (confirmed invoices)
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    
    -- Amount in multiple currencies
    amount_usd DECIMAL(10,2) NOT NULL,
    amount_btc DECIMAL(16,8) NOT NULL,
    amount_sats BIGINT NOT NULL,
    
    method TEXT NOT NULL CHECK (method IN ('bitcoin_onchain', 'lightning_network')),
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'refunded')),
    
    transaction_id TEXT NOT NULL,
    confirmations INTEGER NOT NULL,
    network_fee DECIMAL(16,8),
    processing_time INTEGER, -- in seconds
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friends system
CREATE TABLE public.friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Downloads tracking
CREATE TABLE public.downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'downloading', 'paused', 'completed', 'failed')),
    progress DECIMAL(5,2) DEFAULT 0.0 CHECK (progress >= 0 AND progress <= 100),
    speed_mbps DECIMAL(10,2) DEFAULT 0,
    bytes_downloaded BIGINT DEFAULT 0,
    total_bytes BIGINT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, game_id)
);

-- Community discussions
CREATE TABLE public.discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE, -- NULL for general discussions
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'discussion' CHECK (type IN ('discussion', 'guide', 'review', 'screenshot')),
    likes INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion replies
CREATE TABLE public.discussion_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_status ON public.users(status);

CREATE INDEX idx_games_title ON public.games(title);
CREATE INDEX idx_games_developer ON public.games(developer);
CREATE INDEX idx_games_genres ON public.games USING GIN(genres);
CREATE INDEX idx_games_tags ON public.games USING GIN(tags);
CREATE INDEX idx_games_status ON public.games(status);
CREATE INDEX idx_games_price_usd ON public.games(price_usd);

CREATE INDEX idx_user_libraries_user_id ON public.user_libraries(user_id);
CREATE INDEX idx_user_libraries_game_id ON public.user_libraries(game_id);

CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_btcpay_id ON public.invoices(btcpay_invoice_id);

CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_game_id ON public.payments(game_id);

CREATE INDEX idx_friends_user_id ON public.friends(user_id);
CREATE INDEX idx_friends_friend_id ON public.friends(friend_id);
CREATE INDEX idx_friends_status ON public.friends(status);

CREATE INDEX idx_downloads_user_id ON public.downloads(user_id);
CREATE INDEX idx_downloads_status ON public.downloads(status);

CREATE INDEX idx_discussions_game_id ON public.discussions(game_id);
CREATE INDEX idx_discussions_user_id ON public.discussions(user_id);
CREATE INDEX idx_discussions_type ON public.discussions(type);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON public.discussions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discussion_replies_updated_at BEFORE UPDATE ON public.discussion_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
