/**
 * Request logging middleware using Morgan.
 * Uses 'dev' format in development and 'combined' in production.
 */

import morgan from 'morgan';
import { config } from '../config';

/** Morgan request logger configured per environment */
export const requestLogger = morgan(config.isDev ? 'dev' : 'combined');
