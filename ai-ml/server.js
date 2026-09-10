const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

console.log('🤖 AI Service Starting...');

// Simple AI rules-based system
app.post('/api/adapt-difficulty', (req, res) => {
  console.log('📊 Adapt Difficulty Request:', req.body);
  
  const { score, accuracy, previousDifficulty } = req.body;
  
  let newDifficulty = previousDifficulty || 1;
  
  // Simple AI rules
  if (score > 80 && accuracy > 0.8) {
    newDifficulty = Math.min(previousDifficulty + 1, 10);
  } else if (score < 50 || accuracy < 0.5) {
    newDifficulty = Math.max(previousDifficulty - 1, 1);
  }
  
  res.json({
    difficulty: newDifficulty,
    recommendation: newDifficulty > previousDifficulty ? 
      'Great job! Level increased! 🎉' : 
      'Keep practicing, you\'re doing well! 💪'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'AI Service is running! 🚀',
    timestamp: new Date().toISOString()
  });
});

// Simple test endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'ReminiPlay AI Service is running!',
    endpoints: [
      'POST /api/adapt-difficulty',
      'GET /health',
      'GET /'
    ]
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🤖 AI Service running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`✅ All endpoints ready!`);
});