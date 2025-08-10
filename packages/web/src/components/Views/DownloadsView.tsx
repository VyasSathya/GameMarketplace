import React from 'react';
import { motion } from 'framer-motion';
import { Pause, Play, X, Download, HardDrive } from 'lucide-react';

const mockDownloads = [
  {
    id: '1',
    title: 'Bitcoin Miner Simulator',
    developer: 'Satoshi Studios',
    header_image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
    progress: 75,
    speed: 12.5,
    downloaded: '3.2 GB',
    total: '4.2 GB',
    status: 'downloading',
    eta: '2 minutes'
  },
  {
    id: '2',
    title: 'Lightning Network Adventure',
    developer: 'Channel Games',
    header_image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800',
    progress: 100,
    speed: 0,
    downloaded: '2.8 GB',
    total: '2.8 GB',
    status: 'completed',
    eta: 'Complete'
  },
  {
    id: '3',
    title: 'Crypto Trading Tycoon',
    developer: 'Blockchain Studios',
    header_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    progress: 45,
    speed: 0,
    downloaded: '2.7 GB',
    total: '6.1 GB',
    status: 'paused',
    eta: 'Paused'
  }
];

export const DownloadsView: React.FC = () => {
  const [downloads, setDownloads] = React.useState(mockDownloads);

  const handlePause = (id: string) => {
    setDownloads(prev => prev.map(download => 
      download.id === id 
        ? { ...download, status: 'paused', speed: 0, eta: 'Paused' }
        : download
    ));
  };

  const handleResume = (id: string) => {
    setDownloads(prev => prev.map(download => 
      download.id === id 
        ? { ...download, status: 'downloading', speed: 12.5, eta: '5 minutes' }
        : download
    ));
  };

  const handleCancel = (id: string) => {
    setDownloads(prev => prev.filter(download => download.id !== id));
  };

  const activeDownloads = downloads.filter(d => d.status === 'downloading');
  const totalSpeed = activeDownloads.reduce((sum, d) => sum + d.speed, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Downloads Header */}
      <div className="p-6 bg-gradient-to-r from-warning/10 to-primary/10 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Downloads</h1>
            <p className="text-text-secondary">Manage your game downloads and installations</p>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 text-warning" />
              <span className="text-text-muted">Speed:</span>
              <span className="font-medium text-text-primary">{totalSpeed.toFixed(1)} MB/s</span>
            </div>
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-info" />
              <span className="text-text-muted">Free Space:</span>
              <span className="font-medium text-text-primary">245 GB</span>
            </div>
          </div>
        </div>

        {/* Download Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface/50 rounded-lg p-3">
            <div className="text-sm text-text-muted mb-1">Active Downloads</div>
            <div className="text-xl font-bold text-warning">{activeDownloads.length}</div>
          </div>
          <div className="bg-surface/50 rounded-lg p-3">
            <div className="text-sm text-text-muted mb-1">Completed</div>
            <div className="text-xl font-bold text-success">
              {downloads.filter(d => d.status === 'completed').length}
            </div>
          </div>
          <div className="bg-surface/50 rounded-lg p-3">
            <div className="text-sm text-text-muted mb-1">Total Size</div>
            <div className="text-xl font-bold text-info">
              {downloads.reduce((sum, d) => sum + parseFloat(d.total), 0).toFixed(1)} GB
            </div>
          </div>
        </div>
      </div>

      {/* Downloads List */}
      <div className="flex-1 overflow-y-auto p-6">
        {downloads.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Download className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Downloads</h3>
              <p className="text-text-secondary">Your downloads will appear here</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {downloads.map((download, index) => (
              <motion.div
                key={download.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface/60 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Game Image */}
                    <img
                      src={download.header_image}
                      alt={download.title}
                      className="w-20 h-11 object-cover rounded"
                    />

                    {/* Game Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{download.title}</h3>
                      <p className="text-text-secondary text-sm">{download.developer}</p>
                    </div>

                    {/* Download Stats */}
                    <div className="text-right text-sm">
                      <div className="text-text-primary font-medium">
                        {download.downloaded} / {download.total}
                      </div>
                      <div className="text-text-muted">
                        {download.status === 'downloading' && `${download.speed} MB/s`}
                        {download.status === 'completed' && 'Complete'}
                        {download.status === 'paused' && 'Paused'}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center space-x-2">
                      {download.status === 'downloading' && (
                        <button
                          onClick={() => handlePause(download.id)}
                          className="p-2 bg-warning/20 hover:bg-warning/30 text-warning rounded-lg transition-colors"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      {download.status === 'paused' && (
                        <button
                          onClick={() => handleResume(download.id)}
                          className="p-2 bg-success/20 hover:bg-success/30 text-success rounded-lg transition-colors"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {download.status !== 'completed' && (
                        <button
                          onClick={() => handleCancel(download.id)}
                          className="p-2 bg-error/20 hover:bg-error/30 text-error rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-text-muted">Progress</span>
                      <span className="text-text-primary font-medium">
                        {download.progress}% • {download.eta}
                      </span>
                    </div>
                    <div className="w-full bg-surface-hover rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${
                          download.status === 'completed' ? 'bg-success' :
                          download.status === 'downloading' ? 'bg-primary' :
                          'bg-warning'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${download.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
