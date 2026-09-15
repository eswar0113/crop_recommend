const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const landRoutes = require('./routes/landRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const historyRoutes = require('./routes/historyRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lands', landRoutes);
app.use('/api', predictionRoutes);
app.use('/api', historyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Crop Recommendation Backend API',
    database: db.getIsDbConnected() ? 'connected' : 'disconnected (using fallback mode)',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Backend Error]', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected server error occurred.'
  });
});

// Initialize database & start server
async function startServer() {
  await db.initDb();
  app.listen(PORT, () => {
    console.log(`[Backend API] Express server running on port ${PORT}`);
    console.log(`[Backend API] API endpoints: http://localhost:${PORT}/api/predict & http://localhost:${PORT}/api/history`);
  });
}

startServer();
