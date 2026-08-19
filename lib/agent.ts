import OpenAI from 'openai';
import type { Message } from './types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AgentStep {
  type: 'thought' | 'action' | 'observation';
  content: string;
}

const tools = [
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Web araması yaparak güncel bilgileri getirir.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Arama sorgusu' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_code',
      description: 'Python veya JavaScript kodu çalıştırır.',
      parameters: {
        type: 'object',
        properties: {
          language: { type: 'string', enum: ['python', 'javascript'], description: 'Kod dili' },
          code: { type: 'string', description: 'Çalıştırılacak kod' },
        },
        required: ['language', 'code'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'data_analysis',
      description: 'Verilen sayı dizisi üzerinde temel istatistiksel analiz yapar.',
      parameters: {
        type: 'object',
        properties: {
          numbers: { type: 'array', items: { type: 'number' }, description: 'Analiz edilecek sayılar' },
        },
        required: ['numbers'],
      },
    },
  },
];

async function executeTool(name: string, args: any): Promise<string> {
  switch (name) {
    case 'web_search': {
      const apiKey = process.env.SERPAPI_API_KEY;
      if (!apiKey) throw new Error('SerpAPI anahtarı eksik.');
      const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(args.query)}&api_key=${apiKey}`);
      const data = await response.json();
      const results = data.organic_results?.slice(0, 3).map((r: any) => `${r.title}: ${r.snippet}`).join('\n');
      return results || 'Sonuç bulunamadı.';
    }
    case 'run_code': {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: args.language,
          version: '*',
          files: [{ content: args.code }],
        }),
      });
      const data = await response.json();
      if (data.run && data.run.output) {
        return data.run.output;
      } else if (data.run && data.run.stderr) {
        return `Hata: ${data.run.stderr}`;
      } else {
        return 'Kod çalıştırılamadı.';
      }
    }
    case 'data_analysis': {
      const nums: number[] = args.numbers;
      if (nums.length === 0) return 'Boş dizi.';
      const sum = nums.reduce((a, b) => a + b, 0);
      const mean = sum / nums.length;
      const sorted = [...nums].sort((a, b) => a - b);
      const median = sorted.length % 2 === 0 ? (sorted[sorted.length/2 - 1] + sorted[sorted.length/2]) / 2 : sorted[Math.floor(sorted.length/2)];
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      return `Ortalama: ${mean.toFixed(2)}, Medyan: ${median}, Min: ${min}, Max: ${max}, Toplam: ${sum}`;
    }
    default:
      throw new Error(`Bilinmeyen araç: ${name}`);
  }
}

export async function runAgent(
  messages: Message[],
  systemPrompt?: string
): Promise<{ finalMessage: Message; steps: AgentStep[] }> {
  const messagesForLLM: any[] = [
    { role: 'system', content: systemPrompt || 'Sen Kanka-AI 4.0 adında yardımsever bir asistansın. Karmaşık görevleri adımlara böler ve araçları kullanarak çözersin.' },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  const steps: AgentStep[] = [];
  let finalMessage: Message | null = null;
  let iteration = 0;
  const maxIterations = 5;

  while (iteration < maxIterations && !finalMessage) {
    iteration++;
    steps.push({ type: 'thought', content: `Adım ${iteration}: Durum değerlendiriliyor...` });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messagesForLLM,
      tools: tools as any,
      tool_choice: 'auto',
    });

    const assistantMessage = response.choices[0].message;

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      messagesForLLM.push({
        role: 'assistant',
        content: assistantMessage.content || '',
        tool_calls: assistantMessage.tool_calls,
      });

      for (const toolCall of assistantMessage.tool_calls) {
     const name = (toolCall as any).function.name;
const args = JSON.parse((toolCall as any).function.arguments);
        steps.push({ type: 'action', content: `Araç çağrılıyor: ${name}(${JSON.stringify(args)})` });
        const output = await executeTool(name, args);
        steps.push({ type: 'observation', content: output });
        messagesForLLM.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: output,
        });
      }
    } else {
      const content = assistantMessage.content || 'Görev tamamlandı.';
      steps.push({ type: 'thought', content: 'Nihai cevap oluşturuluyor...' });
      finalMessage = {
        id: Math.random().toString(36).substring(2),
        role: 'assistant',
        content,
        createdAt: Date.now(),
      };
    }
  }

  if (!finalMessage) {
    finalMessage = {
      id: Math.random().toString(36).substring(2),
      role: 'assistant',
      content: 'Görev çok karmaşık, maksimum deneme sayısına ulaşıldı.',
      createdAt: Date.now(),
    };
  }

  return { finalMessage, steps };
}
