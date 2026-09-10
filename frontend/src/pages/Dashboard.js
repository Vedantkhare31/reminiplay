import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Brain, Activity, Trophy, Clock, TrendingUp, 
  Gamepad2, Star, Zap, Award, ArrowUpRight
} from 'lucide-react';

const Dashboard = () => {
  const { t } = useTranslation();

  const stats = [
    { 
      label: t('dashboard.cognitiveScore'), 
      value: '78%', 
      icon: Brain, 
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      change: '+12%',
      positive: true
    },
    { 
      label: t('dashboard.gamesPlayed'), 
      value: '24', 
      icon: Activity, 
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      change: '+8',
      positive: true
    },
    { 
      label: t('dashboard.achievements'), 
      value: '12', 
      icon: Trophy, 
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      change: '+3',
      positive: true
    },
    { 
      label: t('dashboard.streak'), 
      value: '7', 
      icon: Clock, 
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      change: 'days',
      positive: true
    },
  ];

  const recentGames = [
    { name: t('games.memoryLane'), score: 85, date: t('dashboard.today'), icon: '🧠', color: 'from-blue-500 to-cyan-500' },
    { name: t('games.routineBuilder'), score: 72, date: t('dashboard.yesterday'), icon: '📋', color: 'from-purple-500 to-pink-500' },
    { name: t('games.patternQuest'), score: 90, date: '2 ' + t('dashboard.daysAgo'), icon: '🔮', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.title')}
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <div className="pill-tab active">
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
            Live
          </div>
          <div className="pill-tab">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            +12% {t('dashboard.improvement')}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="rounded-[24px] bg-white dark:bg-gray-800 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(79,109,245,0.15)] transition-all duration-300 hover:-translate-y-1 group border border-gray-100/50 dark:border-gray-700/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`flex items-center text-xs font-bold ${stat.positive ? 'text-emerald-500' : 'text-rose-500'} bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full`}>
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {stat.change}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Games */}
        <div className="lg:col-span-2 rounded-[28px] bg-white dark:bg-gray-800 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] border border-gray-100/50 dark:border-gray-700/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('dashboard.recentGames')}
            </h2>
            <Link 
              to="/game-history" 
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center group"
            >
              View All 
              <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentGames.map((game, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl hover:bg-gray-100/50 dark:hover:bg-gray-900/50 transition-all group cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                    {game.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{game.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{game.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${game.score >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {game.score}%
                  </p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-[28px] bg-gradient-to-br from-primary-500 to-indigo-600 p-6 shadow-[0_8px_40px_rgba(79,109,245,0.4)] text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full"></div>
          
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-2">Ready to Play?</h3>
            <p className="text-sm text-white/80 mb-6">
              Continue your cognitive training journey with fun games!
            </p>
            <Link
              to="/games"
              className="inline-flex items-center px-5 py-3 bg-white text-primary-600 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all shadow-lg hover:scale-105"
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              {t('home.playGames')}
            </Link>
          </div>
        </div>
      </div>

      {/* Achievements Row */}
      <div className="rounded-[28px] bg-white dark:bg-gray-800 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] border border-gray-100/50 dark:border-gray-700/30">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t('dashboard.achievements')}
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            { icon: '🏆', name: 'First Step', unlocked: true },
            { icon: '⭐', name: 'Century', unlocked: true },
            { icon: '🔥', name: 'On Fire', unlocked: true },
            { icon: '👑', name: 'Master', unlocked: false },
            { icon: '⚡', name: 'Unstoppable', unlocked: false },
            { icon: '🌟', name: 'Legendary', unlocked: false },
          ].map((ach, i) => (
            <div 
              key={i} 
              className={`flex-shrink-0 w-24 h-24 rounded-2xl flex flex-col items-center justify-center ${
                ach.unlocked 
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800' 
                  : 'bg-gray-50 dark:bg-gray-900/30 border-2 border-gray-200 dark:border-gray-700 opacity-50'
              } transition-all hover:scale-105 cursor-pointer`}
            >
              <span className={`text-3xl mb-1 ${!ach.unlocked ? 'grayscale' : ''}`}>{ach.icon}</span>
              <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 text-center px-1">
                {ach.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;