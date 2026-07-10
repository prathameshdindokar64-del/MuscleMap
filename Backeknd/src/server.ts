import app from './app';
import { initializeDatabase } from './db/database';
import { runSchema } from './db/schema';
import { config } from './config';

async function start() {
  // Initialize database
  const db = initializeDatabase();
  runSchema(db);

  app.listen(config.port, () => {
    console.log(`MuscleMap backend running on http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
}

start();
