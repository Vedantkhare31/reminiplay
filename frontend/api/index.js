const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Auth & User routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', provider: 'vercel-serverless', timestamp: new Date() });
});

// Games API
app.get('/api/games', (req, res) => {
  res.json([
    { id: 1, name: 'Memory Lane', category: 'Memory' },
    { id: 2, name: 'Routine Builder', category: 'Executive' },
    { id: 3, name: 'Pattern Quest', category: 'Pattern' },
  ]);
});

app.post('/api/games/score', (req, res) => {
  const { gameId, score, userId } = req.body;
  res.json({
    message: 'Score saved successfully',
    data: { gameId, score, userId, timestamp: new Date() },
  });
});

app.get('/api', (req, res) => {
  res.json({ message: 'ReminiPlay Vercel Serverless API is active!' });
});

module.exports = app;
