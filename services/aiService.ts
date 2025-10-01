import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-flash-latest";

const SYSTEM_PROMPT = `You are a professional travel itinerary generator.`;

export interface TravelItineraryPlan {
  morning: string;
  afternoon: string;
  evening: string;
}

export interface TravelItineraryDay {
  day: number;
  date: string;
  plan: TravelItineraryPlan;
}

export interface TravelItineraryResponse {
  title?: string;
  departure?: string;
  destination?: string;
  date_range?: { start?: string; end?: string };
  travellers_count?: number | null;
  budget_usd?: number | null;
  itinerary?: TravelItineraryDay[];
  [key: string]: unknown;
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

const extractText = (response: Awaited<ReturnType<typeof getModelResponse>>): string => {
  if (response.text) {
    return response.text;
  }

  if (response.candidates?.length) {
    return response.candidates
      .map((candidate) => candidate.content?.parts?.map((part) => part.text ?? "").join("") ?? "")
      .join("");
  }

  return "";
};

const getModelResponse = async (ai: GoogleGenAI, prompt: string) => {
  return ai.models.generateContent({
    model: MODEL_NAME,
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    config: {
      responseMimeType: "application/json",
      systemInstruction: [{ text: SYSTEM_PROMPT }],
    },
  });
};

export async function generateResponse(prompt: string): Promise<TravelItineraryResponse> {
  const ai = new GoogleGenAI({
    apiKey: getApiKey(),
  });

  try {
    const response = await getModelResponse(ai, prompt);
    const rawText = extractText(response).trim();

    if (!rawText) {
      throw new Error("AI response was empty. Ensure the prompt is correctly formatted.");
    }

    console.log("Raw AI response text:", rawText);

    try {
      const data = JSON.parse(rawText) as TravelItineraryResponse;
      console.log("Parsed ITINERARY:", data);
      return data;
    } catch (parseError) {
      throw new Error(`Failed to parse Gemini response as JSON. Received: ${rawText}`);
    }
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
}
