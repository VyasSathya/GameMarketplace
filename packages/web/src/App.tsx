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
  Zap
} from 'lucide-react';

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

  const handleAuth = async (credentials: any, isLogin: boolean) => {
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Authentication failed');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.session.access_token);
      setUser({ ...data.user, token: data.session.access_token });
      setShowAuthModal(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Authentication failed' };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = '/api/games';
        const params = new URLSearchParams();

        if (searchQuery) params.append('search', searchQuery);
        if (activeStoreTab !== 'featured') {
          if (activeStoreTab === 'new') params.append('sortBy', 'release_date');
          if (activeStoreTab === 'topsellers') params.append('sortBy', 'positive_reviews');
          if (activeStoreTab === 'specials') params.append('discount', 'true');
        }

        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch games');

        const data = await response.json();
        setGames(data.games || []);
      } catch (err) {
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

  const renderLibraryView = () => (
    <section className="view active">
      <div className="container-block">
        <h2>Game Library</h2>
        <p>Your Bitcoin-purchased games will appear here</p>
      </div>
    </section>
  );

  const renderDownloadsView = () => (
    <section className="view active">
      <div className="container-block">
        <h2>Downloads</h2>
        <p>Manage your game downloads</p>
      </div>
    </section>
  );

  const renderCommunityView = () => (
    <section className="view active">
      <div className="container-block">
        <h2>Community</h2>
        <p>Connect with other Bitcoin gamers</p>
      </div>
    </section>
  );

  const renderFriendsView = () => (
    <section className="view active">
      <div className="container-block">
        <h2>Friends</h2>
        <p>Chat and play with friends</p>
      </div>
    </section>
  );

  const renderSettingsView = () => (
    <section className="view active">
      <div className="container-block">
        <h2>Settings</h2>
        <p>Customize your gaming experience</p>
      </div>
    </section>
  );

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
          {user ? (
            <div className="user-menu">
              <button className="iconbtn user-btn">
                <User size={16} />
                <span>{user.username || user.displayName}</span>
              </button>
              <div className="user-dropdown">
                <button onClick={handleLogout}>Sign Out</button>
              </div>
            </div>
          ) : (
            <button className="iconbtn auth-btn" onClick={() => setShowAuthModal(true)}>
              <User size={16} />
              <span>Sign In</span>
            </button>
          )}
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
    </div>
  );
};

// Simple Auth Modal Component
const AuthModal: React.FC<{ onAuth: any; onClose: () => void }> = ({ onAuth, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await onAuth(formData, isLogin);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-modal">
      <div className="auth-header">
        <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <>
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
          </>
        )}

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
          {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>

        <button type="button" onClick={() => setIsLogin(!isLogin)} className="auth-switch">
          {isLogin ? 'Need an account? Sign up' : 'Have an account? Sign in'}
        </button>
      </form>
    </div>
  );
};

export default App;
