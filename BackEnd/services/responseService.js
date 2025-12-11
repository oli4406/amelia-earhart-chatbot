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

export function getPredefinedResponse(userText) {
  const text = userText.toLowerCase();

  for (const category in predefinedResponses.about) {
    const entry = predefinedResponses.about[category];

    // Check each trigger phrase
    for (const trigger of entry.triggerWords) {
      if (text.includes(trigger)) {
        // Found a match
        const responses = entry.responses
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  }

  // No matches
  if (predefinedResponses.unknownQuestion && predefinedResponses.unknownQuestion.length > 0) {
    const fallback = predefinedResponses.unknownQuestion
    return fallback[Math.floor(Math.random() * fallback.length)];
  }

  return getRandomResponse('genericError');
}

export function getRandomResponse(category = 'genericError') {
  let response = "Blast! We've run into some unexpected atmospheric interference - the air is too thick with static! I couldn't get the flight information to come through. Let's give it a minute for the fog to lift before attempting that approach again.";

  if (predefinedResponses[category]) {
    const rand = Math.floor(Math.random() * predefinedResponses[category].length)
    response = predefinedResponses[category][rand];
  }

  return response;
}

export default getRandomResponse;
