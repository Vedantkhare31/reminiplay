const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();

// ============================================================
// CORS CONFIGURATION
// ============================================================

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5000',
  'https://reminiplay.vercel.app',
  /\.vercel\.app$/,
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
    const isAllowed = isLocal || allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// ============================================================
// APP SETUP
// ============================================================

const app = express();
const server = createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: corsOptions,
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./routes/authRoutes');

// ============================================================
// ROUTES
// ============================================================

// Authentication & User Data Sync
app.use('/api/auth', authRoutes);
app.use('/api/user', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'ReminiPlay API is running!' });
});

// Users API
app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Ram Kumar', age: 72, score: 78 },
    { id: 2, name: 'Sita Devi', age: 68, score: 45 },
    { id: 3, name: 'Mohan Singh', age: 75, score: 62 },
  ]);
});

// Games API
app.get('/api/games', (req, res) => {
  res.json([
    { id: 1, name: 'Memory Lane', category: 'Memory' },
    { id: 2, name: 'Routine Builder', category: 'Executive' },
    { id: 3, name: 'Pattern Quest', category: 'Pattern' },
  ]);
});

// Submit game score
app.post('/api/games/score', (req, res) => {
  const { gameId, score, userId } = req.body;
  res.json({
    message: 'Score saved successfully',
    data: { gameId, score, userId, timestamp: new Date() },
  });
});

// ============================================================
// SOCKET.IO
// ============================================================

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  socket.on('game-update', (data) => {
    console.log('Game update:', data);
    io.emit('game-progress', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});