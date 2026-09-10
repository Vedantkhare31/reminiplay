import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Trophy, Star, Clock, Calendar,
  TrendingUp, TrendingDown, Zap,
  Gamepad2, RefreshCw
} from 'lucide-react';
import GameHistoryService from '../services/GameHistoryService';

const GameHistory = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setLoading(true);
    const data = GameHistoryService.getHistory();
    setHistory(data);
    setStats(GameHistoryService.getStats());
    setLoading(false);
  };

  const clearHistory = () => {
    if (window.confirm(t('gameHistory.clearConfirm'))) {
      GameHistoryService.clearHistory();
      loadHistory();
    }
  };

  const getGameIcon = (gameName) => {
    const icons = {
      'Memory Lane': '🧠',
      'Routine Builder': '📋',
      'Pattern Quest': '🔮',
      'Story Weaver': '📖',
      'Face & Place': '👤',
      'Card Flip': '🎴',
      'Mindful Moments': '🧘',
      'Gesture Drawing': '✋',
    };
    return icons[gameName] || '🎮';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(h => h.gameName === filter);

  const gameNames = [...new Set(history.map(h => h.gameName))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
            {t('gameHistory.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{t('gameHistory.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={loadHistory}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('gameHistory.refresh')}
          </button>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              {t('gameHistory.clearAll')}
            </button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 text-center">
            <Gamepad2 className="w-6 h-6 text-primary-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalGames}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('gameHistory.totalGames')}</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.bestScore}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('gameHistory.bestScore')}</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Star className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgScore}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('gameHistory.averageScore')}</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Zap className="w-6 h-6 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalScore}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('gameHistory.totalPoints')}</p>
          </div>
        </div>
      )}

      {/* Game Stats */}
      {stats?.gameStats && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">{t('gameHistory.gamePerformance')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(stats.gameStats).map(([name, data]) => (
              <div key={name} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <span className="text-2xl">{getGameIcon(name)}</span>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{data.plays} {t('gameHistory.plays')}</p>
                <p className={`text-sm font-bold ${getScoreColor(data.avgScore)}`}>{data.avgScore} {t('gameHistory.avg')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      {history.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'all' ? 'bg-gradient-to-r from-primary-500 to-indigo-500 text-white shadow-lg' : 'glass-card'
            }`}
          >
            {t('gameHistory.allGames')}
          </button>
          {gameNames.map(name => (
            <button
              key={name}
              onClick={() => setFilter(name)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === name ? 'bg-gradient-to-r from-primary-500 to-indigo-500 text-white shadow-lg' : 'glass-card'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* History List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-gray-500">{t('gameHistory.loading')}</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-xl">
          <Gamepad2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">{t('gameHistory.noHistory')}</h3>
          <p className="text-gray-500 dark:text-gray-500">{t('gameHistory.noHistoryDesc')}</p>
          <Link to="/games" className="mt-4 inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
            🎮 {t('gameHistory.playGames')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((session, index) => (
            <div key={session.id || index} className="glass-card rounded-xl p-4 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">{getGameIcon(session.gameName)}</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{session.gameName}</p>
                    <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(session.timestamp).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(session.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('gameHistory.level')} {session.level || 1}
                  </span>
                  <span className={`text-lg font-bold ${getScoreColor(session.score / 100)}`}>
                    {session.score} {t('gameHistory.points')}
                  </span>
                  {session.score >= 80 && <TrendingUp className="w-5 h-5 text-emerald-500" />}
                  {session.score < 50 && <TrendingDown className="w-5 h-5 text-rose-500" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameHistory;