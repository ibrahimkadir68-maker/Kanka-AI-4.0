'use client';

import { useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import AgentPanel from '../components/AgentPanel';
import MediaGenerator from '../components/MediaGenerator';
import SettingsPanel from '../components/SettingsPanel';
import ThemeToggle from '../components/ThemeToggle';
import { ToastContainer } from '../components/Toast';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'agent' | 'media' | 'settings'>('chat');

  return (
    <main className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <aside className="w-16 md:w-64 bg-gray-100 dark:bg-gray-800 flex flex-col items-center md:items-stretch p-2 space-y-2">
        <div className="text-2xl font-bold p-2 hidden md:block">Kanka-AI 4.0</div>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ${activeTab === 'chat' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        >
          <span className="text-xl">💬</span>
          <span className="hidden md:inline">Sohbet</span>
        </button>
        <button
          onClick={() => setActiveTab('agent')}
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ${activeTab === 'agent' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        >
          <span className="text-xl">🤖</span>
          <span className="hidden md:inline">Ajan Modu</span>
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ${activeTab === 'media' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        >
          <span className="text-xl">🎨</span>
          <span className="hidden md:inline">Medya</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ${activeTab === 'settings' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        >
          <span className="text-xl">⚙️</span>
          <span className="hidden md:inline">Ayarlar</span>
        </button>
        <div className="mt-auto">
          <ThemeToggle />
        </div>
      </aside>

      <section className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'chat' && <ChatInterface />}
        {activeTab === 'agent' && <AgentPanel />}
        {activeTab === 'media' && <MediaGenerator />}
        {activeTab === 'settings' && <SettingsPanel />}
      </section>
      <ToastContainer />
    </main>
  );
}