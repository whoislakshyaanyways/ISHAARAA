import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ISL Lingo — Learn Indian Sign Language',
  description: 'Gamified, interactive video-based Indian Sign Language learning platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fafafa] text-slate-900 antialiased selection:bg-emerald-200">
        {children}
      </body>
    </html>
  );
}
