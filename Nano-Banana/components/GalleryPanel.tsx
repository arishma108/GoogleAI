import React, { useRef } from 'react';
import { Design } from '../types';
import { DownloadIcon } from './icons/Icons';

interface GalleryPanelProps {
  designs: Design[];
  setDesigns: React.Dispatch<React.SetStateAction<Design[]>>;
  onDownloadRequest: (src: string) => void;
}

export const GalleryPanel: React.FC<GalleryPanelProps> = ({ designs, setDesigns, onDownloadRequest }) => {
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragItem.current = index;
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragOverItem.current = index;
    };
    
    const handleDragEnd = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        
        const newDesigns = [...designs];
        const dragItemContent = newDesigns.splice(dragItem.current, 1)[0];
        newDesigns.splice(dragOverItem.current, 0, dragItemContent);
        
        dragItem.current = null;
        dragOverItem.current = null;
        setDesigns(newDesigns);
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-lg font-bold font-orbitron text-green-400 mb-4">DESIGN GALLERY</h2>
            {designs.length === 0 ? (
                <div className="flex-grow flex items-center justify-center text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
                    <p>Generated designs will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {designs.map((design, index) => (
                        <div
                            key={design.id}
                            className="relative group cursor-grab"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <img src={design.src} alt={`Design ${index + 1}`} className="rounded-lg aspect-square object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => onDownloadRequest(design.src)} className="p-3 bg-green-500/80 rounded-full text-white hover:bg-green-500">
                                    <DownloadIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
