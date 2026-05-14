require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const app = require('./app');
const PORT = process.env.PORT || 3000;
const { verifyDatabaseStartup } = require('./config/db');

async function startServer() {
  try {
    await verifyDatabaseStartup();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[startup] Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
