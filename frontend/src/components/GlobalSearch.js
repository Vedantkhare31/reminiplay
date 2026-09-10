import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, X, Home, Gamepad2, Users, Bell, BarChart3, 
  Settings, Stethoscope, User, History, Brain, Clock, 
  Puzzle, BookOpen, Heart, Hand, Layers, ArrowRight
} from 'lucide-react';

const GlobalSearch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // All searchable items
  const searchableItems = [
    // Pages
    { id: 'p-dashboard', type: 'page', title: t('nav.dashboard'), subtitle: 'Page', path: '/dashboard', icon: Home, keywords: ['dashboard', 'home', 'main', 'डैशबोर्ड'] },
    { id: 'p-games', type: 'page', title: t('nav.games'), subtitle: 'Page', path: '/games', icon: Gamepad2, keywords: ['games', 'play', 'खेल'] },
    { id: 'p-doctor', type: 'page', title: t('nav.doctor'), subtitle: 'Page', path: '/doctor', icon: Stethoscope, keywords: ['doctor', 'medical', 'डॉक्टर'] },
    { id: 'p-patients', type: 'page', title: t('nav.patients'), subtitle: 'Page', path: '/patients', icon: Users, keywords: ['patients', 'मरीज'] },
    { id: 'p-reminders', type: 'page', title: t('nav.reminders'), subtitle: 'Page', path: '/reminders', icon: Bell, keywords: ['reminders', 'alerts', 'अनुस्मारक'] },
    { id: 'p-analytics', type: 'page', title: t('nav.analytics'), subtitle: 'Page', path: '/analytics', icon: BarChart3, keywords: ['analytics', 'stats', 'विश्लेषण'] },
    { id: 'p-history', type: 'page', title: 'Game History', subtitle: 'Page', path: '/game-history', icon: History, keywords: ['history', 'past games'] },
    { id: 'p-profile', type: 'page', title: t('nav.profile'), subtitle: 'Page', path: '/profile', icon: User, keywords: ['profile', 'account', 'प्रोफ़ाइल'] },
    { id: 'p-settings', type: 'page', title: t('nav.settings'), subtitle: 'Page', path: '/settings', icon: Settings, keywords: ['settings', 'preferences', 'सेटिंग्स'] },

    // Games
    { id: 'g-1', type: 'game', title: t('games.memoryLane'), subtitle: 'Game', path: '/game/1', icon: Brain, keywords: ['memory', 'lane', 'मेमोरी'] },
    { id: 'g-2', type: 'game', title: t('games.routineBuilder'), subtitle: 'Game', path: '/game/2', icon: Clock, keywords: ['routine', 'builder', 'रूटीन'] },
    { id: 'g-3', type: 'game', title: t('games.patternQuest'), subtitle: 'Game', path: '/game/3', icon: Puzzle, keywords: ['pattern', 'quest', 'पैटर्न'] },
    { id: 'g-4', type: 'game', title: t('games.storyWeaver'), subtitle: 'Game', path: '/game/4', icon: BookOpen, keywords: ['story', 'weaver', 'कहानी'] },
    { id: 'g-5', type: 'game', title: t('games.facePlace'), subtitle: 'Game', path: '/game/5', icon: Users, keywords: ['face', 'place', 'चेहरा'] },
    { id: 'g-6', type: 'game', title: 'Card Flip', subtitle: 'Game', path: '/game/6', icon: Layers, keywords: ['card', 'flip', 'memory'] },
    { id: 'g-7', type: 'game', title: t('games.mindfulMoments'), subtitle: 'Game', path: '/game/7', icon: Heart, keywords: ['mindful', 'meditation', 'माइंडफुल'] },
    { id: 'g-gesture', type: 'game', title: t('games.gestureDrawing'), subtitle: 'Game', path: '/game/gesture-drawing', icon: Hand, keywords: ['gesture', 'drawing', 'hand'] },
  ];

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const matches = searchableItems.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(q);
      const subtitleMatch = item.subtitle.toLowerCase().includes(q);
      const keywordMatch = item.keywords.some(k => k.toLowerCase().includes(q));
      return titleMatch || subtitleMatch || keywordMatch;
    }).slice(0, 8);

    setResults(matches);
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  const handleSelect = (item) => {
    navigate(item.path);
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  const handleBackdropClick = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 hover:border-primary-300 dark:hover:border-primary-700 transition-all text-gray-400 dark:text-gray-500 hover:text-primary-500 min-w-[200px] lg:min-w-[280px]"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm flex-1 text-left">Search anything...</span>
        <kbd className="hidden lg:inline-flex items-center px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-mono text-gray-500">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={handleBackdropClick}
        >
          <div 
            ref={containerRef}
            className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-[24px] shadow-[0_20px_80px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700/50 overflow-hidden animate-fade-in-up"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700/50">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, games, patients..."
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-base"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Close (Esc)"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {query.trim() === '' ? (
                // Show suggestions when empty
                <div className="p-4">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2">
                    Quick Links
                  </p>
                  <div className="space-y-1">
                    {searchableItems.slice(0, 6).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.subtitle}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="p-12 text-center">
                  <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    No results for "{query}"
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Try searching for "games", "patients", or "reminders"
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {results.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${
                        selectedIndex === index 
                          ? 'bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 ring-1 ring-primary-200 dark:ring-primary-800' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
                        item.type === 'game'
                          ? 'bg-gradient-to-br from-violet-500 to-purple-500'
                          : 'bg-gradient-to-br from-primary-500 to-indigo-500'
                      } text-white`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {item.subtitle}
                        </p>
                      </div>
                      {selectedIndex === index && (
                        <span className="text-xs text-primary-500 font-medium flex items-center gap-1">
                          Enter
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30">
              <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-mono">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-mono">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-mono">Esc</kbd>
                  Close
                </span>
              </div>
              {results.length > 0 && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {results.length} result{results.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;