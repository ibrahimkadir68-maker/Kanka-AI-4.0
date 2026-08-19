'use client';

import { useEffect, useState } from 'react';
import { useToast } from './Toast';

export default function SettingsPanel() {
  const [systemPrompt, setSystemPrompt] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const storedPrompt = localStorage.getItem('systemPrompt');
    if (storedPrompt) setSystemPrompt(storedPrompt);
  }, []);

  const handleSave = () => {
    localStorage.setItem('systemPrompt', systemPrompt);
    addToast('Sistem talimatı kaydedildi.', 'success');
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
      <h2 className="text-2xl font-bold">Ayarlar</h2>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Sistem Talimatı (System Prompt)</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={5}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="AI'ın nasıl davranacağını belirleyin..."
        />
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200">API Anahtarları</h3>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
          Tüm API anahtarları sunucu tarafında <code>.env.local</code> dosyasında saklanır ve tarayıcıya gönderilmez. Bu nedenle burada anahtar girişi gerekmemektedir.
        </p>
      </div>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Kaydet
      </button>
    </div>
  );
}
