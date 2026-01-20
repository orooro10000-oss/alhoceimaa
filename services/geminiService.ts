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

export const classifyImage = async (base64Image: string): Promise<string> => {
  try {
    const ai = getClient();
    // Use gemini-3-flash-preview for multimodal (image+text) understanding
    const model = 'gemini-3-flash-preview'; 

    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: "Classify this image into one category: 'living' (Living Room/Salon), 'bedroom' (Bedroom), 'kitchen' (Kitchen), 'bathroom' (Bathroom/Toilet), 'exterior' (Building/Pool/Terrace/View). Return ONLY the category word." }
        ]
      }
    });

    const text = response.text?.toLowerCase().trim() || 'other';
    
    if (text.includes('living')) return 'living';
    if (text.includes('bedroom')) return 'bedroom';
    if (text.includes('kitchen')) return 'kitchen';
    if (text.includes('bath')) return 'bathroom';
    if (text.includes('exterior') || text.includes('pool') || text.includes('terrace') || text.includes('view')) return 'exterior';
    
    return 'other';
  } catch (error) {
    console.error("Image Classification Error:", error);
    return 'other';
  }
};