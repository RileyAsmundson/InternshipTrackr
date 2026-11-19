
 // Import the Express application
const app = require('./app');

// Import the database connection
const { db } = require('./db');

// Set the server port
const port = process.env.PORT || 3000;

// Update the database before starting the server
async function startServer() {
  try {
    // Add application fields if they don't already exist
    await db.none(`
      ALTER TABLE IF EXISTS applications
      ADD COLUMN IF NOT EXISTS company VARCHAR(100),
      ADD COLUMN IF NOT EXISTS role VARCHAR(100),
      ADD COLUMN IF NOT EXISTS location VARCHAR(100);
    `);

    console.log('Database migration completed');

    // Start the server only after the migration succeeds
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server listening on port ${port}`);
    });

  } catch (error) {
    console.error('Database migration failed:', error);
    process.exit(1);
  }
}

startServer();
