'use client';

import { useState } from 'react';
import { Bot, Loader2, CheckCircle, Search, Code, BarChart } from 'lucide-react';
import { useToast } from './Toast';

interface AgentStep {
  type: 'thought' | 'action' | 'observation';
  content: string;
}

export default function AgentPanel() {
  const [input, setInput] = useState('');
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState('');
  const { addToast } = useToast();

  const handleRunAgent = async () => {
    if (!input.trim() || isRunning) return;
    setIsRunning(true);
    setSteps([]);
    setFinalAnswer('');

    try {
      const systemPrompt = localStorage.getItem('systemPrompt') || '';
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: input }],
          systemPrompt,
          stream: false,
          agentMode: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Ajan çalıştırılamadı.');
      }

      setSteps(data.steps || []);
      setFinalAnswer(data.message.content || 'Yanıt alınamadı.');
    } catch (error: any) {
      addToast(error.message || 'Bir hata oluştu.', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Bot size={28} /> Ajan Modu
      </h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Karmaşık bir görev girin..."
          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          onKeyDown={(e) => e.key === 'Enter' && handleRunAgent()}
        />
        <button
          onClick={handleRunAgent}
          disabled={isRunning || !input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isRunning ? <Loader2 className="animate-spin" size={18} /> : 'Çalıştır'}
        </button>
      </div>

      {steps.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Düşünce Süreci</h3>
          {steps.map((step, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2 font-semibold capitalize">
                {step.type === 'thought' && <CheckCircle size={16} className="text-blue-500" />}
                {step.type === 'action' && <Search size={16} className="text-green-500" />}
                {step.type === 'observation' && <BarChart size={16} className="text-purple-500" />}
                {step.type}
              </div>
              <p className="mt-1 whitespace-pre-wrap">{step.content}</p>
            </div>
          ))}
        </div>
      )}

      {finalAnswer && (
        <div className="border border-green-300 dark:border-green-700 rounded-lg p-3 bg-green-50 dark:bg-green-900">
          <h3 className="font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
            <CheckCircle size={18} /> Sonuç
          </h3>
          <p className="whitespace-pre-wrap mt-1">{finalAnswer}</p>
        </div>
      )}
    </div>
  );
}
