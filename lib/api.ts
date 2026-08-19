import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export async function fetchWithRetry<T>(
  url: string,
  options: AxiosRequestConfig = {},
  retries: number = 3,
  delay: number = 1000
): Promise<AxiosResponse<T>> {
  try {
    return await axios.request<T>({ url, ...options });
  } catch (error: any) {
    if (retries > 0 && error.response && (error.response.status === 429 || error.response.status >= 500)) {
      console.log(`Retrying... attempts left: ${retries}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry<T>(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

export function handleApiError(error: any): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as any;
    if (status === 401) {
      return 'API anahtarı geçersiz veya eksik. Lütfen .env.local dosyasını kontrol edin.';
    } else if (status === 429) {
      return 'API kotası doldu veya çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.';
    } else if (status === 500) {
      return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
    } else if (data && data.error && data.error.message) {
      return data.error.message;
    } else {
      return `API hatası: ${error.message}`;
    }
  } else {
    return `Beklenmeyen hata: ${error.message}`;
  }
}
