import { GoogleGenAI } from "@google/genai";
import { ImprovementTone } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is not defined in the environment variables.");
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