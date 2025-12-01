import { searchFlights } from './flightService.js';
import { getRandomResponse } from './responseService.js';

let chat = null;

export function setGeminiClient(client) {
  chat = client;
}

export async function handleChatMessage(messageText) {
  if (!messageText || typeof messageText !== 'string') {
    return { reply: getRandomResponse() };
  }

  if (messageText.substring(0, 5) != "[DEV]") {
    return { reply: getRandomResponse() };
  }

  console.log(`Message from client: ${messageText}`);

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
    console.log(`Initial chat response: \n${JSON.stringify(initialResponse)}\n`);

    const structuredResponse = initialResponse.response || initialResponse;
    const functionCallPart = structuredResponse.candidates?.[0]?.content?.parts?.find(part => part.functionCall);

    if (!functionCallPart) {
      // No function call detected, return the text response
      console.log("Model returned text, no function call detected.");
      const responseText = structuredResponse.candidates?.[0]?.content?.parts?.[0]?.text || getRandomResponse();
      return { reply: responseText };
    }

    const tool_call = functionCallPart.functionCall;
    console.log(`Tool call detected: ${JSON.stringify(tool_call)}`);

    let result;
    if (tool_call.name === 'searchFlights') {
      const args = tool_call.args;
      console.log(`Invoking searchFlights with arguments: ${JSON.stringify(args)}`);
      result = await searchFlights(
        args.origin,
        args.destination,
        args.departure_date,
        args.flight_type,
        args.return_date || '',
        args.exclude_airlines || '',
        args.include_airlines || '',
        args.max_price || '',
        args.sort_by || ''
      );
    }

    console.log(`tool_call result (stringified):\n${JSON.stringify(result)}\n`);

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
    return { reply: getRandomResponse() };
  }
}

export default handleChatMessage;
