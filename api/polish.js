import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // 1. Handle CORS (So your extension can talk to this server)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. Validate Request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, tone } = req.body;
  
  // 3. Get API Key from Server Environment (Secure)
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server Error: API_KEY not configured in Vercel.' });
  }

  try {
    // 4. Call Gemini
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `
      You are an AI writing assistant. 
      Goal: Fix grammar, add punctuation, and improve flow.
      Tone: ${tone || 'Professional'}
      Input: "${text}"
      Return ONLY the improved text. No quotes.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
      config: {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        temperature: 0.4
      }
    });

    // 5. Return result to Extension/Frontend
    return res.status(200).json({ improvedText: response.text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: error.message || "Failed to process text" });
  }
}