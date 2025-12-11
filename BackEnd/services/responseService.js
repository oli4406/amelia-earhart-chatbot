/**
 * Loads predefined chatbot responses from predefinedResponses.json.
 * Stores categories such as greetings, errors, unknown quieries, etc.
 * Provides random and category-specific replies.
 * @module services/responseService
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let predefinedResponses = [];

const responsesPath = path.join(__dirname, '..', 'predefinedResponses.json');
console.log('Loading predefined responses from:', responsesPath);

fs.readFile(responsesPath, (err, data) => {
  if (err) {
    console.error('Error loading predefined responses:', err);
    return;
  }
  try {
    predefinedResponses = JSON.parse(data)[0];
    console.log('Predefined responses loaded successfully');
  } catch (parseError) {
    console.error('Error parsing predefined responses JSON:', parseError);
  }
});

/**
 * Returns a predefined response based on trigger words contained in user text.
 * @param {string} userText - Raw user message.
 * @returns {[string|null, string|null]} Tuple of (response, fallback).
 */
export function getPredefinedResponse(userText) {
  const text = userText.toLowerCase();

  for (const category in predefinedResponses.about) {
    const entry = predefinedResponses.about[category];

    // Check each trigger phrase
    for (const trigger of entry.triggerWords) {
      if (text.includes(trigger)) {
        // Found a match
        const responses = entry.responses
        return [responses[Math.floor(Math.random() * responses.length)], null]; // returns two values: response, fallback - allows handling of fallback in chatService
      }
    }
  }

  // No matches
  if (predefinedResponses.unknownQuestion && predefinedResponses.unknownQuestion.length > 0) {
    const fallback = predefinedResponses.unknownQuestion
    return [null, fallback[Math.floor(Math.random() * fallback.length)]]; // return null first so chatService knows the interaction failed
  }

  return [null, getRandomResponse('genericError')]; // return null first so chatService knows the interaction failed
}

/**
 * Returns a random response from a given category, or a generic error fallback.
 * @param {string} [category='genericError'] - Response category
 * @returns {string} A random response string.
 */
export function getRandomResponse(category = 'genericError') {
  let response = "Blast! We've run into some unexpected atmospheric interference - the air is too thick with static! I couldn't get the flight information to come through. Let's give it a minute for the fog to lift before attempting that approach again.";

  if (predefinedResponses[category]) {
    const rand = Math.floor(Math.random() * predefinedResponses[category].length)
    response = predefinedResponses[category][rand];
  }

  return response;
}

export default getRandomResponse;
