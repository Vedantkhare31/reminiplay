import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import VoiceAssistant from '../voice/VoiceAssistant';
import BubbleBackground from '../BubbleBackground';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950/30 transition-colors duration-300 relative">
      <BubbleBackground />
      
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div 
        className={`relative z-10 transition-all duration-500 ${
          sidebarOpen ? 'ml-[276px]' : 'ml-[104px]'
        }`}
      >
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <main className="p-6 pt-24 max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>
      
      <VoiceAssistant />
    </div>
  );
};

export default MainLayout;