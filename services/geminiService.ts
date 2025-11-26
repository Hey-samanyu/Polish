import { GoogleGenAI } from "@google/genai";
import { ImprovementTone } from "../types";

// In production/Vercel, Vite will replace this with the string value of your API Key.
// Ensure you have set 'API_KEY' in your Vercel Project Settings > Environment Variables.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.warn("API_KEY is missing. Please set it in your Vercel Environment Variables.");
}

// Fallback to a dummy key to prevent crash if key is missing, but API calls will fail.
const ai = new GoogleGenAI({ apiKey: apiKey || 'MISSING_API_KEY' });

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
    throw new Error("Connection failed. Please check your API Key and try again.");
  }
};