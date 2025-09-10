
import React from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (quality: 'Normal' | 'High' | 'Ultra High') => void;
  videoUrl: string | null;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onDownload, videoUrl }) => {
  if (!isOpen || !videoUrl) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div 
        className="bg-[var(--bg-panel)] rounded-lg shadow-2xl p-8 w-full max-w-md border border-[var(--border-glow)] shadow-[0_0_30px_var(--accent-magenta)] relative" 
        onClick={(e) => e.stopPropagation()}
      >
         <div className="absolute -inset-px bg-gradient-to-r from-[var(--accent-magenta)] to-[var(--accent-cyan)] rounded-lg blur-xl opacity-30 animate-pulse"></div>
         <div className="relative">
            <h2 className="text-3xl font-bold mb-6 text-white font-orbitron [text-shadow:0_0_10px_var(--accent-magenta)]">EXPORT VIDEO</h2>
            <p className="text-[var(--text-secondary)] mb-6">Select export quality. The video will be resized while maintaining aspect ratio.</p>
            
            <div className="space-y-4">
              <button
                onClick={() => onDownload('Normal')}
                className="w-full bg-black/30 hover:bg-[var(--accent-magenta)]/50 border border-[var(--border-glow)] text-white font-bold py-3 px-4 rounded-md transition duration-200 flex justify-between items-center group"
              >
                <span>Normal</span>
                <span className="text-sm text-[var(--text-secondary)] group-hover:text-white">Web Optimized (540p)</span>
              </button>
              <button
                onClick={() => onDownload('High')}
                className="w-full bg-black/30 hover:bg-[var(--accent-magenta)]/50 border border-[var(--border-glow)] text-white font-bold py-3 px-4 rounded-md transition duration-200 flex justify-between items-center group"
              >
                <span>High</span>
                <span className="text-sm text-[var(--text-secondary)] group-hover:text-white">High Resolution (720p)</span>
              </button>
              <button
                onClick={() => onDownload('Ultra High')}
                className="w-full bg-black/30 hover:bg-[var(--accent-magenta)]/50 border border-[var(--border-glow)] text-white font-bold py-3 px-4 rounded-md transition duration-200 flex justify-between items-center group"
              >
                <span>Ultra High</span>
                <span className="text-sm text-[var(--text-secondary)] group-hover:text-white">Professional Use (1080p)</span>
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="mt-8 w-full bg-black/20 hover:bg-white/10 border border-[var(--border-glow)] text-white font-bold py-2 px-4 rounded-md transition duration-200"
            >
              Cancel
            </button>
         </div>
      </div>
    </div>
  );
};

export default ExportModal;
