import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Menu, Sun, Moon, Bell, User, LogOut, ChevronDown, 
  Settings, History
} from 'lucide-react';
import LanguageSwitcher from '../LanguageSwitcher';
import GlobalSearch from '../GlobalSearch';

const Header = ({ toggleSidebar, sidebarOpen = true }) => {
  const { t } = useTranslation();
  const { darkMode, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header 
      className={`fixed top-0 right-0 z-50 px-6 py-4 transition-all duration-500 ${
        sidebarOpen ? 'left-[276px]' : 'left-[104px]'
      }`}
    >
      <div className="rounded-[22px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] border border-gray-100/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between px-5 py-3">
          
          {/* Left: Menu + Search */}
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={toggleSidebar}
              className="p-2.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Global Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md">
              <GlobalSearch />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
            
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all hover:scale-105"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Notifications */}
            <button className="relative p-2.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all hover:scale-105">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 pl-1 pr-3 py-1 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all"
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {user?.role || 'Patient'}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDropdown(false)}
                  ></div>
                  <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-[22px] shadow-[0_10px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-700/50 py-2 z-20 animate-fade-in-up overflow-hidden">
                    
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email || user?.phone || 'user@example.com'}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center px-4 py-2.5 mx-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all text-gray-700 dark:text-gray-300 text-sm"
                      >
                        <User className="w-4 h-4 mr-3" />
                        {t('nav.profile')}
                      </Link>
                      <Link
                        to="/game-history"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center px-4 py-2.5 mx-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all text-gray-700 dark:text-gray-300 text-sm"
                      >
                        <History className="w-4 h-4 mr-3" />
                        {t('nav.gameHistory')}
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center px-4 py-2.5 mx-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all text-gray-700 dark:text-gray-300 text-sm"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        {t('nav.settings')}
                      </Link>
                    </div>

                    <div className="mx-4 h-px bg-gray-100 dark:bg-gray-700/50"></div>

                    <div className="py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 mx-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-red-600 dark:text-red-400 text-sm"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;