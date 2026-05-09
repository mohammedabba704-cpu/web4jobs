import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || ''
});

export async function generateText(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro',
      contents: prompt,
    });

    return response.text || "Désolé, je ne peux pas formuler de réponse pour le moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
