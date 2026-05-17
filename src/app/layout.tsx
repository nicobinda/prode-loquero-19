import type { Metadata, Viewport } from 'next';
import { Lato, Titillium_Web } from 'next/font/google';
import './globals.css';

const lato = Lato({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-sans',
});

const titillium = Titillium_Web({
  weight: ['400', '600', '700', '900'],
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Prode Binda 2026',
  description: 'Pronósticos familiares de la FIFA World Cup 2026',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${lato.variable} ${titillium.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-pb-bg text-pb-deep-blue">
        {children}
      </body>
    </html>
  );
}
