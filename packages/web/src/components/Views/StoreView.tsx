import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Download, Users, Zap, Bitcoin } from 'lucide-react';

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

export const StoreView: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('featured');

  const categories = [
    { id: 'featured', label: 'Featured', color: 'text-primary' },
    { id: 'new', label: 'New & Trending', color: 'text-success' },
    { id: 'top-sellers', label: 'Top Sellers', color: 'text-warning' },
    { id: 'specials', label: 'Special Offers', color: 'text-error' },
  ];

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games');
        if (!response.ok) throw new Error('Failed to fetch games');
        const data = await response.json();
        setGames(data.games);
      } catch (error) {
        console.error('Failed to load games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Store Header */}
      <div className="p-6 bg-gradient-to-r from-primary/10 to-lightning/10 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Game Store</h1>
            <p className="text-text-secondary">Discover amazing games, pay with Bitcoin</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-text-muted">
            <Bitcoin className="w-4 h-4 text-bitcoin" />
            <span>1 BTC = $45,000</span>
            <Zap className="w-4 h-4 text-lightning ml-4" />
            <span>Lightning Network</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-1">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${selectedCategory === category.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Games Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-surface/60 backdrop-blur-sm rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
            >
              {/* Game Image */}
              <div className="aspect-video bg-surface-hover overflow-hidden relative">
                <img
                  src={game.header_image}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {game.discount_percent > 0 && (
                  <div className="absolute top-2 left-2 bg-error text-white px-2 py-1 rounded text-xs font-bold">
                    -{game.discount_percent}%
                  </div>
                )}
              </div>

              {/* Game Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                  {game.title}
                </h3>
                <p className="text-text-secondary text-sm mb-2">{game.developer}</p>
                <p className="text-text-muted text-sm mb-3 line-clamp-2">
                  {game.short_description}
                </p>

                {/* Genres */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {game.genres.slice(0, 2).map((genre) => (
                    <span
                      key={genre}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Reviews */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-warning fill-current" />
                    <span className="text-sm font-medium">{game.review_score}</span>
                  </div>
                  <span className="text-xs text-text-muted">
                    ({(game.positive_reviews + game.negative_reviews).toLocaleString()} reviews)
                  </span>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-lg font-bold text-bitcoin">
                      ${game.price_usd}
                    </div>
                    <div className="text-xs text-text-muted">
                      {game.price_sats.toLocaleString()} sats
                    </div>
                  </div>
                  <div className="text-right text-xs text-text-muted">
                    <div>{game.price_btc.toFixed(8)} BTC</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-bitcoin to-lightning text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Buy with Bitcoin</span>
                  </motion.button>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-surface-hover hover:bg-surface-active text-text-primary py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1">
                      <Download className="w-3 h-3" />
                      <span>Demo</span>
                    </button>
                    <button className="flex-1 bg-surface-hover hover:bg-surface-active text-text-primary py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>Reviews</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
