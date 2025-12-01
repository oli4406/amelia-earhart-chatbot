import cors from 'cors';

export const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
