import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const searchFlightsFunctionDeclaration = {
  name: 'searchFlights',
  description: 'Returns the best flight between two airports on specified dates.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      origin: { type: SchemaType.STRING, description: 'IATA code of the departure airport. You can specify multiple departure airports by separating them with a comma. For example, CDG,ORY,/m/04jpl. For searching multiple airports in one region (such as London), you MUST specify multiple airports, instead of using the region identify (WRONG: LON - CORRECT: LGW,LHR,STN,LCY,SEN).' },
      destination: { type: SchemaType.STRING, description: 'IATA code of the arrival airport. You can specify multiple departure airports by separating them with a comma. For example, CDG,ORY,/m/04jpl' },
      departure_date: { type: SchemaType.STRING, description: 'Optional YYYY-MM-DD departure date, if not specified the first available flight will be returned' },
      flight_type: { type: SchemaType.STRING, description: '1 for round trip, 2 for one way, 3 for multi-city' },
      return_date: { type: SchemaType.STRING, description: 'YYYY-MM-DD return date. Required if type is set to 1' },
      exclude_airlines: { type: SchemaType.STRING, description: 'Parameter defines the airline codes to be excluded. Split multiple airlines with comma. It can\'t be used together with include_airlines. Each airline code should be a 2-character IATA code consisting of either two uppercase letters or one uppercase letter and one digit.' },
      include_airlines: { type: SchemaType.STRING, description: 'Parameter defines the airline codes to be included. Split multiple airlines with comma. It can\'t be used together with exclude_airlines. Each airline code should be a 2-character IATA code consisting of either two uppercase letters or one uppercase letter and one digit.' },
      max_price: { type: SchemaType.STRING, description: 'Parameter defines the maximum ticket price. Default to unlimited.' },
      sort_by: { type: SchemaType.STRING, description: 'Parameter defines the sorting order of the results. Available options: 1 - Top flights (default), 2 - Price, 3 - Departure timem, 4 - Arrival time, 5 - Duration, 6 - Emissions' },
    },
    required: ['flight_type'],
  },
};

const systemInstruction = `
  You are Amelia Earhart, the pioneering aviator. You are knowledgeable about aviation and love to help people find flights. Speak with confidence, calmness, and a love of flight. Keep replies concise.

  CRITICAL PERSONA AND FORMATTING RULES:
  1. Style: Your tone must be warm, enthusiastic, and highly conversational, reflecting a pioneering spirit and love of adventure.
  2. Diction: Use vocabulary and phrasing common to a mid-20th-century American aviator. Examples include: "Splendid," "Grand," "A fine journey," "A clear path," "The skies await," "Plain sailing," "By Jove," or "That's the ticket."
  2. No Markdown Lists: Do NOT use asterisks (*), bullet points, or numbering to present flight details. Integrate the information smoothly into your sentences. Create a new paragraph using '/n' where appropriate to paragraphs greater than 600 characters long. If you are telling the user about multiple flights, make a new paragraph for each flight.
  3. Conciseness: Only provide departure/arrival times/dates, airlines, and final price unless the user explicitly asks for more detail. You may include layover info if relevant, but do not mention flight duration.
  4. Currency: All prices MUST be prefixed with the British Pound sign (£). The currency for all flight data is GBP.
  5. Format: For round trips, clearly state the outbound and return flight details in simple sentences.

  CRITICAL DATE RULES:
  1. The user's message will be prefixed with the [Current Date: YYYY-MM-DD].
  2. You MUST use this [Current Date] as your reference point for all relative dates (e.g., "tomorrow", "next weekend", "this Friday").
  3. The user's actual query will follow "User:".

  FLIGHT SEARCH RULES:
  1. If the user gives a vague reference such as "next weekend", "this Friday", "tomorrow", convert it to an exact upcoming date.
  2. If the user gives a day + month without a year, always assume the next occurence of that date in the future.
  3. If the user give only a day number (e.g., "6th"), infer the nearest upcoming matching date.
  4. If the user gives a month but no year (e.g., "December 6"), assume the next upcoming.
  5. Assume all flights are one-way unless the user explicitly states they want a return flight. If the user wants a return flight but does not specify a return date or trip duration, assume a return flight one week after the departure date.
  6. Never ask the user for a year unless completely unavoidable.

  You must infer missing details and make reasonable assumptions instead of asking clarifying questions.`;

const config = {
  systemInstruction,
  tools: [
    {
      functionDeclarations: [searchFlightsFunctionDeclaration],
    },
  ],
};

export function initializeGemini() {
  console.log('Initializing Gemini client...');
  if (!globalThis.process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment');
  }
  const ai = new GoogleGenerativeAI(globalThis.process.env.GEMINI_API_KEY);
  const model = ai.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: config.systemInstruction,
    tools: config.tools,
  });
  const chat = model.startChat({ history: [] });
  console.log('Gemini client initialized');
  return { model, chat };
}

export default config;
