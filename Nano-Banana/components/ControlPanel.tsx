import React from 'react';
import { AspectRatio } from '../types';
import { SpinnerIcon, UploadIcon } from './icons/Icons';

interface ControlPanelProps {
  onImageUpload: (files: FileList) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  creativeConcept: string;
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const aspectRatios: AspectRatio[] = ['9:16', '1:1', '16:9', '3:4', '4:3'];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onImageUpload,
  aspectRatio,
  setAspectRatio,
  creativeConcept,
  userPrompt,
  setUserPrompt,
  onGenerate,
  isLoading,
}) => {
  return (
    <div className="flex flex-col space-y-6 h-full">
      <div>
        <label className="text-sm font-bold text-green-400 mb-2 block font-orbitron">1. UPLOAD PRODUCT</label>
        <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
          <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
          <p className="mt-2 text-sm text-gray-400">Drag & drop or click to upload</p>
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => e.target.files && onImageUpload(e.target.files)}
            accept="image/png, image/jpeg"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-green-400 mb-2 block font-orbitron">2. CHOOSE RATIO</label>
        <div className="grid grid-cols-5 gap-2">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`py-2 text-sm rounded-md transition-all ${
                aspectRatio === ratio
                  ? 'bg-green-500 text-gray-900 font-bold shadow-lg shadow-green-500/20'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="concept" className="text-sm font-bold text-green-400 mb-2 block font-orbitron">3. CREATIVE CONCEPT</label>
        <p className="text-xs text-yellow-400/80 mb-2 p-3 bg-yellow-900/20 rounded-md border border-yellow-500/20">
          <span className="font-bold">AI Suggestion:</span> {creativeConcept || 'Upload an image to get a suggestion...'}
        </p>
        <textarea
          id="concept"
          rows={5}
          className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-200"
          placeholder="Or write your own creative prompt..."
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
        />
      </div>

      <div className="flex-grow"></div>

      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full flex items-center justify-center bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/30 transform hover:scale-105"
      >
        {isLoading ? <SpinnerIcon /> : 'GENERATE DESIGN'}
      </button>
    </div>
  );
};
