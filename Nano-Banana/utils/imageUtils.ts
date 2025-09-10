import { DownloadQuality } from '../types';

const QUALITY_DIMS: Record<DownloadQuality, number> = {
  Normal: 1024,
  High: 2048,
  'Ultra High': 4096,
};

export const downloadImage = (base64Url: string, quality: DownloadQuality) => {
  const maxDim = QUALITY_DIMS[quality];
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let { width, height } = img;
    const aspectRatio = width / height;

    if (width > height) {
      if (width > maxDim) {
        width = maxDim;
        height = width / aspectRatio;
      }
    } else {
      if (height > maxDim) {
        height = maxDim;
        width = height * aspectRatio;
      }
    }

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);
    
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `ai-design-${quality.toLowerCase().replace(' ','-')}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  img.src = base64Url;
};
