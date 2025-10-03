import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import FloatingAIAssistant from '../ai/FloatingAIAssistant';
import Orb from '../ui/Orb';

const Layout: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(() => {
    const saved = localStorage.getItem('aiChatOpen');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('aiChatOpen', JSON.stringify(isChatOpen));
  }, [isChatOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Header />
        <main className="p-6">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Floating AI Assistant */}
      <FloatingAIAssistant isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      
      {/* Toggle Button with Orb - Blue Theme with Animation */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-4 w-16 h-16 rounded-full shadow-2xl shadow-blue-400/60 hover:shadow-blue-500/80 z-50 hover:scale-110 overflow-hidden transition-all duration-700 ease-in-out ${
          isChatOpen 
            ? 'left-[7%]' 
            : 'left-1/2 transform -translate-x-1/2'
        }`}
        aria-label="Toggle AI Assistant"
      >
        <Orb hue={190} hoverIntensity={0.4} rotateOnHover={true} forceHoverState={isChatOpen} />
      </button>
    </div>
  );
};

export default Layout;