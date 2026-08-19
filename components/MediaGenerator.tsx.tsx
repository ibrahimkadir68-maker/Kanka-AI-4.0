'use client';

import { useState } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from './Toast';

export default function MediaGenerator() {
  const [prompt, setPrompt] = useState('');
  const [providerVideo] = useState<'replicate'>('replicate');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeType, setActiveType] = useState<'image' | 'video'>('image');
  const { addToast } = useToast();

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      addToast('Lütfen bir prompt girin.', 'warning');
      return;
    }
    setIsGenerating(true);
    setImageUrl('');
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Görsel üretilemedi.');
      }
      setImageUrl(data.imageUrl);
      addToast('Görsel başarıyla üretildi.', 'success');
    } catch (error: any) {
      addToast(error.message || 'Bir hata oluştu.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      addToast('Lütfen bir prompt girin.', 'warning');
      return;
    }
    setIsGenerating(true);
    setVideoUrl('');
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, provider: providerVideo }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Video üretilemedi.');
      }
      setVideoUrl(data.videoUrl);
      addToast('Video başarıyla üretildi.', 'success');
    } catch (error: any) {
      addToast(error.message || 'Bir hata oluştu.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <ImageIcon size={28} /> Medya Üretimi
      </h2>
      <div className="flex gap-2">
        <button
          onClick={() => setActiveType('image')}
          className={`px-4 py-2 rounded-lg ${activeType === 'image' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          Görsel
        </button>
        <button
          onClick={() => setActiveType('video')}
          className={`px-4 py-2 rounded-lg ${activeType === 'video' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          Video
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Ne üretmek istediğinizi açıklayın..."
        />
      </div>

      {activeType === 'image' ? (
        <div className="space-y-2">
          <button
            onClick={handleGenerateImage}
            disabled={isGenerating}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : 'Görsel Üret (DALL-E 3)'}
          </button>
          {imageUrl && (
            <img src={imageUrl} alt="Üretilen görsel" className="w-full rounded-lg shadow-md" />
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={handleGenerateVideo}
            disabled={isGenerating}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : 'Video Üret (Replicate)'}
          </button>
          {videoUrl && (
            <video src={videoUrl} controls className="w-full rounded-lg shadow-md" />
          )}
        </div>
      )}
    </div>
  );
}