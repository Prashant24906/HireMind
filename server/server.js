const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI service health proxy — lets the frontend check if ML service is up
app.get('/api/ai-health', async (req, res) => {
  try {
    const aiUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
    const { data } = await axios.get(`${aiUrl}/health`, { timeout: 5000 });
    res.json({ status: 'ok', ai: data });
  } catch (error) {
    res.json({ status: 'unreachable', message: 'AI service is not running' });
  }
});

// Mount routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/jobs', require('./routes/job.routes'));
app.use('/api/interview', require('./routes/interview.routes'));
app.use('/api/results', require('./routes/results.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Check AI service connectivity on startup
  const aiUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
  try {
    const { data } = await axios.get(`${aiUrl}/health`, { timeout: 5000 });
    console.log(`✅ AI service connected at ${aiUrl} (provider: ${data.provider})`);
  } catch (err) {
    console.warn(`⚠️  AI service not reachable at ${aiUrl} — scoring will return nulls until it's started`);
  }
});

module.exports = app;
