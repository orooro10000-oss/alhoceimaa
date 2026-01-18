import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found");
    }
    return new GoogleGenAI({ apiKey });
};

export const generateDescription = async (title: string, location: string, category: string): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      Write a compelling, attractive, and short description (max 2 sentences) in Arabic for a vacation rental listing.
      Details:
      - Title: ${title}
      - Location: ${location}
      - Category: ${category}
      
      Focus on the vibe and unique features. Do not use hashtags.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "مكان جميل للإقامة.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "استمتع بالراحة والأناقة في هذا العقار الفريد. مثالي لعطلتك القادمة.";
  }
};