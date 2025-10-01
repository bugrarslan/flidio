import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-flash-latest";

const SYSTEM_PROMPT = `you are a professional travel planner.`;

const BASE_PROMPT = ``;

export interface TravelItineraryDay {
  day: number;
  activities: Array<{ time: string; activity: string }>;
}

export interface TravelItineraryResponse {
  itinerary: TravelItineraryDay[];
}

function getApiKey(): string {
  const apiKey =
    process.env.EXPO_PUBLIC_GOOGLE_AI_KEY ??
    process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing Gemini API key. Set EXPO_PUBLIC_GOOGLE_AI_KEY in your environment or update the configuration."
    );
  }
  return apiKey;
}

export async function generateResponse() {
  const ai = new GoogleGenAI({
    apiKey: getApiKey(),
  });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [{ text: BASE_PROMPT }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        systemInstruction: [{ text: SYSTEM_PROMPT }],
      },
    });

    if (response.text) {
      try {
        const data = JSON.parse(response.text);
        console.log("Parsed response data:", data);
      } catch (parseError) {
        console.error(`Failed to parse Gemini response as JSON`);
      }
    }
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
}
