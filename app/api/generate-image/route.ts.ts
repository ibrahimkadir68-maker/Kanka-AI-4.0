import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { handleApiError } from '@/lib/api';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { prompt, size, quality } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt gereklidir.' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API anahtarı eksik.' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: size || '1024x1024',
      quality: quality || 'standard',
    });

    const imageUrl = response.data[0].url;
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Görsel üretim hatası:', error);
    const errorMessage = handleApiError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}