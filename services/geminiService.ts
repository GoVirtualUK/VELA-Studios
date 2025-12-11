import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Converts a File object to a Base64 string.
 */
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeScene = async (file: File, promptText: string = "Describe this 360-degree environment in detail. What is the atmosphere, setting, and key objects visible?"): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = ai.models; // Access models namespace

    const imagePart = await fileToGenerativePart(file);

    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          imagePart,
          { text: promptText }
        ]
      }
    });

    if (response.text) {
        return response.text;
    }
    return "No description available.";

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    if (error instanceof Error) {
        throw new Error(`AI Analysis failed: ${error.message}`);
    }
    throw new Error("AI Analysis failed due to an unknown error.");
  }
};