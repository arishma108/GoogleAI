import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { Canvas } from './components/Canvas';
import { GalleryPanel } from './components/GalleryPanel';
import { DownloadModal } from './components/DownloadModal';
import { Footer } from './components/Footer';
import { AspectRatio, Design, DownloadRequest, ProcessedImage } from './types';
import { analyzeProduct, removeBackground, generateDesign, refineDesign } from './services/geminiService';
import { useImageHistory } from './hooks/useImageHistory';

export default function App() {
  const [productImages, setProductImages] = useState<ProcessedImage[]>([]);
  const [activeProductImage, setActiveProductImage] = useState<ProcessedImage | null>(null);
  const [creativeConcept, setCreativeConcept] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  
  const { currentImage, set: setCurrentImage, undo, redo, canUndo, canRedo, clearHistory } = useImageHistory();

  const [generatedDesigns, setGeneratedDesigns] = useState<Design[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const [downloadRequest, setDownloadRequest] = useState<DownloadRequest | null>(null);

  const handleImageUpload = useCallback(async (files: FileList) => {
    setIsLoading(true);
    setLoadingMessage('Analyzing product...');
    clearHistory();
    setGeneratedDesigns([]);
    
    const file = files[0];
    if (!file) {
      setIsLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const originalImage = { id: Date.now().toString(), src: base64, file: file };
      setProductImages([originalImage]);
      
      try {
        const analysis = await analyzeProduct(base64);
        setCreativeConcept(analysis.concept);
        setUserPrompt(analysis.concept);
        
        setLoadingMessage('Removing background...');
        const transparentImage = await removeBackground(base64, file.type);
        const processedImage = { ...originalImage, transparentSrc: transparentImage };
        
        setActiveProductImage(processedImage);
        setCurrentImage(transparentImage);
      } catch (error) {
        console.error("Error processing image:", error);
        alert('Failed to process image. Please check the console for details.');
        setActiveProductImage({ ...originalImage, transparentSrc: base64 });
        setCurrentImage(base64);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, [clearHistory, setCurrentImage]);

  const handleGenerate = useCallback(async () => {
    if (!activeProductImage?.transparentSrc || !userPrompt) {
      alert('Please upload a product image and provide a prompt.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Generating futuristic design...');
    
    try {
      const newDesignSrc = await generateDesign(activeProductImage.transparentSrc, activeProductImage.file.type, userPrompt);
      setCurrentImage(newDesignSrc);
      const newDesign: Design = { id: `design-${Date.now()}`, src: newDesignSrc };
      setGeneratedDesigns(prev => [...prev, newDesign]);
    } catch (error) {
      console.error("Error generating design:", error);
      alert('Failed to generate design. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  }, [activeProductImage, userPrompt, setCurrentImage]);

  const handleRefine = useCallback(async (refinementPrompt: string) => {
    if (!currentImage || !refinementPrompt) {
      alert('No active design to refine or prompt is empty.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Refining your creation...');

    try {
      // Assuming the currentImage is a PNG from Gemini
      const newDesignSrc = await refineDesign(currentImage, 'image/png', refinementPrompt);
      setCurrentImage(newDesignSrc);
      const newDesign: Design = { id: `design-${Date.now()}`, src: newDesignSrc };
      setGeneratedDesigns(prev => [...prev, newDesign]);
    } catch (error) {
      console.error("Error refining design:", error);
      alert('Failed to refine design. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  }, [currentImage, setCurrentImage]);
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0">
        <div className="lg:col-span-3 bg-gray-800/50 border border-green-500/20 rounded-lg p-4 flex flex-col space-y-4 overflow-y-auto">
          <ControlPanel
            onImageUpload={handleImageUpload}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            creativeConcept={creativeConcept}
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        </div>

        <div className="lg:col-span-6 bg-gray-800/50 border border-green-500/20 rounded-lg flex flex-col p-4 relative overflow-hidden">
          <Canvas
            imageSrc={currentImage}
            aspectRatio={aspectRatio}
            onRefine={handleRefine}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            onDownloadRequest={(src) => setDownloadRequest({src})}
          />
        </div>

        <div className="lg:col-span-3 bg-gray-800/50 border border-green-500/20 rounded-lg p-4 flex flex-col overflow-y-auto">
          <GalleryPanel 
            designs={generatedDesigns}
            setDesigns={setGeneratedDesigns}
            onDownloadRequest={(src) => setDownloadRequest({src})}
          />
        </div>
      </main>
      
      {downloadRequest && (
        <DownloadModal 
          base64Url={downloadRequest.src}
          onClose={() => setDownloadRequest(null)}
        />
      )}
      <Footer />
    </div>
  );
}