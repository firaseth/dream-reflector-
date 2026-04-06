import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION, INTERPRET_SYSTEM_INSTRUCTION } from "../constants";

const getApiKey = (): string => (process.env.GEMINI_API_KEY || '');

export async function enhancePrompt(dreamDescription: string, style: string = 'cinematic'): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Dream description: ${dreamDescription}\nArtistic style: ${style}`,
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });
    return response.text || dreamDescription;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return dreamDescription;
  }
}

export async function generateDreamImage(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: { parts: [{ text: `Cinematic, surreal, artistic dream visualization: ${prompt}. High detail, 4k, ethereal lighting.` }] },
      config: { responseModalities: ['TEXT', 'IMAGE'] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) { return `data:image/png;base64,${part.inlineData.data}`; }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

export async function generateDreamVideo(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: `Cinematic dream sequence: ${prompt}. Artistic, surreal, slow motion, ethereal.`,
      config: { numberOfVideos: 1, durationSeconds: 8, resolution: '720p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("No video generated");
    const videoResp = await fetch(downloadLink);
    const blob = await videoResp.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
}

export async function generateDreamTitle(dreamDescription: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Generate a short, poetic title (max 6 words) for this dream: "${dreamDescription}"\n\nRespond with ONLY the title, no quotes.`,
      config: { temperature: 0.9, maxOutputTokens: 30 },
    });
    return (response.text || 'A Beautiful Dream').replace(/["']/g, '').trim();
  } catch { return 'A Beautiful Dream'; }
}
