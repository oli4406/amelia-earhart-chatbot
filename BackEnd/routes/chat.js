/**
 * Chat route controller.
 * Forwards incoming user messages to chatService for handling.
 * @module routes/chat
 */
import express from 'express';
import { handleChatMessage } from '../services/chatService.js';
import { getRandomResponse } from '../services/responseService.js';

const router = express.Router();

/**
 * POST /api/chat/message
 * Validates input, runs chatService, returns structured response.
 */
router.post('/message', async (req, res) => {
  try {
    if (!req.body || typeof req.body.message !== 'string') {
      return res.status(400).send({ reply: getRandomResponse() });
    }
    if (req.body.message.length > 2000) {
      return res.status(413).send({ reply: "Message too long." })
    }

    const result = await handleChatMessage(req.body.message);
    return res.send(result);
  } catch (error) {
    console.error(`Error in chat route: ${error}`);
    return res.status(500).send({ reply: getRandomResponse() });
  }
});

export default router;
