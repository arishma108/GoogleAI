
import React from 'react';
import { UploadedImage } from '../types';

interface TimelineProps {
  images: UploadedImage[];
  onImageSelect: (image: UploadedImage) => void;
  selectedImageId?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ images, onImageSelect, selectedImageId }) => {
  return (
    <div className="h-40 bg-[var(--bg-panel)] backdrop-blur-xl border-t border-[var(--accent-cyan)]/30 p-4 flex items-center space-x-4 overflow-x-auto shadow-[0_0_20px_rgba(0,255,255,0.1)]">
      {images.length === 0 && (
        <div className="w-full text-center text-[var(--text-secondary)] font-orbitron tracking-widest">
          YOUR UPLOADED IMAGES WILL APPEAR HERE
        </div>
      )}
      {images.map((image, index) => (
        <div
          key={image.id}
          onClick={() => onImageSelect(image)}
          className={`relative flex-shrink-0 w-32 h-24 bg-black rounded-md cursor-pointer overflow-hidden transition-all duration-200 group ${selectedImageId === image.id ? 'ring-4 ring-[var(--accent-lime)] shadow-[0_0_20px_var(--accent-lime)]' : 'ring-2 ring-transparent hover:ring-[var(--accent-cyan)]'}`}
        >
          <img
            src={image.processedSrc || image.originalSrc}
            alt={image.originalName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center p-1 truncate font-semibold font-orbitron">
            SCENE {index + 1}
          </div>
          {image.processedSrc && (
              <div className="absolute top-1 right-1 bg-[var(--accent-lime)] text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-[0_0_8px_var(--accent-lime)]" title="Background Removed">
                ✓
              </div>
          )}
        </div>
      ))}
    </div>
  );
};
