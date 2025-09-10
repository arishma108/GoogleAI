
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { UploadedImage } from '../types';

if (!process.env.API_KEY) {
    // In a real app, you'd want to handle this more gracefully.
    // For this context, we assume it's set.
    console.warn("API_KEY environment variable not set. App will not function correctly.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const fileToGenerativePart = async (fileSrc: string, mimeType: string) => {
    const base64Data = fileSrc.split(',')[1];
    return {
        inlineData: {
            data: base64Data,
            mimeType,
        },
    };
};

export const generateCreativeConcept = async (image: UploadedImage): Promise<string> => {
    try {
        const imagePart = await fileToGenerativePart(image.originalSrc, image.originalMimeType);
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: "Analyze this image and provide a short, creative video concept (100-200 characters) based on its main subject." }] },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating creative concept:", error);
        return "Could not generate a concept. Please write your own.";
    }
};

export const removeImageBackground = async (image: UploadedImage): Promise<string> => {
     try {
        const imagePart = await fileToGenerativePart(image.originalSrc, image.originalMimeType);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    imagePart,
                    { text: 'Remove the background completely, keeping only the main subject. The new background should be transparent.' },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                return imageUrl;
            }
        }
        throw new Error("No image part in response");
    } catch (error) {
        console.error("Error removing image background:", error);
        // Return original image if background removal fails
        return image.originalSrc;
    }
};

export const generateVideo = async (
    prompt: string,
    baseImage: UploadedImage,
    aspectRatio: string,
    setLoadingMessage: (message: string) => void
): Promise<string> => {
    setLoadingMessage("Initializing video generation...");
    const imagePart = await fileToGenerativePart(baseImage.processedSrc || baseImage.originalSrc, baseImage.originalMimeType);
    
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: `${prompt}. The video should be in a ${aspectRatio} aspect ratio.`,
      image: {
        imageBytes: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType
      },
      config: {
        numberOfVideos: 1
      }
    });

    const messages = [
        "Warming up the creative cores...",
        "Stitching pixels into motion...",
        "Composing the digital symphony...",
        "Almost there, adding the final sparkle...",
        "Rendering complete. Preparing for playback..."
    ];
    let messageIndex = 0;

    while (!operation.done) {
      setLoadingMessage(messages[messageIndex % messages.length]);
      messageIndex++;
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    if(operation.error) {
        throw new Error(operation.error.message || "An unknown error occurred during video generation.");
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was found.");
    }
    
    setLoadingMessage("Fetching generated video...");
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};
