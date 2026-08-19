import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { handleApiError } from '@/lib/api';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { prompt, provider } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt gereklidir.' }, { status: 400 });
    }

    if (provider !== 'replicate') {
      return NextResponse.json({ error: 'Geçersiz video sağlayıcı.' }, { status: 400 });
    }

    const apiKey = process.env.REPLICATE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Replicate API anahtarı eksik.' }, { status: 500 });
    }

    // Replicate ile Stable Video Diffusion (veya başka bir video modeli) kullanımı
    const modelVersion = 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438';
    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: modelVersion,
        input: { prompt },
      },
      {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Tahmin sonucunu poll et
    const predictionId = response.data.id;
    let videoUrl = '';
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      const statusResponse = await axios.get(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { 'Authorization': `Token ${apiKey}` },
      });
      const status = statusResponse.data.status;
      if (status === 'succeeded') {
        videoUrl = statusResponse.data.output;
        break;
      } else if (status === 'failed') {
        throw new Error('Video üretimi başarısız oldu: ' + JSON.stringify(statusResponse.data.error));
      }
      await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 saniye bekle
    }

    if (!videoUrl) {
      throw new Error('Video üretimi zaman aşımına uğradı.');
    }

    return NextResponse.json({ videoUrl });
  } catch (error) {
    console.error('Video üretim hatası:', error);
    const errorMessage = handleApiError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}