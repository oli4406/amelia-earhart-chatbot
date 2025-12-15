/**
 * Chat orchestration layer.
 * Handles intent detection, fallback responses, flight parameter extraction,
 * Gemini client interaction, and flight-search tool execution.
 * @module services/chatService
 */

import { searchFlights } from './flightService.js';
import { getRandomResponse, getPredefinedResponse } from './responseService.js';
import { extractDestination, findAirportByPhrase } from './airportService.js';

let chat = null;

/**
 * Injects the Gemini chat client into the service.
 * @param {Object} client - Gemini chat model instance.
 */
export function setGeminiClient(client) {
  chat = client;
}

/**
 * Checks whether a message appears to be a flight-related query.
 * @param {string} text 
 * @returns {boolean}
 */
function isFlightQuery(text) {
  const triggers = ["flight", "flights", "fly", "plane", "ticket", "from", "go to", "fly to"];
  return triggers.some(t => text.toLowerCase().includes(t));
}

/**
 * Attempts to extract origin, destination, and date fields from natural language text.
 * @param {string} text 
 * @returns {Object|null} Parsed { origin, destination, departure_date, flight_type }
 */
function extractFlightParams(text) {
  if (!text || typeof text !== 'string') return null;
  const lower = text.toLowerCase();

  // Extract everything after 'from' up to 'to'
  // Allows multi-word origins e.g. new york
  const fromMatch = lower.match(/from\s+([a-z0-9/\-\s\u00C0-\u017F]+?)(?:\s+to\b|$)/i);

  let originIata = null;

  if (fromMatch && fromMatch[1]) {
    const originPhrase = fromMatch[1].trim();
    const originRecord = findAirportByPhrase(originPhrase);

    if (originRecord && originRecord.iata) {
      originIata = originRecord.iata.toUpperCase();
    } else {
      originIata = null;
    }
  }

  // If none specified, default to the two main London airports
  if (!originIata) {
    originIata = "LGW,LHR";
  }

  let textWithoutOrigin = text;
  if (fromMatch) {
    textWithoutOrigin = text.replace(fromMatch[1], " ");
  }
  const destination = extractDestination(textWithoutOrigin);
  if (!destination) {
    console.log("No destination");
    return null;
  }

  const originList = originIata.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  if (originList.includes(destination.toUpperCase())) {
    console.log("Destination = origin");
    return null;
  }

  const dateMatch = lower.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const departure_date = dateMatch ? dateMatch[1] : tomorrow.toISOString().split('T')[0];

  return {
    origin: originIata,
    destination: destination.toUpperCase(),
    departure_date,
    flight_type: 2
  };
}

/**
 * Formats a fallback text response when Gemini is unavailable.
 * Includes flight results when present.
 * @param {Object[]} flights - Array of flight objects from SerpAPI.
 * @param {Object} params - Extracted flight parameters.
 * @returns {string}
 */
function formatFallbackFlightResponse(flights, params) {
  if (!flights || flights.length === 0) {
    let response = getRandomResponse('noFlightsFound');

    response = response
      .replace(/{{ORIGIN}}/g, params.origin)
      .replace(/{{DESTINATION}}/g, params.destination)

    // if placeholders are still there, use generic fallback
    if (response.includes("{")) return getRandomResponse();

    return response;
  }
  
  let template = getRandomResponse("flightResult");

  const f1 = flights[0];
  const f2 = flights[1]; // May be undefined

  // {{ORIGIN}} {{DESTINATION}}
  // {{AIRLINE_1}} {{DEPARTURE_TIME_1}} {{DEPARTURE_DATE_1}} {{ARRIVAL_AIRPORT_1}} {{ARRIVAL_TIME_1}} {{PRICE_1}}
  // {{AIRLINE_2}} {{DEPARTURE_TIME_2}} {{DEPARTURE_DATE_2}} {{ARRIVAL_AIRPORT_2}} {{ARRIVAL_TIME_2}} {{PRICE_2}}

  template = template
    .replace(/{{ORIGIN}}/g, f1.flights[0]?.departure_airport.name)
    .replace(/{{DESTINATION}}/g, f1.flights[0]?.arrival_airport.name)
    .replace(/{{AIRLINE_1}}/g, f1.flights[0]?.airline)
    .replace(/{{DEPARTURE_AIRPORT_1}}/g, f1.flights[0]?.departure_airport.name)
    .replace(/{{DEPARTURE_TIME_1}}/g, f1.flights[0]?.departure_airport.time.split(" ")[1])
    .replace(/{{DEPARTURE_DATE_1}}/g, f1.flights[0]?.departure_airport.time.split(" ")[0])
    .replace(/{{ARRIVAL_AIRPORT_1}}/g, f1.flights[0]?.arrival_airport.name)
    .replace(/{{ARRIVAL_TIME_1}}/g, f1.flights[0]?.arrival_airport.time.split(" ")[1])
    .replace(/{{ARRIVAL_DATE_1}}/g, f1.flights[0]?.arrival_airport.time.split(" ")[0])
    .replace(/{{PRICE_1}}/g, f1.price);

  if (f2) {
    template = template
      .replace(/{{AIRLINE_2}}/g, f2.flights[0]?.airline)
      .replace(/{{DEPARTURE_AIRPORT_2}}/g, f2.flights[0]?.departure_airport.name)
      .replace(/{{DEPARTURE_TIME_2}}/g, f2.flights[0]?.departure_airport.time.split(" ")[1])
      .replace(/{{DEPARTURE_DATE_2}}/g, f2.flights[0]?.departure_airport.time.split(" ")[0])
      .replace(/{{ARRIVAL_AIRPORT_2}}/g, f2.flights[0]?.arrival_airport.name)
      .replace(/{{ARRIVAL_TIME_2}}/g, f2.flights[0]?.arrival_airport.time.split(" ")[1])
      .replace(/{{ARRIVAL_DATE_2}}/g, f2.flights[0]?.arrival_airport.time.split(" ")[0])
      .replace(/{{PRICE_2}}/g, f2.price);

  } else {
    // No second flight
    const lines = template.split("\n");
    const trimmed = lines.filter(line => !line.includes("2}}"));
    template = trimmed.join("\n");
  }

  // if placeholders are still there, use generic fallback
  if (template.includes("{")) return getRandomResponse();

  return template;
}

