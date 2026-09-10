import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, Gamepad2, Users, Bell, BarChart3, 
  Settings, Stethoscope, HelpCircle,
  User, History
} from 'lucide-react';
import HelpSupportModal from '../HelpSupportModal';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const [showHelp, setShowHelp] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: Home, label: t('nav.dashboard') },
    { path: '/games', icon: Gamepad2, label: t('nav.games') },
    { path: '/doctor', icon: Stethoscope, label: t('nav.doctor') },
    { path: '/patients', icon: Users, label: t('nav.patients') },
    { path: '/reminders', icon: Bell, label: t('nav.reminders') },
    { path: '/analytics', icon: BarChart3, label: t('nav.analytics') },
    { path: '/game-history', icon: History, label: t('nav.gameHistory') },
  ];

  const bottomItems = [
    { path: '/settings', icon: Settings, label: t('nav.settings') },
    { path: '/profile', icon: User, label: t('nav.profile') },
  ];

  return (
    <>
      <aside 
        className={`fixed left-0 top-0 h-full z-40 transition-all duration-500 ease-out ${
          isOpen ? 'w-[260px]' : 'w-[88px]'
        }`}
      >
        {/* Floating Rounded Sidebar */}
        <div className="h-[calc(100vh-32px)] m-4 rounded-[28px] bg-white dark:bg-gray-800 shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700/50">
          
          {/* Logo Section */}
          <div className={`flex items-center py-5 transition-all duration-300 ${isOpen ? 'px-5 justify-start' : 'justify-center'}`}>
            <div className="relative flex-shrink-0">
              <img src="/logo.png" alt="ReminiPlay" className="h-12 w-12 rounded-2xl" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            {isOpen && (
              <div className="ml-3 animate-fade-in">
                <p className="text-lg font-bold bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent whitespace-nowrap">
                  ReminiPlay
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Cognitive Care
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mx-4 mb-2 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>

          {/* Main Navigation - NO scrollbar */}
          <nav className={`flex-1 py-2 ${isOpen ? 'px-3' : 'px-3'} space-y-1`}>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.label}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-2xl transition-all duration-300 ${
                    isOpen 
                      ? 'w-full h-12 px-3 gap-3' 
                      : 'w-12 h-12 mx-auto justify-center'
                  } ${
                    isActive
                      ? 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-lg shadow-primary-500/40'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-primary-500'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    {isOpen && (
                      <span className="text-sm font-medium whitespace-nowrap animate-fade-in">
                        {item.label}
                      </span>
                    )}
                    {/* Tooltip when collapsed */}
                    {!isOpen && (
                      <span className="absolute left-[70px] px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                        {item.label}
                      </span>
                    )}
                    {isActive && !isOpen && (
                      <div className="absolute -left-3 w-1 h-6 bg-primary-500 rounded-r-full"></div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Divider */}
          <div className="mx-4 mt-2 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>

          {/* Bottom Navigation */}
          <div className={`py-3 space-y-1 ${isOpen ? 'px-3' : 'px-3'}`}>
            {bottomItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.label}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-2xl transition-all duration-300 ${
                    isOpen 
                      ? 'w-full h-12 px-3 gap-3' 
                      : 'w-12 h-12 mx-auto justify-center'
                  } ${
                    isActive
                      ? 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-lg shadow-primary-500/40'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-primary-500'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    {isOpen && (
                      <span className="text-sm font-medium whitespace-nowrap animate-fade-in">
                        {item.label}
                      </span>
                    )}
                    {!isOpen && (
                      <span className="absolute left-[70px] px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                        {item.label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* Help & Support Button */}
            <button 
              onClick={() => setShowHelp(true)}
              className={`group relative flex items-center rounded-2xl transition-all duration-300 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-primary-500 ${
                isOpen 
                  ? 'w-full h-12 px-3 gap-3' 
                  : 'w-12 h-12 mx-auto justify-center'
              }`}
            >
              <HelpCircle className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
              {isOpen && (
                <span className="text-sm font-medium whitespace-nowrap animate-fade-in">
                  {t('nav.helpSupport')}
                 </span>
              )}
            {!isOpen && (
               <span className="absolute left-[70px] px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                {t('nav.helpSupport')}
               </span>
             )}
            </button>
          </div>
        </div>
      </aside>

      {/* Help & Support Modal */}
      <HelpSupportModal 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
      />
    </>
  );
};

export default Sidebar;