import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Shell } from '@/components/layout/shell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bias Kaleidoscope',
  description: 'Reveal, quantify, and mitigate bias in prompts, datasets, and hiring artifacts.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
