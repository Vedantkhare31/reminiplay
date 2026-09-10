import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Brain, Clock, Puzzle, BookOpen, Users, Heart, Star, Hand, Sparkles , Layers} from 'lucide-react';

const Games = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');

  const games = [
    { id: 1, name: t('games.memoryLane'), description: t('games.memoryLaneDesc'), icon: Brain, difficulty: t('games.difficulty.easy'), color: 'from-blue-500 to-cyan-500', plays: 1243, rating: 4.8, path: '/game/1', category: 'memory' },
    { id: 2, name: t('games.routineBuilder'), description: t('games.routineBuilderDesc'), icon: Clock, difficulty: t('games.difficulty.medium'), color: 'from-purple-500 to-pink-500', plays: 876, rating: 4.6, path: '/game/2', category: 'executive' },
    { id: 3, name: t('games.patternQuest'), description: t('games.patternQuestDesc'), icon: Puzzle, difficulty: t('games.difficulty.medium'), color: 'from-green-500 to-emerald-500', plays: 654, rating: 4.7, path: '/game/3', category: 'pattern' },
    { id: 4, name: t('games.storyWeaver'), description: t('games.storyWeaverDesc'), icon: BookOpen, difficulty: t('games.difficulty.hard'), color: 'from-orange-500 to-red-500', plays: 432, rating: 4.9, path: '/game/4', category: 'narrative' },
    { id: 5, name: t('games.facePlace'), description: t('games.facePlaceDesc'), icon: Users, difficulty: t('games.difficulty.easy'), color: 'from-indigo-500 to-violet-500', plays: 987, rating: 4.5, path: '/game/5', category: 'recognition' },
    {id: 6, name: 'Card Flip', description: 'Flip cards to find matching pairs before time runs out', icon: Layers, difficulty: t('games.difficulty.medium'), color: 'from-violet-500 to-purple-500',  plays: 542, rating: 4.8, path: '/game/6', category: 'memory'},
    { id: 7, name: t('games.mindfulMoments'), description: t('games.mindfulMomentsDesc'), icon: Heart, difficulty: t('games.difficulty.medium'), color: 'from-rose-500 to-pink-500', plays: 321, rating: 4.9, path: '/game/6', category: 'focus' },
   { id:'gesture-drawing' , name: t('games.gestureDrawing'), description: t('games.gestureDrawingDesc'), icon: Hand, difficulty: t('games.difficulty.medium'), color: 'from-indigo-500 to-purple-500', plays: 234, rating: 4.9, path: '/game/gesture-drawing', category: 'gesture' },
  ];

  const filteredGames = filter === 'all' ? games : games.filter(g => g.category === filter);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
            {t('games.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Choose a game to train your brain</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <div className="pill-tab">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {games.length} Games
          </div>
          <div className="pill-tab">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            4.8 Avg
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button 
          onClick={() => setFilter('all')}
          className={`pill-tab ${filter === 'all' ? 'active' : ''}`}
        >
          All Games
          <span className="badge">{games.length}</span>
        </button>
        <button 
          onClick={() => setFilter('memory')}
          className={`pill-tab ${filter === 'memory' ? 'active' : ''}`}
        >
          Memory
        </button>
        <button 
          onClick={() => setFilter('executive')}
          className={`pill-tab ${filter === 'executive' ? 'active' : ''}`}
        >
          Executive
        </button>
        <button 
          onClick={() => setFilter('pattern')}
          className={`pill-tab ${filter === 'pattern' ? 'active' : ''}`}
        >
          Pattern
        </button>
        <button 
          onClick={() => setFilter('focus')}
          className={`pill-tab ${filter === 'focus' ? 'active' : ''}`}
        >
          Focus
        </button>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGames.map((game, index) => (
          <Link
            key={game.id}
            to={game.path}
            className="group rounded-[28px] bg-white dark:bg-gray-800 overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_50px_rgba(79,109,245,0.2)] transition-all duration-300 hover:-translate-y-2 border border-gray-100/50 dark:border-gray-700/30"
          >
            {/* Card Header with Gradient */}
            <div className={`relative h-36 bg-gradient-to-br ${game.color} flex items-center justify-center overflow-hidden`}>
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white rounded-full"></div>
                <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white rounded-full"></div>
              </div>
              <game.icon className="w-16 h-16 text-white relative z-10 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full">
                <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                <span className="text-xs font-bold text-white">{game.rating}</span>
              </div>
              <div className="absolute top-4 left-4 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full">
                <span className="text-xs font-bold text-white">{game.difficulty}</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-primary-600 transition-colors">
                {game.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                {game.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {game.plays} {t('games.plays')}
                </span>
                <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-primary-500/30 group-hover:shadow-lg group-hover:shadow-primary-500/40 transition-all">
                  {t('games.playNow')} →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Games;