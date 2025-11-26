import { GoogleGenAI } from "@google/genai";
import { ImprovementTone } from "../types";

// Safely access process.env to prevent crashes in browsers/environments where it's undefined
const getApiKey = () => {
  try {
    if (typeof process !== "undefined" && process.env) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore error
  }
  return undefined;
};

const apiKey = getApiKey();

if (!apiKey) {
  console.warn("API_KEY is not defined. The demo functionality will use a dummy key and may fail if not configured in Vercel Environment Variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_BUILD' });

export const improveText = async (text: string, tone: ImprovementTone): Promise<string> => {
  if (!text.trim()) return "";

  try {
    const systemInstruction = `
      You are an advanced browser extension writing assistant. 
      The user has selected a specific segment of text from an email or chat message.
      
      Your specific goals:
      1. ADD MISSING PUNCTUATION. This is the most important task.
      2. Fix any capitalization errors.
      3. Improve grammar and sentence structure.
      4. Adjust the tone to be ${tone.toLowerCase()}.
      
      Input Text: "${text}"
      
      Return ONLY the improved text string. Do not wrap it in quotes. Do not include "Here is the improved text". Just the text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4, 
      },
    });

    return response.text || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Connection failed. Please try again.");
  }
};