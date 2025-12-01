import express from 'express';
import { handleChatMessage } from '../services/chatService.js';
import { getRandomResponse } from '../services/responseService.js';

const router = express.Router();

router.post('/message', async (req, res) => {
  try {
    if (!req.body || typeof req.body.message !== 'string') {
      return res.status(400).send({ reply: getRandomResponse() });
    }

    const result = await handleChatMessage(req.body.message);
    return res.send(result);
  } catch (error) {
    console.error(`Error in chat route: ${error}`);
    return res.status(500).send({ reply: getRandomResponse() });
  }
});

export default router;
