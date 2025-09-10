import React, { useRef, useCallback } from 'react';
import { AppState, UploadedImage, AspectRatio } from '../types';
import { UploadIcon, UndoIcon, RedoIcon, DownloadIcon } from './icons';

interface ControlPanelProps {
  state: AppState;
  onStateChange: (newState: Partial<AppState>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExport: () => void;
  hasVideo: boolean;
}

const fileToBase64 = (file: File): Promise<{ src: string; mimeType: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve({ src: reader.result as string, mimeType: file.type });
    reader.onerror = (error) => reject(error);
  });

export const ControlPanel: React.FC<ControlPanelProps> = ({
  state,
  onStateChange,
  onGenerate,
  isGenerating,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExport,
  hasVideo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const newImages: UploadedImage[] = await Promise.all(
        files.map(async (file) => {
          const { src, mimeType } = await fileToBase64(file);
          return {
            id: `${file.name}-${Date.now()}`,
            originalName: file.name,
            originalSrc: src,
            originalMimeType: mimeType,
            processedSrc: null,
          };
        })
      );
      onStateChange({ images: [...state.images, ...newImages] });
    }
  }, [onStateChange, state.images]);

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <div className="w-96 bg-[var(--bg-panel)] backdrop-blur-xl border-r border-[var(--border-glow)] p-4 flex flex-col space-y-4 overflow-y-auto shadow-[0_0_20px_rgba(0,255,255,0.1)]">
      {/* Undo/Redo */}
      <div className="flex items-center justify-between p-2 bg-black/30 rounded-md border border-white/10">
        <h3 className="text-sm font-bold tracking-widest text-[var(--accent-cyan)] font-orbitron">HISTORY</h3>
        <div className="flex space-x-2">
          <button onClick={onUndo} disabled={!canUndo} className="p-2 rounded-md bg-black/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--accent-cyan)] hover:text-black transition-colors shadow-sm shadow-black hover:shadow-[0_0_10px_var(--accent-cyan)]">
            <UndoIcon className="w-5 h-5" />
          </button>
          <button onClick={onRedo} disabled={!canRedo} className="p-2 rounded-md bg-black/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--accent-cyan)] hover:text-black transition-colors shadow-sm shadow-black hover:shadow-[0_0_10px_var(--accent-cyan)]">
            <RedoIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image Uploader */}
      <div 
        className="border-2 border-dashed border-[var(--accent-cyan)]/50 rounded-lg p-6 text-center cursor-pointer hover:border-[var(--accent-cyan)] hover:bg-cyan-900/20 transition-all relative group"
        onClick={triggerFileInput}
      >
        <div className="absolute -inset-px rounded-lg bg-[var(--accent-cyan)] blur-xl opacity-0 group-hover:opacity-20 animate-pulse transition-opacity duration-500"></div>
        <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <UploadIcon className="mx-auto w-10 h-10 text-[var(--accent-cyan)]/70 group-hover:text-[var(--accent-cyan)] transition-colors" />
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Drag & drop or <span className="font-semibold text-[var(--accent-lime)] neon-glow-lime">click to upload</span></p>
      </div>
      
      {/* Creative Concept */}
      <div>
        <label htmlFor="creative-concept" className="block text-sm font-bold tracking-widest text-[var(--accent-cyan)] mb-1 font-orbitron">CREATIVE CONCEPT</label>
        <textarea
          id="creative-concept"
          rows={3}
          value={state.creativeConcept}
          onChange={(e) => onStateChange({ creativeConcept: e.target.value })}
          className="w-full bg-black/30 border border-white/10 rounded-md p-2 text-sm focus:ring-1 focus:ring-[var(--accent-cyan)] focus:border-[var(--accent-cyan)] transition-shadow focus:shadow-[0_0_15px_var(--border-glow)] placeholder:text-gray-500"
          placeholder="AI will generate a concept here..."
        />
      </div>

      {/* User Prompt */}
      <div>
        <label htmlFor="user-prompt" className="block text-sm font-bold tracking-widest text-[var(--accent-cyan)] mb-1 font-orbitron">VIDEO PROMPT</label>
        <textarea
          id="user-prompt"
          rows={5}
          value={state.userPrompt}
          onChange={(e) => onStateChange({ userPrompt: e.target.value })}
          className="w-full bg-black/30 border border-white/10 rounded-md p-2 text-sm focus:ring-1 focus:ring-[var(--accent-cyan)] focus:border-[var(--accent-cyan)] transition-shadow focus:shadow-[0_0_15px_var(--border-glow)] placeholder:text-gray-500"
          placeholder="E.g., An astronaut floating in space, earth in the background..."
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-auto pt-4 space-y-3 border-t border-[var(--border-glow)]">
        <button
          onClick={onGenerate}
          disabled={isGenerating || state.images.length === 0}
          className="w-full flex items-center justify-center bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-cyan)] text-black font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:from-gray-500 disabled:to-gray-600 disabled:text-gray-400 hover:shadow-[0_0_20px_var(--accent-cyan)]"
        >
          {isGenerating ? 'GENERATING...' : 'GENERATE VIDEO'}
        </button>
        <button
          onClick={onExport}
          disabled={!hasVideo || isGenerating}
          className="w-full flex items-center justify-center bg-gradient-to-r from-[var(--accent-magenta)] to-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:from-gray-500 disabled:to-gray-600 disabled:text-gray-400 hover:shadow-[0_0_20px_var(--accent-magenta)]"
        >
          <DownloadIcon className="w-5 h-5 mr-2" />
          DOWNLOAD / EXPORT
        </button>
      </div>
    </div>
  );
};