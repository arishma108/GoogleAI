
export interface UploadedImage {
  id: string;
  originalName: string;
  originalSrc: string;
  originalMimeType: string;
  processedSrc: string | null; // After background removal
}

export type AspectRatio = "9:16" | "1:1" | "16:9" | "3:4" | "4:3";

export interface VideoState {
  url: string | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
}

export interface AppState {
  images: UploadedImage[];
  creativeConcept: string;
  userPrompt: string;
  aspectRatio: AspectRatio;
  referenceImage: UploadedImage | null;
}
