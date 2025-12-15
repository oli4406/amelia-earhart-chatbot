/**
 * Chat history routes.
 *
 * Provides authenticated REST endpoints for creating, retrieving,
 * and deleting chat message history belonging to the currently
 * authenticated user.
 *
 * All routes in this module:
 * - Require a valid JWT Bearer token
 * - Scope database operations to `req.user.id`
 * - Never allow cross-user access
 *
 * Mounted at:
 *   /api/messages
 *
 * @module routes/history
 */
import express from 'express';
import { Types } from 'mongoose';
import Message from '../models/Message.js';
import TokenVerificationSecret from '../middleware/auth.js';

/**
 * Express router instance for chat history endpoints.
 *
 * @type {Object} Express Router
 */
const router = express.Router();

/**
 * Get chat history for the authenticated user.
 *
 * Returns all stored chat messages for the current user,
 * ordered from newest to oldest by creation timestamp.
 *
 * Authentication:
 * - Requires Authorization: Bearer <JWT>
 *
 * @middleware TokenVerificationSecret
 *
 * @route GET /api/messages
 * @returns {Array<Message>} 200 - List of chat messages
 * @returns {Object} 500 - Server error
 */

router.get('/', TokenVerificationSecret, async (req, res) => {
    try {
        const messages = await Message.find({ userId: req.user.id })
            .sort({ createdAt: -1 })

        res.json(messages)
    } catch (err) {
        console.error('Failed to fetch message history', err);
        res.status(500).json({ error: 'Failed to fetch message history' });
    }
});

/**
 * Persist a single chat exchange to history.
 *
 * Saves a question/answer pair for the authenticated user.
 * The timestamp is generated automatically by MongoDB.
 *
 * Authentication:
 * - Requires Authorization: Bearer <JWT>
 *
 * @middleware TokenVerificationSecret
 *
 * @route POST /api/messages
 * @param {Object} req.body
 * @param {string} req.body.question - User's chat prompt
 * @param {string} req.body.answer - Bot-generated response
 *
 * @returns {Message} 201 - Created message document
 * @returns {Object} 400 - Invalid payload
 * @returns {Object} 500 - Server error
 */
router.post('/', TokenVerificationSecret, async (req, res) => {
    const { question, answer } = req.body

    if (!question || !answer) {
        return res.status(400).json({ error: 'Invalid paylad' })
    }

    try {
        const message = await Message.create({
            userId: req.user.id,
            question,
            answer
        })

        res.status(201).json(message)
    } catch (err) {
        console.error('Failed to save message:', err)
        res.status(500).json({ error: 'Failed to save message' })
    }
})

/**
 * Delete a single chat message from history.
 *
 * Deletes a message only if:
 * - The message exists
 * - The message belongs to the authenticated user
 *
 * Authentication:
 * - Requires Authorization: Bearer <JWT>
 *
 * @middleware TokenVerificationSecret
 *
 * @route DELETE /api/messages/:id
 * @param {string} req.params.id - MongoDB ObjectId of the message
 *
 * @returns {void} 204 - Successfully deleted
 * @returns {Object} 400 - Invalid message ID
 * @returns {Object} 404 - Message not found
 * @returns {Object} 500 - Server error
 */
router.delete('/:id', TokenVerificationSecret, async (req, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid message ID' });
    }

    try {
        const deleted = await Message.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        })

        if (!deleted) {
            return res.status(404).json({ error: 'Message not found' })
        }

        res.sendStatus(204)
    } catch (err) {
        console.error('Failed to delete message:', err);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

/**
 * Delete all chat history for the authenticated user.
 *
 * Permanently removes every stored chat message
 * belonging to the current user.
 *
 * Authentication:
 * - Requires Authorization: Bearer <JWT>
 *
 * @middleware TokenVerificationSecret
 *
 * @route DELETE /api/messages
 * @returns {void} 204 - History cleared
 * @returns {Object} 500 - Server error
 */
router.delete('/', TokenVerificationSecret, async (req, res) => {
    try {
        await Message.deleteMany({ userId: req.user.id });
        res.sendStatus(204);
    } catch (err) {
        console.error('Failed to clear message history:', err);
        res.status(500).json({ error: 'Failed to clear message history' });
    }
});

export default router;