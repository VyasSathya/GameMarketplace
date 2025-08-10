import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WindowChrome } from './WindowChrome';
import { Sidebar } from './Sidebar';
import { StoreView } from '../Views/StoreView';
import { LibraryView } from '../Views/LibraryView';
import { DownloadsView } from '../Views/DownloadsView';

// Placeholder components for other views
const CommunityView = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2">Community</h2>
      <p className="text-text-secondary">Connect with other Bitcoin gamers</p>
    </div>
  </div>
);

const FriendsView = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2">Friends</h2>
      <p className="text-text-secondary">Chat and play with friends</p>
    </div>
  </div>
);

const SettingsView = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2">Settings</h2>
      <p className="text-text-secondary">Customize your gaming experience</p>
    </div>
  </div>
);

export const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('store');
  const [sidebarWidth, setSidebarWidth] = useState(280);

  const renderView = () => {
    switch (activeTab) {
      case 'store':
        return <StoreView />;
      case 'library':
        return <LibraryView />;
      case 'downloads':
        return <DownloadsView />;
      case 'community':
        return <CommunityView />;
      case 'friends':
        return <FriendsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <StoreView />;
    }
  };

  return (
    <div className="h-screen bg-background text-text-primary overflow-hidden flex flex-col">
      {/* Window Chrome */}
      <WindowChrome
        onMinimize={() => console.log('Minimize')}
        onMaximize={() => console.log('Maximize')}
        onClose={() => console.log('Close')}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          width={sidebarWidth}
          onResize={setSidebarWidth}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-surface/80 backdrop-blur-xl border-t border-border/50 flex items-center justify-between px-4 text-xs text-text-muted">
        <div className="flex items-center space-x-4">
          <span>GameMarketplace v1.0.0</span>
          <span>•</span>
          <span>Bitcoin Testnet</span>
          <span>•</span>
          <span>3 active downloads</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Network: 12.5 MB/s</span>
          <span>•</span>
          <span>Free: 245 GB</span>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span>Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};
