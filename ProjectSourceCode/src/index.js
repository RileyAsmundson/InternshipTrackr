// Import the Express application
const app = require('./app');

// Set the server port
const port = process.env.PORT || 3000;

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});