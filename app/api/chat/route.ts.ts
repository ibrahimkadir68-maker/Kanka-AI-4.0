import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { Message } from '@/lib/types';
import { handleApiError } from '@/lib/api';
import { runAgent } from '@/lib/agent';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, systemPrompt, stream, agentMode } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Mesajlar eksik veya geçersiz.' }, { status: 400 });
    }

    // Ajan modu: JSON cevap döndür (adımlar dahil)
    if (agentMode) {
      const { finalMessage, steps } = await runAgent(messages, systemPrompt);
      return NextResponse.json({ message: finalMessage, steps });
    }

    // Normal sohbet modu
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API anahtarı eksik. .env.local dosyanızı kontrol edin.' }, { status: 500 });
    }

    const chatMessages = [
      { role: 'system', content: systemPrompt || 'Sen Kanka-AI 4.0 adında yardımsever bir asistansın.' },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ];

    if (stream) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: chatMessages,
        stream: true,
      });

      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of response) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: chatMessages,
      });

      const assistantMessage: Message = {
        id: Math.random().toString(36).substring(2),
        role: 'assistant',
        content: response.choices[0].message.content || '',
        createdAt: Date.now(),
      };

      return NextResponse.json({ message: assistantMessage });
    }
  } catch (error) {
    console.error('Chat API hatası:', error);
    const errorMessage = handleApiError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}