import React from 'react';
import { motion } from 'framer-motion';
import { Play, Download, Settings, Clock, Calendar } from 'lucide-react';

const mockLibraryGames = [
  {
    id: '1',
    title: 'Bitcoin Miner Simulator',
    developer: 'Satoshi Studios',
    header_image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
    installed: true,
    hours_played: 42,
    last_played: '2024-01-15',
    install_size: '4.2 GB',
    status: 'Ready to Play'
  },
  {
    id: '2',
    title: 'Lightning Network Adventure',
    developer: 'Channel Games',
    header_image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800',
    installed: false,
    hours_played: 0,
    last_played: null,
    install_size: '2.8 GB',
    status: 'Not Installed'
  },
  {
    id: '3',
    title: 'Crypto Trading Tycoon',
    developer: 'Blockchain Studios',
    header_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    installed: true,
    hours_played: 128,
    last_played: '2024-01-14',
    install_size: '6.1 GB',
    status: 'Update Available'
  }
];

export const LibraryView: React.FC = () => {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = React.useState<'all' | 'installed' | 'ready'>('all');

  const filteredGames = mockLibraryGames.filter(game => {
    if (filter === 'installed') return game.installed;
    if (filter === 'ready') return game.installed && game.status === 'Ready to Play';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Library Header */}
      <div className="p-6 bg-gradient-to-r from-success/10 to-primary/10 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Game Library</h1>
            <p className="text-text-secondary">Your collection of Bitcoin-purchased games</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-text-muted">
              <span className="font-medium text-text-primary">{filteredGames.length}</span> games
            </div>
          </div>
        </div>

        {/* Filters and View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {[
              { id: 'all', label: 'All Games' },
              { id: 'installed', label: 'Installed' },
              { id: 'ready', label: 'Ready to Play' }
            ].map((filterOption) => (
              <motion.button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id as any)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${filter === filterOption.id
                    ? 'bg-success text-white shadow-lg'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {filterOption.label}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}
            >
              <div className="w-4 h-4 flex flex-col space-y-1">
                <div className="h-0.5 bg-current rounded"></div>
                <div className="h-0.5 bg-current rounded"></div>
                <div className="h-0.5 bg-current rounded"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Games List */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-surface/60 backdrop-blur-sm rounded-xl overflow-hidden border border-border/50 hover:border-success/50 transition-all duration-300"
              >
                <div className="aspect-video bg-surface-hover overflow-hidden relative">
                  <img
                    src={game.header_image}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {game.status === 'Update Available' && (
                    <div className="absolute top-2 right-2 bg-warning text-white px-2 py-1 rounded text-xs font-bold">
                      Update
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{game.title}</h3>
                  <p className="text-text-secondary text-sm mb-3">{game.developer}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">Status:</span>
                      <span className={`font-medium ${
                        game.status === 'Ready to Play' ? 'text-success' :
                        game.status === 'Update Available' ? 'text-warning' :
                        'text-text-muted'
                      }`}>
                        {game.status}
                      </span>
                    </div>
                    {game.hours_played > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">Played:</span>
                        <span className="text-text-primary">{game.hours_played}h</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">Size:</span>
                      <span className="text-text-primary">{game.install_size}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {game.installed ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-success hover:bg-success/90 text-white py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>Play</span>
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Install</span>
                      </motion.button>
                    )}
                    <button className="w-full bg-surface-hover hover:bg-surface-active text-text-primary py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2">
                      <Settings className="w-3 h-3" />
                      <span>Manage</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center space-x-4 p-4 bg-surface/60 backdrop-blur-sm rounded-lg border border-border/50 hover:border-success/50 transition-all"
              >
                <img
                  src={game.header_image}
                  alt={game.title}
                  className="w-16 h-9 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{game.title}</h3>
                  <p className="text-sm text-text-secondary">{game.developer}</p>
                </div>
                <div className="flex items-center space-x-6 text-sm text-text-muted">
                  {game.hours_played > 0 && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{game.hours_played}h</span>
                    </div>
                  )}
                  {game.last_played && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{game.last_played}</span>
                    </div>
                  )}
                  <span className={`font-medium ${
                    game.status === 'Ready to Play' ? 'text-success' :
                    game.status === 'Update Available' ? 'text-warning' :
                    'text-text-muted'
                  }`}>
                    {game.status}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {game.installed ? (
                    <button className="bg-success hover:bg-success/90 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2">
                      <Play className="w-4 h-4" />
                      <span>Play</span>
                    </button>
                  ) : (
                    <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Install</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
