const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'ReminiPlay API is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// API Routes
app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Ram Kumar', age: 72, score: 78 },
    { id: 2, name: 'Sita Devi', age: 68, score: 45 },
    { id: 3, name: 'Mohan Singh', age: 75, score: 62 }
  ]);
});

app.get('/api/games', (req, res) => {
  res.json([
    { id: 1, name: 'Memory Lane', category: 'Memory' },
    { id: 2, name: 'Routine Builder', category: 'Executive' },
    { id: 3, name: 'Pattern Quest', category: 'Pattern' }
  ]);
});

app.post('/api/games/score', (req, res) => {
  const { gameId, score, userId } = req.body;
  res.json({ 
    message: 'Score saved successfully',
    data: { gameId, score, userId, timestamp: new Date() }
  });
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('game-update', (data) => {
    console.log('Game update:', data);
    io.emit('game-progress', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});