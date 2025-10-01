const BASE_PROMPT = `Your task is to create a structured day-by-day travel plan in JSON format only.
Do not include explanations or text outside the JSON.

INPUT DATA:
- title: [string]
- departure: [string]
- destination: [string]
- start_date: [YYYY-MM-DD]
- end_date: [YYYY-MM-DD]
- budget: [number, USD]
- travellers_count: [number]
- trip_vibes: ["City explorer", "Coastal chill", "Mountain retreat", "Foodie tour", "Art & culture", "Nightlife"]
- user_notes: [string]
- user_credentials:
  - name: [string]
  - age: [number]
  - location: [string]
  - travel_styles: ["City breaks", "Nature escapes", "Culinary tours", "Cultural deep dives", "Adventure thrills", "Wellness retreats", "Family friendly"]
  - bio: [string]

OUTPUT REQUIREMENTS:
- Always return **valid JSON**.
- The JSON must include the following structure:

{
  "title": string,
  "departure": string,
  "destination": string,
  "date_range": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "travellers_count": number,
  "budget_usd": number,
  "itinerary": [
    {
      "day": number,
      "date": "YYYY-MM-DD",
      "plan": {
        "morning": string,
        "afternoon": string,
        "evening": string
      }
    }
  ],
}

RULES:
1. Always keep the JSON valid and properly formatted.
2. Ensure the plan is realistic, location-accurate, and aligned with the user's trip_vibes and travel_styles.
3. Keep descriptions short and clear (max 2–3 sentences per activity).
4. Every day must have morning, afternoon, and evening activities.
5. Stay consistent with dates from start_date to end_date.
6. Do not invent values if missing — leave them empty or null.
7. Do not output text outside of JSON.`;

export interface PromptUserCredentials {
  name?: string | null;
  age?: number | null;
  location?: string | null;
  travelStyles?: string[] | null;
  bio?: string | null;
}

export interface PromptInput {
  title?: string | null;
  departure?: string | null;
  destination?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  budget?: number | null;
  travellersCount?: number | null;
  tripVibes?: string[] | null;
  userNotes?: string | null;
  userCredentials?: PromptUserCredentials | null;
}

const toCleanString = (value?: string | null): string => (value ?? "").trim();

const toNumberOrNull = (value?: number | null) =>
  typeof value === "number" && !Number.isNaN(value) ? value : null;

const toArray = (value?: string[] | null): string[] => (value ? value.filter(Boolean) : []);

export const formatPrompt = (input: PromptInput): string => {
  const payload = {
    title: toCleanString(input.title),
    departure: toCleanString(input.departure),
    destination: toCleanString(input.destination),
    start_date: toCleanString(input.startDate),
    end_date: toCleanString(input.endDate),
    budget: toNumberOrNull(input.budget),
    travellers_count: toNumberOrNull(input.travellersCount),
    trip_vibes: toArray(input.tripVibes),
    user_notes: toCleanString(input.userNotes),
    user_credentials: {
      name: toCleanString(input.userCredentials?.name),
      age: toNumberOrNull(input.userCredentials?.age ?? null),
      location: toCleanString(input.userCredentials?.location),
      travel_styles: toArray(input.userCredentials?.travelStyles),
      bio: toCleanString(input.userCredentials?.bio),
    },
  };

  return `${BASE_PROMPT}\n\nUSER DATA:\n${JSON.stringify(payload, null, 2)}`;
};

export { BASE_PROMPT };
