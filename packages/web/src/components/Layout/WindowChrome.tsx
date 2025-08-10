import React, { useState } from 'react';
import { Minus, Square, X, Search, User, LogIn } from 'lucide-react';
import { AuthModal } from '../Auth/AuthModal';

interface WindowChromeProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export const WindowChrome: React.FC<WindowChromeProps> = ({
  onMinimize,
  onMaximize,
  onClose
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleAuth = (userData: any) => {
    setUser(userData);
    setShowAuthModal(false);
  };
  return (
    <div className="flex items-center justify-between h-12 bg-surface/80 backdrop-blur-xl border-b border-border/50 px-4 select-none">
      {/* Left: App Title */}
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 bg-gradient-to-br from-bitcoin to-lightning rounded-md flex items-center justify-center">
          <span className="text-white text-xs font-bold">GM</span>
        </div>
        <span className="text-sm font-medium text-text-primary">GameMarketplace</span>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search games, friends, community..."
            className="w-full pl-10 pr-4 py-2 bg-surface/50 border border-border/50 rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Right: User & Window Controls */}
      <div className="flex items-center space-x-2">
        {/* User Profile */}
        {user ? (
          <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-surface-hover transition-colors">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-text-secondary">{user.username || user.displayName}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-surface-hover transition-colors text-primary"
          >
            <LogIn className="w-4 h-4" />
            <span className="text-sm font-medium">Sign In</span>
          </button>
        )}

        {/* Window Controls */}
        <div className="flex items-center ml-4">
          <button
            onClick={onMinimize}
            className="w-8 h-8 flex items-center justify-center hover:bg-surface-hover rounded transition-colors"
          >
            <Minus className="w-4 h-4 text-text-muted" />
          </button>
          <button
            onClick={onMaximize}
            className="w-8 h-8 flex items-center justify-center hover:bg-surface-hover rounded transition-colors"
          >
            <Square className="w-4 h-4 text-text-muted" />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-error/20 hover:text-error rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuth={handleAuth}
      />
    </div>
  );
};
