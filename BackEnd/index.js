import dotenv from 'dotenv';
import express, { response } from 'express';
import cors from 'cors';
import { getJson } from 'serpapi';
import process from 'process';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

import * as fs from 'fs'; // temp file writing

dotenv.config();

const app = express();
const port = 3000;
const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

const fallbackText = "I am sorry, my instruments seem to be playing up. Flying may not be all plain sailing, but the fun of it is worth the price.";

// Define the flight search function declaration for Gemini
const searchFlightsFunctionDeclaration = {
  name: "searchFlights",
  description: "Returns the best flight between two airports on specified dates.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      origin: { type: SchemaType.STRING, description: "IATA code of the departure airport" },
      destination: { type: SchemaType.STRING, description: "IATA code of the arrival airport" },
      departure_date: { type: SchemaType.STRING, description: "YYYY-MM-DD departure date" },
      return_date: { type: SchemaType.STRING, nullable: true, description: "YYYY-MM-DD return date or null if not specified by user" }
    },
    required: ["origin", "destination", "departure_date"]
  }
};

// Generation config with function declaration
const config = {
  systemInstruction: `
  You are Amelia Earhart, the pioneering aviator. You are knowledgeable about aviation and love to help people find flights. Speak with confidence, calmness, and a love of flight. Keep replies concise.

  CRITICAL PERSONA AND FORMATTING RULES:
  1. Conversational Style: Your responses must be warm, enthusiastic, and delivered in short, natural sentences.
  2. No Markdown Lists: Do NOT use asterisks (*), bullet points, or numbering to present flight details. Integrate the information smoothly into your sentences.
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
  5. If the user gives no date at all, assume the soonest reasonable date for flight availability.
  6. Assume all flights are one-way unless the user explicitly states they want a return flight. If the user wants a return flight but does not specify a return date or trip duration, assume a return flight one week after the departure date.
  7. Never ask the user for a year unless completely unavoidable.

  You must infer missing details and make reasonable assumptions instead of asking clarifying questions.`,
  tools: [{
    functionDeclarations: [searchFlightsFunctionDeclaration]
  }]
};

// Configure the Gemini client
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the model with the specified model and configuration
const model = ai.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: config.systemInstruction,
  tools: config.tools
});

// Start a new chat session and pass in the initial greeting
const chat = model.startChat({
  history: [],
});

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

async function searchFlights(departure, destination, departDate, returnDate) {
  console.log(`Searching flights from ${departure} to ${destination} departing on ${departDate} returning on ${returnDate || 'N/A'}`);
  let data;
  try {
    data = fs.readFileSync("BackEnd/data.json");
  } catch (error) {
    console.error(error);

    throw error;
  }

  // set type to 1 for round trip, 2 for one way, 3 for multi-city
  const flightType = returnDate ? 1 : 2;

  return JSON.parse(data); // temp bypass to avoid API calls during dev

  // try { 
  //   const json = await getJson({
  //     engine: "google_flights",
  //     api_key: SERPAPI_KEY,
  //     departure_id: departure,
  //     arrival_id: destination,
  //     type: 1, // 1 for round trip, 2 for one way, 3 for multi-city
  //     outbound_date: departDate,
  //     return_date: returnDate,
  //     currency: "GBP",
  //   });

  //   console.log(json.best_flights || json.flights);
  //   const data = JSON.stringify(json.best_flights);
  //   fs.writeFile("data.json", data, (error) => {
  //     // throwing the error
  //     // in case of a writing problem
  //     if (error) {
  //       // logging the error
  //       console.error(error);

  //       throw error;
  //     }

  //     console.log("data.json written correctly");
  //   });
  //   return json.best_flights || json.flights || [];
  // } catch (error) {
  //   console.error(`Error searching flights: ${error}`);
  //   return [];
  // }
}

app.post('/api/chat/message', async (req, res) => {

  if (req.body.message.substring(0,5) != "[DEV]") { // TEMP bypass to reduce usage during testing
    res.send({ reply: "Better do a good deed near at home than go far away to burn incense.\n\nPrefix your message with [DEV] to access the gemini (to reduce the usage during testing)" });
  }

  console.log(`Message from client: ${req.body.message}`);

  // Get current date for context
  const today = new Date().toISOString().split('T')[0];
  const userMessage = req.body.message;
  const messageWithDate = `
  [Current Date: ${today}]
  User: ${userMessage}`;

  try {
    const initialResponse = await chat.sendMessage(messageWithDate);
    console.log(`Initial chat response: \n${JSON.stringify(initialResponse)}\n`);

    // Check if response is wrapped into an outer 'response' object
    const structuredResponse = initialResponse.response || initialResponse;

    // Look for the function call object deep inside the response
    const functionCallPart = structuredResponse.candidates?.[0]?.content?.parts?.find(
      part => part.functionCall
    )

    if (!functionCallPart) {
      // No function call detected, return the text response
      console.log("Model returned text, no function call detected.");
      const responseText = initialResponse.response.candidates?.[0]?.content?.parts?.[0]?.text || fallbackText;
      return res.send({ reply: responseText });
    }

    const tool_call = functionCallPart.functionCall;
    console.log(`Tool call detected: ${JSON.stringify(tool_call)}`);

    let result;
    if (tool_call.name === "searchFlights") {
      console.log(`Invoking searchFlights with arguments: ${JSON.stringify(tool_call.args)}`);
      result = await searchFlights(tool_call.args.origin, tool_call.args.destination, tool_call.args.departure_date, tool_call.args.return_date)
    }

    console.log(`tool_call result (stringified):\n${JSON.stringify(result)}\n`);

    const finalResponse = await chat.sendMessage([
      {
        functionResponse: {
          name: tool_call.name,
          response: { flights: result }
        }
      }
    ]);

    console.log(`Final chat response: \n${finalResponse.response.candidates?.[0]?.content?.parts?.[0]?.text}\n`);

  const responseText = finalResponse.response.candidates?.[0]?.content?.parts?.[0]?.text || fallbackText;
    res.send({ reply: responseText });

  } catch (error) {
    console.error(`Error handling chat message: ${error}`);
    res.status(500).send({ reply: fallbackText });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});