import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let randomResponses = [];

const responsesPath = path.join(__dirname, '..', 'predefinedResponses.json');
console.log('Loading predefined responses from:', responsesPath);

fs.readFile(responsesPath, (err, data) => {
  if (err) {
    console.error('Error loading predefined responses:', err);
    return;
  }
  try {
    randomResponses = JSON.parse(data)[0];
    console.log('Predefined responses loaded successfully');
  } catch (parseError) {
    console.error('Error parsing predefined responses JSON:', parseError);
  }
});

export function getRandomResponse(category = 'genericError') {
  let response = "Blast! We've run into some unexpected atmospheric interference - the air is too thick with static! I couldn't get the flight information to come through. Let's give it a minute for the fog to lift before attempting that approach again.";

  if (randomResponses[category]) {
    const rand = Math.floor(Math.random() * randomResponses[category].length)
    response = randomResponses[category][rand];
  }

  return response;
}

export default getRandomResponse;
