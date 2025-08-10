import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Store,
  Library,
  Download,
  Users,
  MessageCircle,
  Settings,
  Search,
  Heart,
  ShoppingCart,
  Bell,
  User,
  Star,
  Bitcoin,
  Zap,
  Pause,
  Play,
  X,
  LogOut,
  Sun,
  Moon,
  Plus
} from 'lucide-react';
import DeveloperOnboarding from './components/DeveloperOnboarding';
import GamePublishingForm from './components/GamePublishingForm';

interface Game {
  id: string;
  title: string;
  developer: string;
  short_description: string;
  price_usd: number;
  price_btc: number;
  price_sats: number;
  discount_percent: number;
  header_image: string;
  genres: string[];
  rating: string;
  review_score: number;
  positive_reviews: number;
  negative_reviews: number;
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('store');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStoreTab, setActiveStoreTab] = useState('featured');
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeveloperOnboarding, setShowDeveloperOnboarding] = useState(false);
  const [showGamePublishing, setShowGamePublishing] = useState(false);

  // Library state
  const [library, setLibrary] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(true);

  // Downloads state
  const [downloads, setDownloads] = useState([]);
  const [downloadsLoading, setDownloadsLoading] = useState(true);

  // Friends state
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [friendsActiveTab, setFriendsActiveTab] = useState('friends');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Theme state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });

  // Theme switching
  const toggleTheme = (newTheme?: string) => {
    const nextTheme = newTheme || (theme === 'dark' ? 'light' : 'dark');
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Apply theme on load and changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check for existing auth token on app load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && !user) {
      // Mock user data for demo - in real app, validate token with backend
      const mockUser = {
        id: '1',
        email: 'demo@gamer.com',
        username: 'demo_gamer',
        displayName: 'Demo Gamer',
        role: 'player',
        verified: true,
        profileLevel: 15,
        token: token
      };
      setUser(mockUser);
    }
  }, []);

  // Check for existing session on load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token with backend
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          setUser({ ...data.user, token });
        } else {
          localStorage.removeItem('auth_token');
        }
      })
      .catch(() => localStorage.removeItem('auth_token'));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setActiveView('store'); // Redirect to store
  };

  const handleDeveloperOnboardingComplete = async (applicationData: any) => {
    try {
      // Here we would submit the application to the API
      console.log('Developer application submitted:', applicationData);

      // For now, just close the modal and show success
      setShowDeveloperOnboarding(false);

      // You could also update the user's account type here
      if (user) {
        setUser({
          ...user,
          accountType: 'developer',
          developerApplicationStatus: 'submitted'
        });
      }

      alert('🎉 Developer application submitted successfully! We\'ll review it within 24-48 hours.');
    } catch (error) {
      console.error('Failed to submit developer application:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  const handleGamePublishingSubmit = async (gameData: any) => {
    try {
      // Here we would submit the game to the API
      console.log('Game submitted:', gameData);

      // For now, just close the modal and show success
      setShowGamePublishing(false);

      alert('🎉 Game submitted successfully! We\'ll review it and it should go live within 24 hours.');
    } catch (error) {
      console.error('Failed to submit game:', error);
      alert('Failed to submit game. Please try again.');
    }
  };

  const handleAuth = async (credentials: any, isLogin: boolean) => {
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

      // For now, simulate successful auth with mock data
      if (isLogin) {
        // Mock login
        if (credentials.email === 'demo@gamer.com' && credentials.password === 'password') {
          const mockUser = {
            id: '1',
            email: 'demo@gamer.com',
            username: 'demo_gamer',
            displayName: 'Demo Gamer',
            role: 'player',
            verified: true,
            profileLevel: 15,
            token: 'mock_jwt_token'
          };
          localStorage.setItem('auth_token', mockUser.token);
          setUser(mockUser);
          setShowAuthModal(false);
          return { success: true };
        } else {
          throw new Error('Invalid credentials. Try demo@gamer.com / password');
        }
      } else {
        // Mock registration
        const mockUser = {
          id: Date.now().toString(),
          email: credentials.email,
          username: credentials.username,
          displayName: credentials.displayName,
          role: credentials.accountType,
          verified: false,
          profileLevel: 1,
          token: 'mock_jwt_token_' + Date.now()
        };
        localStorage.setItem('auth_token', mockUser.token);
        setUser(mockUser);
        setShowAuthModal(false);
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Authentication failed' };
    }
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try API first, then fallback to direct Supabase
        let url = '/api/games';
        const params = new URLSearchParams();

        if (searchQuery) params.append('search', searchQuery);
        if (activeStoreTab !== 'featured') {
          if (activeStoreTab === 'new') params.append('sortBy', 'release_date');
          if (activeStoreTab === 'topsellers') params.append('sortBy', 'positive_reviews');
          if (activeStoreTab === 'specials') params.append('discount', 'true');
        }

        if (params.toString()) url += `?${params.toString()}`;

        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            setGames(data.games || []);
            return;
          }
        } catch (apiError) {
          console.log('API failed, trying direct Supabase connection...');
        }

        // Fallback: Direct Supabase query
        let supabaseQuery = 'id,title,developer,publisher,price_usd,price_btc,price_sats,header_image,short_description,genres,rating,positive_reviews,negative_reviews,review_score,release_date,status';
        let supabaseUrl = `https://uhgiaartjabgmjolksmb.supabase.co/rest/v1/games?select=${supabaseQuery}`;

        // Add filtering based on active tab
        if (activeStoreTab === 'new') {
          supabaseUrl += '&order=release_date.desc';
        } else if (activeStoreTab === 'topsellers') {
          supabaseUrl += '&order=positive_reviews.desc';
        } else if (activeStoreTab === 'specials') {
          // For now, just show all games for specials
          supabaseUrl += '&order=created_at.desc';
        } else {
          supabaseUrl += '&order=rating.desc';
        }

        if (searchQuery) {
          supabaseUrl += `&or=(title.ilike.%25${encodeURIComponent(searchQuery)}%25,developer.ilike.%25${encodeURIComponent(searchQuery)}%25,short_description.ilike.%25${encodeURIComponent(searchQuery)}%25)`;
        }

        const supabaseResponse = await fetch(supabaseUrl, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZ2lhYXJ0amFiZ21qb2xrc21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NzI4NzQsImV4cCI6MjA0OTQ0ODg3NH0.YOqzBJhEhCJhkJJkqJhkJhkJhkJhkJhkJhkJhkJhkJhk',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZ2lhYXJ0amFiZ21qb2xrc21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NzI4NzQsImV4cCI6MjA0OTQ0ODg3NH0.YOqzBJhEhCJhkJJkqJhkJhkJhkJhkJhkJhkJhkJhkJhk'
          }
        });

        if (!supabaseResponse.ok) {
          throw new Error(`Supabase error: ${supabaseResponse.status}`);
        }

        const supabaseData = await supabaseResponse.json();
        setGames(supabaseData || []);

      } catch (err) {
        console.error('Failed to fetch games:', err);
        setError(err instanceof Error ? err.message : 'Failed to load games');
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [activeStoreTab, searchQuery]);

  const handlePurchase = async (gameId: string) => {
    if (!user) {
      alert('Please sign in to purchase games');
      return;
    }

    try {
      const response = await fetch('/api/payments/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          gameId,
          method: 'lightning_network'
        })
      });

      if (!response.ok) throw new Error('Failed to create invoice');

      const data = await response.json();
      // Handle payment flow
      console.log('Invoice created:', data);
    } catch (err) {
      console.error('Purchase failed:', err);
    }
  };

  const renderStoreView = () => (
    <section className="view active">
      <div className="container-block">
        <div className="store-hero">
          <div className="store-quick">
            {[
              { id: 'featured', label: 'Featured', icon: Star },
              { id: 'new', label: 'New & Trending', icon: Zap },
              { id: 'topsellers', label: 'Top Sellers', icon: Bitcoin },
              { id: 'specials', label: 'Specials', icon: Heart }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStoreTab(tab.id)}
                  className={`pill ${activeStoreTab === tab.id ? 'active' : ''}`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="games-grid">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Loading games...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>Failed to load games: {error}</p>
              <button onClick={() => window.location.reload()} className="retry-btn">
                Retry
              </button>
            </div>
          ) : games.length === 0 ? (
            <div className="empty-state">
              <p>No games found</p>
            </div>
          ) : (
            games.map(game => (
              <div key={game.id} className="game-card">
                <div className="game-image">
                  <img src={game.header_image} alt={game.title} />
                  {game.discount_percent > 0 && (
                    <div className="discount-badge">-{game.discount_percent}%</div>
                  )}
                  <div className="game-overlay">
                    <div className="game-rating">
                      <Star size={12} fill="currentColor" />
                      {game.review_score}
                    </div>
                  </div>
                </div>
                <div className="game-info">
                  <h3 className="game-title">{game.title}</h3>
                  <p className="game-developer">{game.developer}</p>
                  <p className="game-description">{game.short_description}</p>
                  <div className="game-genres">
                    {game.genres.slice(0, 2).map(genre => (
                      <span key={genre} className="genre-tag">{genre}</span>
                    ))}
                  </div>
                  <div className="game-pricing">
                    <div className="price-main">
                      <span className="price-usd">${game.price_usd}</span>
                      <span className="price-btc">{game.price_btc.toFixed(8)} BTC</span>
                    </div>
                    <div className="price-sats">{game.price_sats.toLocaleString()} sats</div>
                  </div>
                  <button
                    className="btn-bitcoin"
                    onClick={() => handlePurchase(game.id)}
                  >
                    <Bitcoin size={16} />
                    <Zap size={16} />
                    Buy with Bitcoin
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );

  // Load library data
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        // Mock library data since we don't have user auth yet
        const mockLibrary = [
          {
            license: {
              id: '1',
              purchaseDate: '2024-01-20T15:30:00Z',
              totalPlaytimeMinutes: 245,
              lastPlayed: '2024-08-08T20:15:00Z'
            },
            game: {
              id: '650e8400-e29b-41d4-a716-446655440001',
              title: 'Bitcoin Miner Simulator',
              developer: 'Satoshi Studios',
              header_image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
              genres: ['Simulation', 'Strategy']
            }
          },
          {
            license: {
              id: '2',
              purchaseDate: '2024-02-05T12:45:00Z',
              totalPlaytimeMinutes: 180,
              lastPlayed: '2024-08-07T18:30:00Z'
            },
            game: {
              id: '650e8400-e29b-41d4-a716-446655440002',
              title: 'Lightning Network Adventure',
              developer: 'Channel Games',
              header_image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800',
              genres: ['Action', 'Adventure']
            }
          },
          {
            license: {
              id: '3',
              purchaseDate: '2024-03-10T09:20:00Z',
              totalPlaytimeMinutes: 120,
              lastPlayed: '2024-08-06T14:20:00Z'
            },
            game: {
              id: '650e8400-e29b-41d4-a716-446655440004',
              title: 'Satoshi\'s Quest',
              developer: 'Indie Lightning',
              header_image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
              genres: ['RPG', 'Adventure']
            }
          }
        ];
        setLibrary(mockLibrary);
      } catch (error) {
        console.error('Failed to fetch library:', error);
      } finally {
        setLibraryLoading(false);
      }
    };

    if (activeView === 'library') {
      fetchLibrary();
    }
  }, [activeView]);

  // Load downloads data from database
  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        if (!user) {
          setDownloads([]);
          setDownloadsLoading(false);
          return;
        }

        // Try API first, then fallback to direct Supabase
        try {
          const response = await fetch(`/api/downloads?user_id=${user.id}`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });

          if (response.ok) {
            const data = await response.json();
            setDownloads(data.downloads || []);
            return;
          }
        } catch (apiError) {
          console.log('Downloads API failed, trying direct Supabase...');
        }

        // Fallback: Direct Supabase query
        const supabaseUrl = `https://uhgiaartjabgmjolksmb.supabase.co/rest/v1/downloads?select=*,games(id,title,developer,header_image)&user_id=eq.${user.id}&order=created_at.desc`;

        const supabaseResponse = await fetch(supabaseUrl, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZ2lhYXJ0amFiZ21qb2xrc21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NzI4NzQsImV4cCI6MjA0OTQ0ODg3NH0.YOqzBJhEhCJhkJJkqJhkJhkJhkJhkJhkJhkJhkJhkJhk',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZ2lhYXJ0amFiZ21qb2xrc21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NzI4NzQsImV4cCI6MjA0OTQ0ODg3NH0.YOqzBJhEhCJhkJJkqJhkJhkJhkJhkJhkJhkJhkJhkJhk'
          }
        });

        if (supabaseResponse.ok) {
          const supabaseData = await supabaseResponse.json();
          // Transform data to match expected format
          const transformedDownloads = supabaseData.map(download => ({
            ...download,
            download_speed_mbps: download.download_speed_bps ? (download.download_speed_bps / 1024 / 1024).toFixed(1) : 0,
            downloaded_mb: download.bytes_downloaded ? (download.bytes_downloaded / 1024 / 1024).toFixed(0) : 0,
            total_mb: download.bytes_total ? (download.bytes_total / 1024 / 1024).toFixed(0) : 0,
            eta_minutes: download.eta_seconds ? Math.ceil(download.eta_seconds / 60) : null
          }));
          setDownloads(transformedDownloads);
        } else {
          throw new Error('Failed to fetch downloads from Supabase');
        }
      } catch (error) {
        console.error('Failed to fetch downloads:', error);
        setDownloads([]);
      } finally {
        setDownloadsLoading(false);
      }
    };

    if (activeView === 'downloads') {
      fetchDownloads();
    }
  }, [activeView, user]);

  // Load friends data from database
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        if (!user) return;

        // Fetch real friends from database
        const friendsResponse = await fetch('/api/friends', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });

        if (friendsResponse.ok) {
          const friendsData = await friendsResponse.json();
          setFriends(friendsData.friends || []);
          setFriendRequests(friendsData.requests || []);
          setSuggestedFriends(friendsData.suggested || []);
        } else {
          // Fallback to mock data for demo
          const mockFriends = [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              username: 'alice_gamer',
              display_name: 'Alice Cooper',
              avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
              status: 'offline',
              profile_level: 15,
              bio: 'Casual gamer who loves indie titles. Always looking for new adventures!',
              location: 'Portland, OR'
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440004',
              username: 'david_pro',
              display_name: 'David Wilson',
              avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
              status: 'offline',
              profile_level: 22,
              bio: 'Hardcore gamer and Bitcoin enthusiast. 890+ hours played this year!',
              location: 'San Francisco, CA'
            }
          ];

          const mockRequests = [
            {
              id: '550e8400-e29b-41d4-a716-446655440005',
              username: 'eve_indie',
              display_name: 'Eve Martinez',
              avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
              profile_level: 5,
              bio: 'Solo indie developer creating atmospheric puzzle games.',
              location: 'Montreal, Canada',
              mutualFriends: 2,
              requestDate: '2024-08-09T10:30:00Z'
            }
          ];

          const mockSuggested = [
            {
              id: '550e8400-e29b-41d4-a716-446655440002',
              username: 'bob_dev',
              display_name: 'Bob Smith',
              avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
              profile_level: 8,
              bio: 'Indie developer at Satoshi Studios. Working on Bitcoin-themed games.',
              location: 'Austin, TX',
              mutualFriends: 1,
              reason: 'Plays similar games'
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440003',
              username: 'carol_pub',
              display_name: 'Carol Johnson',
              avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
              profile_level: 12,
              bio: 'Publisher at Blockchain Games Inc. Helping indie devs reach their audience.',
              location: 'New York, NY',
              mutualFriends: 3,
              reason: 'In your community'
            }
          ];

          setFriends(mockFriends);
          setFriendRequests(mockRequests);
          setSuggestedFriends(mockSuggested);
        }
      } catch (error) {
        console.error('Failed to fetch friends:', error);
      }
    };

    if (activeView === 'friends' && user) {
      fetchFriends();
    }
  }, [activeView, user]);

  // User search functionality
  const searchUsers = async (query: string) => {
    if (!query.trim() || !user) {
      setUserSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Try to search real database first
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUserSearchResults(data.users || []);
      } else {
        // Fallback to mock search for demo
        const allUsers = [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            username: 'alice_gamer',
            display_name: 'Alice Cooper',
            avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
            profile_level: 15,
            bio: 'Casual gamer who loves indie titles. Always looking for new adventures!',
            location: 'Portland, OR',
            role: 'player'
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            username: 'bob_dev',
            display_name: 'Bob Smith',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            profile_level: 8,
            bio: 'Indie developer at Satoshi Studios. Working on Bitcoin-themed games.',
            location: 'Austin, TX',
            role: 'developer'
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440003',
            username: 'carol_pub',
            display_name: 'Carol Johnson',
            avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
            profile_level: 12,
            bio: 'Publisher at Blockchain Games Inc. Helping indie devs reach their audience.',
            location: 'New York, NY',
            role: 'publisher'
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440004',
            username: 'david_pro',
            display_name: 'David Wilson',
            avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            profile_level: 22,
            bio: 'Hardcore gamer and Bitcoin enthusiast. 890+ hours played this year!',
            location: 'San Francisco, CA',
            role: 'player'
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440005',
            username: 'eve_indie',
            display_name: 'Eve Martinez',
            avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
            profile_level: 5,
            bio: 'Solo indie developer creating atmospheric puzzle games.',
            location: 'Montreal, Canada',
            role: 'developer'
          }
        ];

        const filtered = allUsers.filter(u =>
          u.username.toLowerCase().includes(query.toLowerCase()) ||
          u.display_name.toLowerCase().includes(query.toLowerCase()) ||
          u.bio.toLowerCase().includes(query.toLowerCase())
        );

        setUserSearchResults(filtered);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setUserSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(userSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchQuery, user]);

  const renderLibraryView = () => {
    // Require login for library
    if (!user) {
      return (
        <section className="view active">
          <div className="container-block">
            <div className="login-required">
              <Library size={64} />
              <h2>Sign In Required</h2>
              <p>You need to sign in to view your game library</p>
              <button
                className="auth-submit"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In to Continue
              </button>
            </div>
          </div>
        </section>
      );
    }

    const formatPlaytime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hours > 0) {
        return `${hours}h ${mins}m`;
      }
      return `${mins}m`;
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString();
    };

    return (
      <section className="view active">
        <div className="container-block">
          <div className="library-header">
            <div>
              <h2>Game Library</h2>
              <p>Your Bitcoin-purchased games</p>
            </div>
            <div className="library-stats">
              <div className="stat-item">
                <span>{library.length} Games</span>
              </div>
              <div className="stat-item">
                <span>{library.reduce((total, item) => total + item.license.totalPlaytimeMinutes, 0)} Total Minutes</span>
              </div>
            </div>
          </div>

          {libraryLoading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Loading library...</p>
            </div>
          ) : library.length === 0 ? (
            <div className="empty-state">
              <Library size={48} />
              <h3>No Games Yet</h3>
              <p>Purchase games from the store to build your library</p>
            </div>
          ) : (
            <div className="library-grid">
              {library.map(item => (
                <div key={item.license.id} className="library-item">
                  <div className="library-image">
                    <img src={item.game.header_image} alt={item.game.title} />
                    <div className="library-overlay">
                      <button className="play-btn">
                        <Play size={20} />
                        Play
                      </button>
                    </div>
                  </div>
                  <div className="library-info">
                    <h3>{item.game.title}</h3>
                    <p>{item.game.developer}</p>
                    <div className="library-stats-item">
                      <div className="stat">
                        <span className="label">Playtime:</span>
                        <span className="value">{formatPlaytime(item.license.totalPlaytimeMinutes)}</span>
                      </div>
                      <div className="stat">
                        <span className="label">Last played:</span>
                        <span className="value">{formatDate(item.license.lastPlayed)}</span>
                      </div>
                      <div className="stat">
                        <span className="label">Purchased:</span>
                        <span className="value">{formatDate(item.license.purchaseDate)}</span>
                      </div>
                    </div>
                    <div className="library-genres">
                      {item.game.genres.map(genre => (
                        <span key={genre} className="genre-tag">{genre}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderDownloadsView = () => {
    // Require login for downloads
    if (!user) {
      return (
        <section className="view active">
          <div className="container-block">
            <div className="login-required">
              <Download size={64} />
              <h2>Sign In Required</h2>
              <p>You need to sign in to view your downloads</p>
              <button
                className="auth-submit"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In to Continue
              </button>
            </div>
          </div>
        </section>
      );
    }

    const handlePause = (id: string) => {
      setDownloads(prev => prev.map(download =>
        download.id === id
          ? { ...download, status: 'paused', download_speed_mbps: 0, eta_minutes: null }
          : download
      ));
    };

    const handleResume = (id: string) => {
      setDownloads(prev => prev.map(download =>
        download.id === id
          ? { ...download, status: 'downloading', download_speed_mbps: 12.5, eta_minutes: 5 }
          : download
      ));
    };

    const handleCancel = (id: string) => {
      setDownloads(prev => prev.filter(download => download.id !== id));
    };

    const activeDownloads = downloads.filter(d => d.status === 'downloading');
    const totalSpeed = activeDownloads.reduce((sum, d) => sum + (d.download_speed_mbps || 0), 0);

    return (
      <section className="view active">
        <div className="container-block">
          <div className="downloads-header">
            <div className="downloads-title">
              <h2>Downloads</h2>
              <p>Manage your game downloads and installations</p>
            </div>
            <div className="downloads-stats">
              <div className="stat-item">
                <Download size={16} />
                <span>Speed: {totalSpeed.toFixed(1)} MB/s</span>
              </div>
              <div className="stat-item">
                <span>Free Space: 245 GB</span>
              </div>
            </div>
          </div>

          {downloadsLoading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Loading downloads...</p>
            </div>
          ) : downloads.length === 0 ? (
            <div className="empty-state">
              <Download size={48} />
              <h3>No Downloads</h3>
              <p>Your downloads will appear here</p>
            </div>
          ) : (
            <div className="downloads-list">
              {downloads.map(download => (
                <div key={download.id} className="download-item">
                  <div className="download-image">
                    <img src={download.games?.header_image} alt={download.games?.title} />
                  </div>
                  <div className="download-info">
                    <h3>{download.games?.title}</h3>
                    <p>{download.games?.developer}</p>
                    <div className="download-progress">
                      <div className="progress-info">
                        <span>{download.progress_percent}%</span>
                        <span>{(download.downloaded_mb / 1024).toFixed(1)} GB / {(download.total_mb / 1024).toFixed(1)} GB</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${download.status}`}
                          style={{ width: `${download.progress_percent}%` }}
                        />
                      </div>
                      <div className="download-status">
                        {download.status === 'downloading' && (
                          <span>{download.download_speed_mbps} MB/s • {download.eta_minutes} min remaining</span>
                        )}
                        {download.status === 'completed' && <span>Complete</span>}
                        {download.status === 'paused' && <span>Paused</span>}
                      </div>
                    </div>
                  </div>
                  <div className="download-controls">
                    {download.status === 'downloading' && (
                      <button onClick={() => handlePause(download.id)} className="control-btn pause">
                        <Pause size={16} />
                      </button>
                    )}
                    {download.status === 'paused' && (
                      <button onClick={() => handleResume(download.id)} className="control-btn resume">
                        <Play size={16} />
                      </button>
                    )}
                    {download.status !== 'completed' && (
                      <button onClick={() => handleCancel(download.id)} className="control-btn cancel">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderCommunityView = () => (
    <section className="view active">
      <div className="container-block">
        <h2>Community</h2>
        <p>Connect with other Bitcoin gamers</p>
      </div>
    </section>
  );

  const renderFriendsView = () => {
    // Require login for friends
    if (!user) {
      return (
        <section className="view active">
          <div className="container-block">
            <div className="login-required">
              <Users size={64} />
              <h2>Sign In Required</h2>
              <p>You need to sign in to view your friends and community</p>
              <button
                className="auth-submit"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In to Continue
              </button>
            </div>
          </div>
        </section>
      );
    }

    const handleAddFriend = (userId: string) => {
      const user = suggestedFriends.find(f => f.id === userId);
      if (user) {
        setSuggestedFriends(prev => prev.filter(f => f.id !== userId));
        console.log('Friend request sent to', user.displayName);
      }
    };

    const handleAcceptRequest = (userId: string) => {
      const user = friendRequests.find(f => f.id === userId);
      if (user) {
        setFriendRequests(prev => prev.filter(f => f.id !== userId));
        setFriends(prev => [...prev, {
          ...user,
          status: 'offline',
          currentGame: null,
          lastSeen: 'Just added'
        }]);
      }
    };

    const handleDeclineRequest = (userId: string) => {
      setFriendRequests(prev => prev.filter(f => f.id !== userId));
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'online': return '#10b981';
        case 'in-game': return '#3b82f6';
        case 'away': return '#f59e0b';
        default: return '#6b7280';
      }
    };

    return (
      <section className="view active">
        <div className="container-block">
          <div className="friends-header">
            <div>
              <h2>Friends & Community</h2>
              <p>Connect with other Bitcoin gamers</p>
            </div>
            <div className="friends-stats">
              <div className="stat-item">
                <Users size={16} />
                <span>{friends.length} Friends</span>
              </div>
              <div className="stat-item">
                <span>{friends.filter(f => f.status === 'online' || f.status === 'in-game').length} Online</span>
              </div>
            </div>
          </div>

          <div className="friends-tabs">
            {[
              { id: 'friends', label: 'Friends', count: friends.length },
              { id: 'requests', label: 'Requests', count: friendRequests.length },
              { id: 'suggested', label: 'Suggested', count: suggestedFriends.length },
              { id: 'search', label: 'Search', count: 0 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFriendsActiveTab(tab.id)}
                className={`friends-tab ${friendsActiveTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
                {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
              </button>
            ))}
          </div>

          <div className="friends-content">
            {friendsActiveTab === 'friends' && (
              <div className="friends-list">
                {friends.length === 0 ? (
                  <div className="empty-state">
                    <Users size={48} />
                    <h3>No Friends Yet</h3>
                    <p>Add friends to see their gaming activity</p>
                  </div>
                ) : (
                  friends.map(friend => (
                    <div key={friend.id} className="friend-card">
                      <div className="friend-avatar">
                        <img src={friend.avatar} alt={friend.displayName} />
                        <div
                          className="status-indicator"
                          style={{ backgroundColor: getStatusColor(friend.status) }}
                        />
                      </div>
                      <div className="friend-info">
                        <div className="friend-name">
                          <h4>{friend.displayName}</h4>
                          <span className="username">@{friend.username}</span>
                        </div>
                        <div className="friend-status">
                          {friend.status === 'online' && <span className="status online">Online</span>}
                          {friend.status === 'in-game' && (
                            <span className="status in-game">
                              Playing {friend.currentGame}
                            </span>
                          )}
                          {friend.status === 'offline' && (
                            <span className="status offline">
                              Last seen {friend.lastSeen}
                            </span>
                          )}
                        </div>
                        <div className="friend-level">Level {friend.level}</div>
                      </div>
                      <div className="friend-actions">
                        <button className="action-btn">
                          <MessageCircle size={16} />
                        </button>
                        <button className="action-btn">
                          <User size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {friendsActiveTab === 'requests' && (
              <div className="requests-list">
                {friendRequests.length === 0 ? (
                  <div className="empty-state">
                    <Bell size={48} />
                    <h3>No Friend Requests</h3>
                    <p>Friend requests will appear here</p>
                  </div>
                ) : (
                  friendRequests.map(request => (
                    <div key={request.id} className="request-card">
                      <div className="request-avatar">
                        <img src={request.avatar} alt={request.displayName} />
                      </div>
                      <div className="request-info">
                        <h4>{request.displayName}</h4>
                        <span className="username">@{request.username}</span>
                        <div className="request-details">
                          <span>Level {request.level}</span>
                          {request.mutualFriends > 0 && (
                            <span>{request.mutualFriends} mutual friends</span>
                          )}
                        </div>
                      </div>
                      <div className="request-actions">
                        <button
                          className="accept-btn"
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          Accept
                        </button>
                        <button
                          className="decline-btn"
                          onClick={() => handleDeclineRequest(request.id)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {friendsActiveTab === 'suggested' && (
              <div className="suggested-list">
                {suggestedFriends.length === 0 ? (
                  <div className="empty-state">
                    <Search size={48} />
                    <h3>No Suggestions</h3>
                    <p>We'll suggest friends based on your activity</p>
                  </div>
                ) : (
                  suggestedFriends.map(suggestion => (
                    <div key={suggestion.id} className="suggestion-card">
                      <div className="suggestion-avatar">
                        <img src={suggestion.avatar} alt={suggestion.displayName} />
                      </div>
                      <div className="suggestion-info">
                        <h4>{suggestion.displayName}</h4>
                        <span className="username">@{suggestion.username}</span>
                        <div className="suggestion-details">
                          <span>Level {suggestion.level}</span>
                          <span className="suggestion-reason">{suggestion.reason}</span>
                          {suggestion.mutualFriends > 0 && (
                            <span>{suggestion.mutualFriends} mutual friends</span>
                          )}
                        </div>
                      </div>
                      <div className="suggestion-actions">
                        <button
                          className="add-friend-btn"
                          onClick={() => handleAddFriend(suggestion.id)}
                        >
                          <User size={16} />
                          Add Friend
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {friendsActiveTab === 'search' && (
              <div className="search-users">
                <div className="search-header">
                  <h3>Find Gamers & Developers</h3>
                  <p>Search for users by username, name, or interests</p>
                </div>

                <div className="search-input-container">
                  <Search size={20} />
                  <input
                    type="text"
                    placeholder="Search users... (try 'alice', 'developer', 'indie')"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  {isSearching && <div className="search-spinner">⏳</div>}
                </div>

                <div className="search-results">
                  {userSearchQuery.trim() === '' ? (
                    <div className="search-empty">
                      <Search size={48} />
                      <h3>Search for Users</h3>
                      <p>Enter a username, name, or keyword to find other gamers and developers</p>
                      <div className="search-tips">
                        <h4>Search Tips:</h4>
                        <ul>
                          <li>Try searching for "alice" or "bob"</li>
                          <li>Search by role: "developer", "publisher"</li>
                          <li>Look for interests: "indie", "bitcoin", "games"</li>
                        </ul>
                      </div>
                    </div>
                  ) : userSearchResults.length === 0 && !isSearching ? (
                    <div className="search-empty">
                      <Search size={48} />
                      <h3>No Users Found</h3>
                      <p>No users match your search for "{userSearchQuery}"</p>
                      <p>Try different keywords or check the spelling</p>
                    </div>
                  ) : (
                    <div className="search-results-list">
                      {userSearchResults.map(user => (
                        <div key={user.id} className="search-result-card">
                          <div className="result-avatar">
                            <img src={user.avatar_url} alt={user.display_name} />
                          </div>
                          <div className="result-info">
                            <div className="result-name">
                              <h4>{user.display_name}</h4>
                              <span className="username">@{user.username}</span>
                              <span className={`role-badge ${user.role}`}>{user.role}</span>
                            </div>
                            <div className="result-details">
                              <span className="level">Level {user.profile_level}</span>
                              <span className="location">{user.location}</span>
                            </div>
                            <p className="result-bio">{user.bio}</p>
                          </div>
                          <div className="result-actions">
                            <button
                              className="add-friend-btn"
                              onClick={() => handleAddFriend(user.id)}
                            >
                              <User size={16} />
                              Add Friend
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderSettingsView = () => {
    if (!user) {
      return (
        <section className="view active">
          <div className="container-block">
            <div className="login-required">
              <Settings size={64} />
              <h2>Sign In Required</h2>
              <p>You need to sign in to access settings</p>
              <button
                className="auth-submit"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In to Continue
              </button>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="view active">
        <div className="container-block">
          <div className="settings-header">
            <h2>Settings</h2>
            <p>Customize your gaming and development experience</p>
          </div>

          <div className="settings-sections">
            <div className="settings-section">
              <h3>Account & Profile</h3>
              <div className="settings-group">
                <div className="setting-item">
                  <label>Display Name</label>
                  <input type="text" value={user.displayName} readOnly />
                </div>
                <div className="setting-item">
                  <label>Username</label>
                  <input type="text" value={user.username} readOnly />
                </div>
                <div className="setting-item">
                  <label>Email</label>
                  <input type="email" value={user.email} readOnly />
                </div>
                <div className="setting-item">
                  <label>Account Type</label>
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3>Privacy & Social</h3>
              <div className="settings-group">
                <div className="setting-item checkbox">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Show online status to friends
                  </label>
                </div>
                <div className="setting-item checkbox">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Show game activity to friends
                  </label>
                </div>
                <div className="setting-item checkbox">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Allow friend requests from anyone
                  </label>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3>Notifications</h3>
              <div className="settings-group">
                <div className="setting-item checkbox">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Email notifications for game updates
                  </label>
                </div>
                <div className="setting-item checkbox">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Friend activity notifications
                  </label>
                </div>
                <div className="setting-item checkbox">
                  <label>
                    <input type="checkbox" />
                    Promotional emails
                  </label>
                </div>
              </div>
            </div>

            {user.role === 'developer' && (
              <div className="settings-section developer-section">
                <h3>Developer Settings</h3>
                <div className="settings-group">
                  <div className="setting-item">
                    <label>Bitcoin Payout Address</label>
                    <input type="text" placeholder="Enter your Bitcoin address for revenue payouts" />
                    <small>Revenue share: 85% (15% platform fee)</small>
                  </div>
                  <div className="setting-item">
                    <label>Lightning Address</label>
                    <input type="text" placeholder="your@lightning.address" />
                    <small>For instant micropayments and tips</small>
                  </div>
                  <div className="setting-item">
                    <label>Developer Status</label>
                    <span className="verified-badge">✓ Verified Developer</span>
                    <small>$100 verification fee paid</small>
                  </div>
                </div>

                <div className="developer-resources">
                  <h4>Developer Resources</h4>
                  <div className="resource-links">
                    <a href="#" className="resource-link">
                      📊 Analytics Dashboard
                    </a>
                    <a href="#" className="resource-link">
                      💰 Revenue Reports
                    </a>
                    <a href="#" className="resource-link">
                      🔑 Game Key Management
                    </a>
                    <a href="#" className="resource-link">
                      📈 Marketing Tools
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="settings-section">
              <h3>Preferences</h3>
              <div className="settings-group">
                <div className="setting-item">
                  <label>Language</label>
                  <select defaultValue="en">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Currency</label>
                  <select defaultValue="usd">
                    <option value="usd">USD ($)</option>
                    <option value="btc">Bitcoin (₿)</option>
                    <option value="sats">Satoshis (sats)</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => toggleTheme(e.target.value)}
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Developer Section */}
          <div className="settings-section">
            <h3>🎮 Developer Options</h3>
            <div className="developer-info">
              <div className="developer-benefits">
                <h4>💰 Earn Bitcoin from Your Games</h4>
                <ul>
                  <li>⚡ <strong>Instant Bitcoin payouts</strong> - No 30-60 day delays</li>
                  <li>💎 <strong>70% revenue share</strong> - Keep more of your earnings</li>
                  <li>🌍 <strong>Global reach</strong> - Sell to anyone with Bitcoin</li>
                  <li>💸 <strong>Lower fees</strong> - $20 vs Steam's $100</li>
                </ul>
              </div>

              {user?.account_type === 'developer' || user?.accountType === 'developer' ? (
                <div className="developer-status">
                  <p>✅ <strong>Developer Account Active</strong></p>
                  <div className="developer-actions">
                    <button
                      className="btn-primary"
                      onClick={() => setShowGamePublishing(true)}
                    >
                      <Plus size={16} />
                      Publish New Game
                    </button>
                    <button className="btn-secondary">
                      Manage Games
                    </button>
                    <button className="btn-secondary">
                      View Analytics
                    </button>
                  </div>
                </div>
              ) : (
                <div className="developer-apply">
                  <p>Ready to start earning Bitcoin from your games?</p>
                  <button
                    className="btn-primary developer-apply-btn"
                    onClick={() => setShowDeveloperOnboarding(true)}
                  >
                    <Bitcoin size={16} />
                    Apply to Become a Developer
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="settings-actions">
            <button className="save-btn">Save Changes</button>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </section>
    );
  };

  const renderCurrentView = () => {
    switch (activeView) {
      case 'store': return renderStoreView();
      case 'library': return renderLibraryView();
      case 'downloads': return renderDownloadsView();
      case 'community': return renderCommunityView();
      case 'friends': return renderFriendsView();
      case 'settings': return renderSettingsView();
      default: return renderStoreView();
    }
  };

  const navItems = [
    { id: 'store', label: 'Store', icon: Store },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'friends', label: 'Friends', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div>
      {/* Top Navigation Bar */}
      <header className="topbar glass">
        <div className="logo">
          <Bitcoin size={20} />
          GameMarketplace
        </div>
        <nav className="mainnav">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`navbtn ${activeView === item.id ? 'active' : ''}`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="actions">
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              className="search"
              placeholder="Search games, DLCs, creators"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="iconbtn">
            <Heart size={16} />
            <span className="badge">0</span>
          </button>
          <button className="iconbtn">
            <ShoppingCart size={16} />
            <span className="badge">0</span>
          </button>
          <button className="iconbtn">
            <Bell size={16} />
          </button>
          <div className="header-actions">
            <button
              className="theme-toggle"
              onClick={() => toggleTheme()}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>



            {user ? (
              <div className="user-menu">
                <div className="user-info">
                  <div className="user-avatar">
                    <User size={20} />
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user.displayName}</span>
                    <span className="user-level">Level {user.profileLevel}</span>
                  </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button className="iconbtn auth-btn" onClick={() => setShowAuthModal(true)}>
                <User size={16} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app">
        {renderCurrentView()}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AuthModal onAuth={handleAuth} onClose={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}

      {/* Developer Onboarding Modal */}
      {showDeveloperOnboarding && (
        <div className="modal-overlay" onClick={() => setShowDeveloperOnboarding(false)}>
          <div className="modal-content developer-modal" onClick={(e) => e.stopPropagation()}>
            <DeveloperOnboarding
              onComplete={handleDeveloperOnboardingComplete}
              onCancel={() => setShowDeveloperOnboarding(false)}
            />
          </div>
        </div>
      )}

      {/* Game Publishing Modal */}
      {showGamePublishing && (
        <div className="modal-overlay" onClick={() => setShowGamePublishing(false)}>
          <div className="modal-content game-publishing-modal" onClick={(e) => e.stopPropagation()}>
            <GamePublishingForm
              onSubmit={handleGamePublishingSubmit}
              onCancel={() => setShowGamePublishing(false)}
              user={user}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Auth Modal Component with Steam-like flow
const AuthModal: React.FC<{ onAuth: any; onClose: () => void }> = ({ onAuth, onClose }) => {
  const [currentStep, setCurrentStep] = useState<'login' | 'register' | 'developer-setup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
    accountType: 'player',
    // Developer fields
    companyName: '',
    companyWebsite: '',
    businessAddress: '',
    taxId: '',
    bitcoinAddress: '',
    agreeToTerms: false,
    agreeToFee: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (currentStep === 'register' && formData.accountType === 'developer') {
      // Move to developer setup step
      setCurrentStep('developer-setup');
      setLoading(false);
      return;
    }

    const result = await onAuth(formData, currentStep === 'login');

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleDeveloperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeToTerms || !formData.agreeToFee) {
      setError('You must agree to the terms and developer fee');
      return;
    }

    setLoading(true);
    setError('');

    const result = await onAuth(formData, false);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="demo-hint">
        <p><strong>Demo Login:</strong></p>
        <p>Email: demo@gamer.com</p>
        <p>Password: password</p>
      </div>

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
      />

      {error && <div className="auth-error">{error}</div>}

      <button type="submit" disabled={loading} className="auth-submit">
        {loading ? 'Signing In...' : 'Sign In'}
      </button>

      <button type="button" onClick={() => setCurrentStep('register')} className="auth-switch">
        Need an account? Sign up
      </button>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleSubmit} className="auth-form">
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => setFormData({...formData, username: e.target.value})}
        required
      />

      <input
        type="text"
        placeholder="Display Name"
        value={formData.displayName}
        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />

      <input
        type="password"
        placeholder="Password (min 8 characters)"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
        minLength={8}
      />

      <div className="account-type-selection">
        <h4>Account Type</h4>
        <div className="account-types">
          <label className={`account-type ${formData.accountType === 'player' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="accountType"
              value="player"
              checked={formData.accountType === 'player'}
              onChange={(e) => setFormData({...formData, accountType: e.target.value})}
            />
            <div className="account-type-content">
              <User size={24} />
              <div>
                <strong>Player Account</strong>
                <p>Buy and play games, join communities</p>
              </div>
            </div>
          </label>

          <label className={`account-type ${formData.accountType === 'developer' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="accountType"
              value="developer"
              checked={formData.accountType === 'developer'}
              onChange={(e) => setFormData({...formData, accountType: e.target.value})}
            />
            <div className="account-type-content">
              <Settings size={24} />
              <div>
                <strong>Developer Account</strong>
                <p>Publish games, access developer tools</p>
                <small>Requires $100 verification fee (in Bitcoin)</small>
              </div>
            </div>
          </label>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <button type="submit" disabled={loading} className="auth-submit">
        {loading ? 'Creating Account...' : 'Continue'}
      </button>

      <button type="button" onClick={() => setCurrentStep('login')} className="auth-switch">
        Have an account? Sign in
      </button>
    </form>
  );

  const renderDeveloperSetup = () => (
    <form onSubmit={handleDeveloperSubmit} className="auth-form developer-setup">
      <div className="setup-header">
        <h3>Developer Account Setup</h3>
        <p>Complete your developer verification to publish games</p>
      </div>

      <div className="form-section">
        <h4>Company Information</h4>
        <input
          type="text"
          placeholder="Company/Studio Name"
          value={formData.companyName}
          onChange={(e) => setFormData({...formData, companyName: e.target.value})}
          required
        />

        <input
          type="url"
          placeholder="Company Website (optional)"
          value={formData.companyWebsite}
          onChange={(e) => setFormData({...formData, companyWebsite: e.target.value})}
        />

        <textarea
          placeholder="Business Address"
          value={formData.businessAddress}
          onChange={(e) => setFormData({...formData, businessAddress: e.target.value})}
          required
          rows={3}
        />

        <input
          type="text"
          placeholder="Tax ID / Business Registration (optional)"
          value={formData.taxId}
          onChange={(e) => setFormData({...formData, taxId: e.target.value})}
        />
      </div>

      <div className="form-section">
        <h4>Bitcoin Payout Address</h4>
        <input
          type="text"
          placeholder="Bitcoin Address for Revenue Payouts"
          value={formData.bitcoinAddress}
          onChange={(e) => setFormData({...formData, bitcoinAddress: e.target.value})}
          required
        />
        <small>This is where you'll receive your revenue share (85% after platform fee)</small>
      </div>

      <div className="form-section">
        <h4>Developer Agreement</h4>
        <div className="fee-info">
          <div className="fee-box">
            <Bitcoin size={32} />
            <div>
              <strong>$100 USD Developer Fee</strong>
              <p>One-time verification fee (equivalent in Bitcoin)</p>
              <small>This fee helps prevent spam and ensures quality developers</small>
            </div>
          </div>
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
            required
          />
          I agree to the Developer Terms of Service and Revenue Sharing Agreement
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.agreeToFee}
            onChange={(e) => setFormData({...formData, agreeToFee: e.target.checked})}
            required
          />
          I understand and agree to pay the $100 USD developer verification fee
        </label>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <button type="submit" disabled={loading || !formData.agreeToTerms || !formData.agreeToFee} className="auth-submit developer-submit">
        {loading ? 'Creating Developer Account...' : 'Create Developer Account & Pay Fee'}
      </button>

      <button type="button" onClick={() => setCurrentStep('register')} className="auth-switch">
        Back to Account Type
      </button>
    </form>
  );

  const getModalTitle = () => {
    switch (currentStep) {
      case 'login': return 'Sign In to GameMarketplace';
      case 'register': return 'Create Your Account';
      case 'developer-setup': return 'Developer Account Setup';
      default: return 'Authentication';
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-header">
        <h2>{getModalTitle()}</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {currentStep === 'login' && renderLoginForm()}
      {currentStep === 'register' && renderRegisterForm()}
      {currentStep === 'developer-setup' && renderDeveloperSetup()}
    </div>
  );
};

export default App;
