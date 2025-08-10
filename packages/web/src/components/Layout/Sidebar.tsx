import React from 'react';
import { motion } from 'framer-motion';
import { 
  Store, 
  Library, 
  Download, 
  Users, 
  MessageCircle, 
  Settings,
  Zap,
  Bitcoin
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  width: number;
  onResize: (width: number) => void;
}

const sidebarItems = [
  { id: 'store', label: 'Store', icon: Store, color: 'text-primary' },
  { id: 'library', label: 'Library', icon: Library, color: 'text-success' },
  { id: 'downloads', label: 'Downloads', icon: Download, color: 'text-warning' },
  { id: 'community', label: 'Community', icon: Users, color: 'text-info' },
  { id: 'friends', label: 'Friends', icon: MessageCircle, color: 'text-lightning' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'text-text-muted' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  width,
  onResize
}) => {
  const [isResizing, setIsResizing] = React.useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = Math.max(200, Math.min(400, e.clientX));
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onResize]);

  return (
    <div 
      className="relative bg-surface/60 backdrop-blur-xl border-r border-border/50 flex flex-col"
      style={{ width }}
    >
      {/* Sidebar Content */}
      <div className="flex-1 p-4">
        {/* Bitcoin Balance */}
        <div className="mb-6 p-3 bg-gradient-to-r from-bitcoin/10 to-lightning/10 rounded-xl border border-bitcoin/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-secondary">Balance</span>
            <div className="flex items-center space-x-1">
              <Bitcoin className="w-3 h-3 text-bitcoin" />
              <Zap className="w-3 h-3 text-lightning" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-bitcoin">0.00045000 BTC</div>
            <div className="text-xs text-text-muted">45,000 sats • $20.25</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all
                  ${isActive 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'hover:bg-surface-hover text-text-secondary hover:text-text-primary'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : item.color}`} />
                <span className="font-medium">{item.label}</span>
                {item.id === 'downloads' && (
                  <div className="ml-auto w-2 h-2 bg-warning rounded-full animate-pulse" />
                )}
                {item.id === 'friends' && (
                  <div className="ml-auto text-xs bg-success/20 text-success px-1.5 py-0.5 rounded-full">
                    3
                  </div>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Status Bar */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Online</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span>Connected</span>
          </div>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 transition-colors"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};
