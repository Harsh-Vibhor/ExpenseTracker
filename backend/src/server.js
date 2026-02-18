import app from './app.js';
import { env } from './config/env.js';

// Eagerly import supabase so any missing-env errors surface at startup
import './config/supabase.js';

const start = async () => {
  try {
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
