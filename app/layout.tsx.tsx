import './globals.css';
import 'highlight.js/styles/github-dark.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kanka-AI 4.0',
  description: 'Gelişmiş yapay zeka asistanı',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full">
      <body className={`${inter.className} h-full bg-white dark:bg-gray-900`}>
        {children}
      </body>
    </html>
  );
}