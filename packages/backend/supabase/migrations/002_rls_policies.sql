-- Row Level Security Policies for GameMarketplace
-- Run this AFTER running 001_initial_schema.sql

-- Users policies
CREATE POLICY "Users can view public profiles" ON public.users
    FOR SELECT USING (
        id = auth.uid() OR 
        (privacy_show_online_status = true)
    );

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (id = auth.uid());

-- Games policies (public read, admin write)
CREATE POLICY "Anyone can view available games" ON public.games
    FOR SELECT USING (status = 'available' OR status = 'early_access');

CREATE POLICY "Developers can manage their games" ON public.games
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('developer', 'admin')
        )
    );

-- User libraries policies
CREATE POLICY "Users can view own library" ON public.user_libraries
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own library" ON public.user_libraries
    FOR ALL USING (user_id = auth.uid());

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can unlock own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON public.invoices
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own invoices" ON public.invoices
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update invoices" ON public.invoices
    FOR UPDATE USING (true); -- Allow system updates for payment processing

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create payments" ON public.payments
    FOR INSERT WITH CHECK (true); -- Allow system to create payments

-- Friends policies
CREATE POLICY "Users can view own friends" ON public.friends
    FOR SELECT USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can manage own friendships" ON public.friends
    FOR ALL USING (user_id = auth.uid());

-- Downloads policies
CREATE POLICY "Users can view own downloads" ON public.downloads
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own downloads" ON public.downloads
    FOR ALL USING (user_id = auth.uid());

-- Discussions policies
CREATE POLICY "Anyone can view approved discussions" ON public.discussions
    FOR SELECT USING (true); -- All discussions are public for now

CREATE POLICY "Authenticated users can create discussions" ON public.discussions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can update own discussions" ON public.discussions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own discussions" ON public.discussions
    FOR DELETE USING (user_id = auth.uid());

-- Discussion replies policies
CREATE POLICY "Anyone can view discussion replies" ON public.discussion_replies
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies" ON public.discussion_replies
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can update own replies" ON public.discussion_replies
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own replies" ON public.discussion_replies
    FOR DELETE USING (user_id = auth.uid());

-- Create functions for common operations
CREATE OR REPLACE FUNCTION public.get_user_library(user_uuid UUID)
RETURNS TABLE (
    game_id UUID,
    title TEXT,
    developer TEXT,
    header_image TEXT,
    installed BOOLEAN,
    hours_played INTEGER,
    last_played TIMESTAMP WITH TIME ZONE,
    purchased_at TIMESTAMP WITH TIME ZONE
) 
SECURITY DEFINER
AS $$
BEGIN
    -- Only allow users to get their own library
    IF user_uuid != auth.uid() THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    RETURN QUERY
    SELECT 
        g.id,
        g.title,
        g.developer,
        g.header_image,
        ul.installed,
        ul.hours_played,
        ul.last_played,
        ul.purchased_at
    FROM public.user_libraries ul
    JOIN public.games g ON g.id = ul.game_id
    WHERE ul.user_id = user_uuid
    ORDER BY ul.purchased_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get user stats
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS TABLE (
    games_owned INTEGER,
    total_hours_played INTEGER,
    achievements_unlocked INTEGER,
    friends_count INTEGER
)
SECURITY DEFINER
AS $$
BEGIN
    -- Only allow users to get their own stats or public stats
    IF user_uuid != auth.uid() THEN
        -- Check if user allows public viewing
        IF NOT EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = user_uuid 
            AND privacy_show_game_activity = true
        ) THEN
            RAISE EXCEPTION 'Access denied';
        END IF;
    END IF;
    
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM public.user_libraries WHERE user_id = user_uuid),
        (SELECT COALESCE(SUM(hours_played), 0)::INTEGER FROM public.user_libraries WHERE user_id = user_uuid),
        (SELECT COUNT(*)::INTEGER FROM public.user_achievements WHERE user_id = user_uuid),
        (SELECT COUNT(*)::INTEGER FROM public.friends WHERE (user_id = user_uuid OR friend_id = user_uuid) AND status = 'accepted')
    ;
END;
$$ LANGUAGE plpgsql;

-- Function to search games
CREATE OR REPLACE FUNCTION public.search_games(
    search_term TEXT DEFAULT '',
    genre_filter TEXT DEFAULT '',
    max_price_usd DECIMAL DEFAULT NULL,
    sort_by TEXT DEFAULT 'title',
    sort_order TEXT DEFAULT 'asc'
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    developer TEXT,
    short_description TEXT,
    price_usd DECIMAL,
    price_btc DECIMAL,
    price_sats BIGINT,
    discount_percent INTEGER,
    header_image TEXT,
    genres TEXT[],
    rating TEXT,
    review_score DECIMAL,
    positive_reviews INTEGER,
    negative_reviews INTEGER
)
AS $$
DECLARE
    query TEXT;
BEGIN
    query := 'SELECT g.id, g.title, g.developer, g.short_description, g.price_usd, g.price_btc, g.price_sats, g.discount_percent, g.header_image, g.genres, g.rating, g.review_score, g.positive_reviews, g.negative_reviews FROM public.games g WHERE g.status IN (''available'', ''early_access'')';
    
    -- Add search term filter
    IF search_term != '' THEN
        query := query || ' AND (g.title ILIKE ''%' || search_term || '%'' OR g.developer ILIKE ''%' || search_term || '%'' OR g.description ILIKE ''%' || search_term || '%'')';
    END IF;
    
    -- Add genre filter
    IF genre_filter != '' THEN
        query := query || ' AND ''' || genre_filter || ''' = ANY(g.genres)';
    END IF;
    
    -- Add price filter
    IF max_price_usd IS NOT NULL THEN
        query := query || ' AND g.price_usd <= ' || max_price_usd;
    END IF;
    
    -- Add sorting
    IF sort_by = 'price' THEN
        query := query || ' ORDER BY g.price_usd ' || sort_order;
    ELSIF sort_by = 'rating' THEN
        query := query || ' ORDER BY g.review_score ' || sort_order;
    ELSIF sort_by = 'release_date' THEN
        query := query || ' ORDER BY g.release_date ' || sort_order;
    ELSE
        query := query || ' ORDER BY g.title ' || sort_order;
    END IF;
    
    RETURN QUERY EXECUTE query;
END;
$$ LANGUAGE plpgsql;