function validateFlightCallArgs(args) {
  if (!args || typeof args !== 'object') {
    console.error("Args not type object");
    return null;
  }

  if (!args.destination || typeof args.destination !== 'string') {
    console.error("Destination missing or not string");
    return null;
  }

  if (!args.flight_type || typeof args.flight_type !== 'string') {
    console.error("Flight type missing or not string");
    return null;
  }
  
  if (args.departure_date && !/^\d{4}-\d{2}-\d{2}$/.test(args.departure_date)) {
    console.error("Date in wrong format")
    return null;
  }

  return args;
}

/**
 * Central handler for all user messages.
 * Routes through predefined responses or Gemini, with flight intent handling.
 * @async
 * @function handleChatMessage
 * @param {string} messageText - Raw user message.
 * @returns {Promise<Object>} Promise resolving to {reply: string, status: string}
 */
export async function handleChatMessage(messageText) {
  if (!messageText || typeof messageText !== 'string') {
    return { reply: getRandomResponse() };
  }

  // Intent detection
  const isFlightRequest = isFlightQuery(messageText);
  isFlightRequest ? console.log("Flight Request detected") : null;

  // Extract details if flight request
  const extractedParams = isFlightRequest ? extractFlightParams(messageText) : null;

  if (isFlightRequest) {
    const destIata = extractDestination(messageText);
    if (!destIata) {
      return { reply: getRandomResponse("noDestIATA") };
    }

    if (!extractedParams) {
      return { reply: getRandomResponse("noDestIATA") };
    }
  } else {
    const responsesArray = getPredefinedResponse(messageText);
    let predefinedResponse = responsesArray[0]
    const fallbackResponse = responsesArray[1]
    if (!predefinedResponse) {
      if (!chat) {
        console.log("No gemini - using fallback response")
        return { reply: fallbackResponse };
      }
    } else {
      return { reply: predefinedResponse };
    }
  }

  let fallbackFlightResults = null;

  if (isFlightRequest && !chat) {
    console.log("Gemini unavailable, running fallback flight search...");
    fallbackFlightResults = await searchFlights(
      extractedParams.origin,
      extractedParams.destination,
      extractedParams.departure_date,
      extractedParams.flight_type
    );

    return {
      reply: formatFallbackFlightResponse(fallbackFlightResults, extractedParams)
    };
  }

  // Get current date for context
  const today = new Date().toISOString().split('T')[0];
  const messageWithDate = `[Current Date: ${today}]
  User: ${messageText}`;

  // Get current time to calculate response time
  const startTime = Date.now();

  try {
    if (!chat) {
      console.error('Gemini client not initialized');
      return { reply: getRandomResponse() };
    }

    const initialResponse = await chat.sendMessage(messageWithDate);

    const structuredResponse = initialResponse.response || initialResponse;
    const functionCallPart = structuredResponse.candidates?.[0]?.content?.parts?.find(part => part.functionCall);

    if (!functionCallPart) {
      // No function call detected, return the text response
      console.log("Model returned text, no function call detected.");
      const responseText = structuredResponse.candidates?.[0]?.content?.parts?.[0]?.text || getRandomResponse();
      return { reply: responseText };
    }

    const tool_call = functionCallPart.functionCall;

    let result;
    if (tool_call.name === 'searchFlights') {
      const validArgs = validateFlightCallArgs(tool_call.args);
      if (!validArgs) {
        console.error("Invalid arguments supplied by Gemini")
        return { reply: getRandomResponse() };
      }
      result = await searchFlights(
        validArgs.origin,
        validArgs.destination,
        validArgs.departure_date,
        validArgs.flight_type,
        validArgs.return_date || '',
        validArgs.exclude_airlines || '',
        validArgs.include_airlines || '',
        validArgs.max_price || '',
        validArgs.sort_by || ''
      );
    }

    const finalResponse = await chat.sendMessage([
      {
        functionResponse: {
          name: tool_call.name,
          response: { flights: result },
        },
      },
    ]);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const responseText = finalResponse.response.candidates?.[0]?.content?.parts?.[0]?.text || getRandomResponse();

    console.log(`Final chat response: \n${responseText}\nTotal response time: ${responseTime}ms`);

    return { status: 'done', reply: responseText };
  } catch (error) {
    console.error(`Error handling chat message: ${error}`);

    if (isFlightRequest) {
      const res = await searchFlights(
        extractedParams.origin,
        extractedParams.destination,
        extractedParams.departure_date,
        extractedParams.flight_type
      );
      return {
        reply: formatFallbackFlightResponse(res, extractedParams)
      };
    }

    return { reply: getRandomResponse() };
  }
}

export default handleChatMessage;
