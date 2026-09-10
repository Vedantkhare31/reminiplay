// This is a mock database for beginners
// It stores data in memory (will reset when server restarts)

const users = [
  { id: 1, name: 'Ram Kumar', email: 'ram@test.com', password: 'password123' },
  { id: 2, name: 'Sita Devi', email: 'sita@test.com', password: 'password123' }
];

const gameScores = [
  { id: 1, userId: 1, gameId: 1, score: 85, date: '2024-01-15' },
  { id: 2, userId: 1, gameId: 2, score: 72, date: '2024-01-14' },
  { id: 3, userId: 2, gameId: 1, score: 90, date: '2024-01-15' }
];

module.exports = { users, gameScores };