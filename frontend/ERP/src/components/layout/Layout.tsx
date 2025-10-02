import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import AIChat from '../ai/AIChat';

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
      {/* AI Chat Overlay */}
      {isChatOpen && (
        <div className="fixed bottom-16 left-1/2 z-50 transform -translate-x-1/2">
          <AIChat />
        </div>
      )}
      {/* Toggle Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        aria-label="Toggle AI Chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Layout;