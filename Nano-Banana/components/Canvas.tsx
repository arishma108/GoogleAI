import React, { useState, useRef, useEffect } from 'react';
import { AspectRatio } from '../types';
import { UndoIcon, RedoIcon, DownloadIcon, SpinnerIcon } from './icons/Icons';

interface CanvasProps {
  imageSrc: string | null;
  aspectRatio: AspectRatio;
  onRefine: (prompt: string) => void;
  isLoading: boolean;
  loadingMessage: string;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onDownloadRequest: (src: string) => void;
}

const aspectRatioValues: Record<AspectRatio, number> = {
  '9:16': 9 / 16,
  '1:1': 1,
  '16:9': 16 / 9,
  '3:4': 3 / 4,
  '4:3': 4 / 3,
};

export const Canvas: React.FC<CanvasProps> = ({
  imageSrc,
  aspectRatio,
  onRefine,
  isLoading,
  loadingMessage,
  onUndo, onRedo, canUndo, canRedo, onDownloadRequest
}) => {
  const [refinePrompt, setRefinePrompt] = useState('');
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastPanPoint = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Reset zoom/pan when image changes
    setTransform({ scale: 1, x: 0, y: 0 });
  }, [imageSrc]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    setTransform(prev => {
      const newScale = Math.max(0.5, Math.min(5, prev.scale + scaleAmount));
      return { ...prev, scale: newScale };
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isPanning.current = true;
    lastPanPoint.current = { x: e.clientX, y: e.clientY };
    canvasRef.current?.style.setProperty('cursor', 'grabbing');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPanPoint.current.x;
    const dy = e.clientY - lastPanPoint.current.y;
    setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    lastPanPoint.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isPanning.current = false;
    canvasRef.current?.style.setProperty('cursor', 'grab');
  };
  
  const handleRefineSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(refinePrompt.trim()) {
          onRefine(refinePrompt);
          setRefinePrompt('');
      }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      <div className="absolute top-2 left-2 z-10 flex space-x-2">
        <button onClick={onUndo} disabled={!canUndo} className="p-2 bg-gray-900/50 rounded-md disabled:opacity-50 hover:bg-green-500/50 transition-colors"><UndoIcon /></button>
        <button onClick={onRedo} disabled={!canRedo} className="p-2 bg-gray-900/50 rounded-md disabled:opacity-50 hover:bg-green-500/50 transition-colors"><RedoIcon /></button>
      </div>
       {imageSrc && <button onClick={() => onDownloadRequest(imageSrc)} className="absolute top-2 right-2 z-10 p-2 bg-gray-900/50 rounded-md hover:bg-yellow-500/50 transition-colors"><DownloadIcon /></button>}

      <div
        ref={canvasRef}
        className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab"
        style={{ aspectRatio: aspectRatio.replace(':', ' / ') }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-black/70 z-20 flex flex-col items-center justify-center text-center">
            <SpinnerIcon size="lg" />
            <p className="mt-4 font-orbitron text-yellow-400">{loadingMessage}</p>
          </div>
        )}
        {!imageSrc && !isLoading && (
            <div className="text-center text-gray-500">
                <p className="font-orbitron text-lg">Your Creations Appear Here</p>
                <p>Upload a product to get started.</p>
            </div>
        )}
        {imageSrc && (
          <img
            src={imageSrc}
            alt="Generated Design"
            className="max-w-full max-h-full object-contain transition-transform duration-100 ease-linear"
            style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: 'center' }}
            draggable="false"
          />
        )}
      </div>

      {imageSrc && <form onSubmit={handleRefineSubmit} className="w-full mt-4 flex space-x-2">
        <input
          type="text"
          value={refinePrompt}
          onChange={(e) => setRefinePrompt(e.target.value)}
          placeholder="Refine your design... e.g., 'make the background darker'"
          className="flex-grow bg-gray-900/50 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !refinePrompt} className="bg-yellow-500 text-gray-900 font-bold px-4 rounded-md hover:bg-yellow-400 disabled:bg-gray-500 transition-colors">REFINE</button>
      </form>}
    </div>
  );
};
