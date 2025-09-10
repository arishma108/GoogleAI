
import React, { useState, useRef, useEffect } from 'react';
import { UploadedImage, AspectRatio, VideoState } from '../types';
import { ZoomInIcon, ZoomOutIcon, ExpandIcon } from './icons';

interface CanvasProps {
  images: UploadedImage[];
  videoState: VideoState;
  aspectRatio: AspectRatio;
}

const getAspectRatioValue = (ratio: AspectRatio): number => {
  const [w, h] = ratio.split(':').map(Number);
  return w / h;
};

const FuturisticLoader = ({ message }: { message: string }) => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 p-4">
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-2 border-[var(--accent-cyan)]/30 rounded-full animate-[spin_8s_linear_infinite]"></div>
            <div className="absolute inset-2 border-2 border-[var(--accent-lime)]/30 rounded-full animate-[spin_6s_linear_infinite_reverse]"></div>
            <div className="absolute inset-4 border-2 border-[var(--accent-magenta)]/60 rounded-full animate-[spin_4s_linear_infinite]"></div>
            <div className="absolute inset-6 bg-[var(--accent-cyan)]/50 rounded-full animate-pulse"></div>
        </div>
        <p className="mt-6 text-[var(--accent-cyan)] font-semibold font-orbitron tracking-widest neon-glow-cyan animate-pulse">{message}</p>
    </div>
);


export const Canvas: React.FC<CanvasProps> = ({ images, videoState, aspectRatio }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastPanPoint = useRef({ x: 0, y: 0 });

  const resetView = () => {
      setZoom(1);
      setPan({x: 0, y: 0});
  };

  useEffect(resetView, [aspectRatio]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isPanning.current = true;
    lastPanPoint.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
  };

  const handleMouseUp = () => {
    isPanning.current = false;
     if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPanPoint.current.x;
    const dy = e.clientY - lastPanPoint.current.y;
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPanPoint.current = { x: e.clientX, y: e.clientY };
  };

  const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1.1;
      const newZoom = e.deltaY > 0 ? zoom / zoomFactor : zoom * zoomFactor;
      setZoom(Math.max(0.1, Math.min(newZoom, 5)));
  }

  return (
    <div 
        className="flex-grow bg-transparent flex items-center justify-center p-8 overflow-hidden relative" 
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        style={{ cursor: 'grab' }}
    >
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-20 flex space-x-2 bg-black/40 p-2 rounded-lg backdrop-blur-sm border border-white/10">
        <button onClick={() => setZoom(z => Math.min(z * 1.2, 5))} className="p-2 hover:bg-[var(--accent-cyan)] hover:text-black rounded-md transition-colors"><ZoomInIcon/></button>
        <button onClick={() => setZoom(z => Math.max(z / 1.2, 0.1))} className="p-2 hover:bg-[var(--accent-cyan)] hover:text-black rounded-md transition-colors"><ZoomOutIcon/></button>
        <button onClick={resetView} className="p-2 hover:bg-[var(--accent-cyan)] hover:text-black rounded-md transition-colors"><ExpandIcon/></button>
      </div>

      <div
        className="transition-transform duration-100 ease-linear"
        ref={contentRef}
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        <div 
          className="bg-black shadow-2xl shadow-[var(--accent-lime)]/20 overflow-hidden relative border-2 border-[var(--border-glow)]"
          style={{ 
            width: '80vh', 
            aspectRatio: getAspectRatioValue(aspectRatio),
            maxHeight: '80vh',
            maxWidth: `calc(80vh * ${getAspectRatioValue(aspectRatio)})`,
            boxShadow: '0 0 30px var(--border-glow)'
          }}
        >
           <div className="absolute -inset-px bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-cyan)] rounded-sm blur-xl opacity-50 animate-pulse"></div>
          {videoState.isLoading ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <FuturisticLoader message={videoState.loadingMessage}/>
              {videoState.error && <p className="absolute bottom-4 text-red-400">{videoState.error}</p>}
            </div>
          ) : videoState.url ? (
            <video src={videoState.url} controls autoPlay loop className="w-full h-full object-contain relative z-10" />
          ) : images.length > 0 ? (
            <img src={images[0].processedSrc || images[0].originalSrc} alt="Preview" className="w-full h-full object-contain relative z-10" />
          ) : (
            <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-700 relative z-10">
              <p className="text-gray-500 font-orbitron">UPLOAD AN IMAGE TO BEGIN</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
