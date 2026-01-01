import app from './app.js';
import { env } from './config/env.js';
import { testConnection } from './config/db.js';

const start = async () => {
  try {
    await testConnection();
    console.log('Database connection established');

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
