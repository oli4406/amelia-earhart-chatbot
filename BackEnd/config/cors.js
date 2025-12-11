/**
 * CORS configuration for the backend server.
 * Defines allowed origins, methods, and credential handling.
 * @module config/cors
 */
import cors from 'cors';

/**
 * CORS options object passed to the cors middleware.
 * @typedef {Object} CorsOptions
 * @property {string} origin - Allowed frontend origin.
 * @property {string[]} methods - Permitted HTTP methods.
 * @property {boolean} credentials - Whether cookies/auth headers may be sent.
 */
export const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
