import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Config imports
import { corsMiddleware } from './config/cors.js';
import { connectDatabase } from './config/database.js';

// Middleware imports
import { requestLogger } from './middleware/logger.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js';

const app = express();
const port = Number(globalThis.process.env.PORT || 3000);

// Middleware setup
app.use(express.json());
app.use(corsMiddleware);
app.use(requestLogger);

// Debug route
app.get('/debug/headers', (req, res) => res.json({ headers: req.headers }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);

// Root endpoint
app.get('/', (req, res) => {
  const logMessage = `IP ${req.ip} accessed the backend root endpoint.`;
  console.log(logMessage);
  res.send('Amelia Earhart Chatbot Backend is running.');
});

// Database connection and server startup
connectDatabase()
  .then(async () => {
    // Load .env from project root (one level up from BackEnd)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    dotenv.config({ path: path.join(__dirname, '..', '.env') });

    // Initialize Gemini and inject client into chat service
    try {
      const { initializeGemini } = await import('./config/gemini.js');
      const { setGeminiClient } = await import('./services/chatService.js');
      const gemini = initializeGemini();
      setGeminiClient(gemini.chat);
      console.log('Gemini client initialized and injected into chat service');
      // Log presence of SerpAPI key for debugging
      console.log('SERPAPI_API_KEY set:', Boolean(globalThis.process.env.SERPAPI_API_KEY));
    } catch (err) {
      console.error('Failed to initialize Gemini on startup:', err);
    }

    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to database. Server will not start.', error);
    globalThis.process.exit(1);
  });