import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function fileToBase64(file: string, mimeType: string): {inlineData: {data: string, mimeType: string}} {
    return {
        inlineData: {
            data: file.split(',')[1],
            mimeType,
        }
    };
}

export async function analyzeProduct(base64Image: string): Promise<{ concept: string; category: string }> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Analyze this product and suggest a creative poster concept in about 150 characters. Also provide a one-word description of the product category.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          concept: {
            type: Type.STRING,
            description: "A creative poster concept, approx 150 characters."
          },
          category: {
            type: Type.STRING,
            description: "A single word for the product category."
          }
        }
      }
    }
  });

  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse analysis response:", e);
    return { concept: "A stunning poster for your product.", category: "product" };
  }
}

async function editImage(base64Image: string, mimeType: string, prompt: string): Promise<string> {
    const imagePart = fileToBase64(base64Image, mimeType);

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("API did not return an image.");
}

export async function removeBackground(base64Image: string, mimeType: string): Promise<string> {
  const prompt = "Isolate the main subject from this image and make the background completely transparent. Output only the subject with a transparent background.";
  return editImage(base64Image, mimeType, prompt);
}

export async function generateDesign(productImage: string, mimeType: string, prompt: string): Promise<string> {
  const fullPrompt = `Using the provided product image (with a transparent background), create a compelling poster based on the following concept: "${prompt}". The background should be creative and relevant. The overall design should be visually stunning and professional.`;
  return editImage(productImage, mimeType, fullPrompt);
}

export async function refineDesign(currentImage: string, mimeType: string, prompt: string): Promise<string> {
  const fullPrompt = `Refine the current image based on this instruction: "${prompt}". Make the change seamlessly integrated with the existing design.`;
  return editImage(currentImage, mimeType, fullPrompt);
}
