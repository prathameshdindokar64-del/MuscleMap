import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config';

import healthRoutes from './routes/healthRoutes';
import regionRoutes from './routes/regionRoutes';
import painRoutes from './routes/painRoutes';
import historyRoutes from './routes/historyRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import authRoutes from './routes/authRoutes';
import pdfRoutes from './routes/pdfRoutes';

const app = express();

// Security headers
app.use(helmet());

// CORS — allow frontend origin + Authorization header for JWT
app.use(cors({
  origin: config.allowedOrigin,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

// Body parsing
app.use(express.json());

// Request logging
app.use(requestLogger);

// Routes
app.use('/api', healthRoutes);
app.use('/api', regionRoutes);
app.use('/api', painRoutes);
app.use('/api', historyRoutes);
app.use('/api', exerciseRoutes);
app.use('/api', authRoutes);
app.use('/api', pdfRoutes);

// Global error handler — must be last
app.use(errorHandler);

export default app;
