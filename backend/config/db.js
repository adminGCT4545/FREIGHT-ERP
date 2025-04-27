require('dotenv').config(); // Load environment variables from .env file
const { Pool } = require('pg');

// Validate essential environment variables
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`Error: Environment variable ${varName} is not set.`);
    // In a real application, you might want to exit or throw a more specific error
    // For now, we'll log and continue, but the pool connection will likely fail.
  }
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10), // Default to 5432 if not set
  // Optional: Add connection pool settings like max connections, idle timeout, etc.
  // max: 20,
  // idleTimeoutMillis: 30000,
  // connectionTimeoutMillis: 2000,
});

// Optional: Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Successfully connected to the database at:', res.rows[0].now);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Export the pool itself if direct access is needed
};