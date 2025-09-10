export type AspectRatio = '9:16' | '1:1' | '16:9' | '3:4' | '4:3';

export interface ProcessedImage {
  id: string;
  src: string; // original base64
  transparentSrc?: string; // background removed base64
  file: File;
}

export interface Design {
  id: string;
  src: string; // base64 URL of the generated design
}

export interface DownloadRequest {
  src: string;
}

export type DownloadQuality = 'Normal' | 'High' | 'Ultra High';

export interface HistoryState<T> {
  past: T[];
  present: T | null;
  future: T[];
}

export type HistoryAction<T> =
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET'; newPresent: T }
  | { type: 'CLEAR' };
