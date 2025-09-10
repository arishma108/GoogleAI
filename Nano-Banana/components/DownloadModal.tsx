import React from 'react';
import { DownloadQuality } from '../types';
import { downloadImage } from '../utils/imageUtils';

interface DownloadModalProps {
  base64Url: string;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ base64Url, onClose }) => {
  const qualityOptions: { name: DownloadQuality; desc: string }[] = [
    { name: 'Normal', desc: 'Web use (max 1024px)' },
    { name: 'High', desc: 'Displays & small prints (max 2048px)' },
    { name: 'Ultra High', desc: 'Large prints & pro use (max 4096px)' },
  ];

  const handleDownload = (quality: DownloadQuality) => {
    downloadImage(base64Url, quality);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 border border-green-500/30 rounded-lg shadow-2xl shadow-green-900/50 p-8 w-full max-w-md text-center transform transition-all animate-fade-in-up">
        <h2 className="text-2xl font-bold font-orbitron text-green-400 mb-4">Choose Download Quality</h2>
        <p className="text-gray-400 mb-6">Select a resolution for your export. The aspect ratio will be maintained.</p>
        <div className="space-y-4">
          {qualityOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => handleDownload(option.name)}
              className="w-full text-left p-4 bg-gray-700 rounded-lg hover:bg-green-600 hover:scale-105 transform transition-all group"
            >
              <p className="font-bold text-lg text-green-300 group-hover:text-white">{option.name}</p>
              <p className="text-sm text-gray-300 group-hover:text-gray-100">{option.desc}</p>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-8 text-yellow-400 hover:text-yellow-300">
          Cancel
        </button>
      </div>
    </div>
  );
};

// Add keyframes for animation in index.html or a style tag if needed
const keyframes = `
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out forwards;
}
`;
// You can inject this CSS dynamically or add it to your index.html style tag
if (typeof window !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = keyframes;
    document.head.appendChild(styleSheet);
}
