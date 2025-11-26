import { ImprovementTone } from "../types";

export const improveText = async (text: string, tone: ImprovementTone): Promise<string> => {
  if (!text.trim()) return "";

  try {
    // In production, this calls the Vercel Serverless Function
    const response = await fetch('/api/polish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, tone }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Server error");
    }

    return data.improvedText || text;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Connection failed. Please try again.");
  }
};