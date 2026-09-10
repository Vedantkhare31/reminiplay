// Game History Service - Manages game session data

class GameHistoryService {
  constructor() {
    this.storageKey = 'reminiplay_game_history';
  }

  // Get all game history
  getHistory() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // Save game session
  saveSession(session) {
    const history = this.getHistory();
    const newSession = {
      id: Date.now(),
      ...session,
      timestamp: new Date().toISOString(),
    };
    history.unshift(newSession); // Add to beginning
    localStorage.setItem(this.storageKey, JSON.stringify(history));
    return newSession;
  }

  // Get sessions for a specific game
  getGameSessions(gameId) {
    const history = this.getHistory();
    return history.filter(s => s.gameId === gameId);
  }

  // Get sessions for a specific user
  getUserSessions(userId) {
    const history = this.getHistory();
    return history.filter(s => s.userId === userId);
  }

  // Get statistics
  getStats() {
    const history = this.getHistory();
    if (history.length === 0) return null;

    const totalGames = history.length;
    const totalScore = history.reduce((sum, s) => sum + (s.score || 0), 0);
    const avgScore = Math.round(totalScore / totalGames);
    const bestScore = Math.max(...history.map(s => s.score || 0));
    const bestStreak = this.getBestStreak();

    // Game-specific stats
    const gameStats = {};
    history.forEach(s => {
      if (!gameStats[s.gameName]) {
        gameStats[s.gameName] = { plays: 0, totalScore: 0, bestScore: 0 };
      }
      gameStats[s.gameName].plays++;
      gameStats[s.gameName].totalScore += (s.score || 0);
      if (s.score > gameStats[s.gameName].bestScore) {
        gameStats[s.gameName].bestScore = s.score;
      }
    });

    // Calculate average per game
    Object.keys(gameStats).forEach(key => {
      gameStats[key].avgScore = Math.round(gameStats[key].totalScore / gameStats[key].plays);
    });

    return {
      totalGames,
      totalScore,
      avgScore,
      bestScore,
      bestStreak,
      gameStats,
      recentGames: history.slice(0, 10),
    };
  }

  // Get best streak
  getBestStreak() {
    try {
      return parseInt(localStorage.getItem('gestureDrawing_bestStreak')) || 0;
    } catch (e) {
      return 0;
    }
  }

  // Clear history
  clearHistory() {
    localStorage.removeItem(this.storageKey);
  }

  // Get achievements
  getAchievements() {
    const stats = this.getStats();
    if (!stats) return [];

    const achievements = [];

    // First Game
    if (stats.totalGames >= 1) {
      achievements.push({
        id: 'first_game',
        name: 'First Step',
        description: 'Played your first game',
        icon: '🎮',
        unlocked: true,
        date: stats.recentGames[stats.recentGames.length - 1]?.timestamp,
      });
    }

    // 10 Games
    if (stats.totalGames >= 10) {
      achievements.push({
        id: 'ten_games',
        name: 'Dedicated Player',
        description: 'Played 10 games',
        icon: '🏆',
        unlocked: true,
      });
    }

    // 50 Games
    if (stats.totalGames >= 50) {
      achievements.push({
        id: 'fifty_games',
        name: 'Master Player',
        description: 'Played 50 games',
        icon: '👑',
        unlocked: true,
      });
    }

    // Score achievements
    if (stats.bestScore >= 100) {
      achievements.push({
        id: 'score_100',
        name: 'Century',
        description: 'Scored 100+ points in a game',
        icon: '⭐',
        unlocked: true,
      });
    }

    if (stats.bestScore >= 500) {
      achievements.push({
        id: 'score_500',
        name: 'Legendary',
        description: 'Scored 500+ points in a game',
        icon: '🌟',
        unlocked: true,
      });
    }

    // Streak achievements
    if (stats.bestStreak >= 3) {
      achievements.push({
        id: 'streak_3',
        name: 'On Fire',
        description: '3 game winning streak',
        icon: '🔥',
        unlocked: true,
      });
    }

    if (stats.bestStreak >= 10) {
      achievements.push({
        id: 'streak_10',
        name: 'Unstoppable',
        description: '10 game winning streak',
        icon: '⚡',
        unlocked: true,
      });
    }

    return achievements;
  }
}

export default new GameHistoryService();