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
import acupressureRoutes from './routes/acupressureRoutes';
import sessionRoutes from './routes/sessionRoutes';
import videoRoutes from './routes/videoRoutes';

const app = express();

// Security headers
app.use(helmet());

// CORS — allow frontend origin + Authorization header for JWT + DELETE method + exposed total count header
app.use(cors({
  origin: config.allowedOrigin,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
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
app.use('/api', acupressureRoutes);
app.use('/api', sessionRoutes);
app.use('/api', videoRoutes);

// Global error handler — must be last
app.use(errorHandler);

export default app;
