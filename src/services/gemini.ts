import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async evaluateOnboarding(profession: string, goal: string, language: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Evaluate the ${language} level needed for a ${profession} with the goal: ${goal}. Provide a recommended learning path.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedLevel: { type: Type.STRING, enum: ["beginner", "intermediate", "advanced"] },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            scenarios: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["estimatedLevel", "recommendations", "scenarios"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  },

  async correctEmail(text: string, tone: string, language: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Correct the following professional email draft in ${language}. Tone: ${tone}. Draft: ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correctedText: { type: Type.STRING },
            feedback: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  error: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["grammar", "vocabulary", "tone"] }
                }
              }
            }
          },
          required: ["correctedText", "feedback"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  },

  async generateFlashcardsFromSimulation(chatHistory: any[], language: string) {
    const historyText = chatHistory.map(m => `${m.role}: ${m.content}`).join("\n");
    const translationLang = language === "English" ? "French" : "English";
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract 3-5 key professional ${language} words or phrases from this conversation for a job seeker to learn. Provide ${translationLang} translations and context examples.\n\n${historyText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word_en: { type: Type.STRING, description: `The word or phrase in ${language}.` },
              translation_fr: { type: Type.STRING, description: `The translation in ${translationLang}.` },
              context_example: { type: Type.STRING }
            },
            required: ["word_en", "translation_fr", "context_example"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  },

  async getSimulationReply(chatHistory: any[], userText: string, scenario: string, language: string) {
    const history = chatHistory.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userText }] }
      ],
      config: {
        systemInstruction: `You are an interviewer or a professional colleague in a ${scenario} scenario. 
        Keep the conversation realistic and professional. 
        CRITICAL: You MUST respond ONLY in ${language}. 
        Do not use any other language under any circumstances. 
        If the user speaks a different language, politely remind them in ${language} that this is a ${language} practice session.
        If the conversation feels complete, indicate it naturally in ${language}.`
      }
    });
    return response.text;
  }
};
