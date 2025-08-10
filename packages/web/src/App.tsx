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
  X
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

  const renderLibraryView = () => {
    const [library, setLibrary] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
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
          setLoading(false);
        }
      };

      fetchLibrary();
    }, []);

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

          {loading ? (
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
    const [downloads, setDownloads] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      const fetchDownloads = async () => {
        try {
          const response = await fetch('/api/downloads');
          if (response.ok) {
            const data = await response.json();
            setDownloads(data.downloads || []);
          }
        } catch (error) {
          console.error('Failed to fetch downloads:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchDownloads();
    }, []);

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

          {loading ? (
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
