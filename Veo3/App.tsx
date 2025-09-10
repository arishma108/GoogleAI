import React, { useState, useEffect, useCallback } from 'react';
// FIX: Changed named import for Header to a default import to match its export in components/Header.tsx.
import Header from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { Canvas } from './components/Canvas';
import { Timeline } from './components/Timeline';
import ExportModal from './components/ExportModal';
import { AppState, UploadedImage, VideoState } from './types';
import { useHistory } from './hooks/useHistory';
import { generateCreativeConcept, removeImageBackground, generateVideo } from './services/geminiService';

const INITIAL_STATE: AppState = {
  images: [],
  creativeConcept: '',
  userPrompt: '',
  aspectRatio: '16:9',
  referenceImage: null,
};

function App() {
  const { state, setState, undo, redo, canUndo, canRedo } = useHistory<AppState>(INITIAL_STATE);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [videoState, setVideoState] = useState<VideoState>({ url: null, isLoading: false, loadingMessage: '', error: null });
  const [isExportModalOpen, setExportModalOpen] = useState(false);

  const handleStateChange = (newState: Partial<AppState>) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };
  
  // Effect for AI processing of new images
  useEffect(() => {
    const processNewImages = async () => {
      const newImages = state.images.filter(img => img.processedSrc === null);
      if (newImages.length === 0) return;

      // Generate concept from the first new image
      if (state.creativeConcept === '') {
        const concept = await generateCreativeConcept(newImages[0]);
        handleStateChange({ creativeConcept: concept, userPrompt: concept });
      }

      // Remove backgrounds for all new images
      const processedImages = await Promise.all(
        state.images.map(async img => {
          if (img.processedSrc === null) {
            const processedSrc = await removeImageBackground(img);
            return { ...img, processedSrc };
          }
          return img;
        })
      );
      handleStateChange({ images: processedImages });
    };

    processNewImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.images]);

  const handleGenerateVideo = useCallback(async () => {
    if (state.images.length === 0 || !state.userPrompt) {
      alert("Please upload an image and provide a prompt.");
      return;
    }

    setVideoState({ url: null, isLoading: true, loadingMessage: 'Preparing assets...', error: null });
    
    try {
      const baseImage = selectedImage || state.images[0];
      const videoUrl = await generateVideo(
        state.userPrompt,
        baseImage,
        state.aspectRatio,
        (message: string) => setVideoState(prev => ({ ...prev, loadingMessage: message }))
      );
      setVideoState({ url: videoUrl, isLoading: false, loadingMessage: '', error: null });
    } catch (error) {
      console.error("Video generation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setVideoState({ url: null, isLoading: false, loadingMessage: '', error: `Failed to generate video: ${errorMessage}` });
    }
  }, [state.images, state.userPrompt, state.aspectRatio, selectedImage]);
  
  const handleDownload = (quality: string) => {
    if (!videoState.url) return;
    console.log(`Downloading with quality: ${quality}`); // In a real app, this would trigger resizing logic.
    const a = document.createElement('a');
    a.href = videoState.url;
    a.download = `ai4design_video_${quality.toLowerCase()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setExportModalOpen(false);
  };

  return (
    <div className="h-screen w-screen bg-[var(--bg-dark)] text-white flex flex-col font-sans">
      <Header />
      <main className="flex flex-grow pt-20">
        <ControlPanel
          state={state}
          onStateChange={handleStateChange}
          onGenerate={handleGenerateVideo}
          isGenerating={videoState.isLoading}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onExport={() => setExportModalOpen(true)}
          hasVideo={!!videoState.url}
        />
        <div className="flex-grow flex flex-col">
          <Canvas
            images={state.images}
            videoState={videoState}
            aspectRatio={state.aspectRatio}
          />
          <Timeline
            images={state.images}
            onImageSelect={setSelectedImage}
            selectedImageId={selectedImage?.id}
          />
        </div>
      </main>
      <footer className="text-center py-2 text-xs text-[var(--text-secondary)] bg-black/30 border-t border-[var(--border-glow)]">
        Copyright © 2019 | All Rights Reserved | DARJYO (Pty) Ltd.
      </footer>
      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onDownload={handleDownload}
        videoUrl={videoState.url}
      />
    </div>
  );
}

export default App;