import './globals.css';
import type { Metadata } from 'next';
import AuthWatcher from '../components/AuthWatcher';

export const metadata: Metadata = {
  title: 'Surya Dhosa - Restaurant ERP & POS',
  description: 'Enterprise resource planning and multi-role point of sale system for modern restaurants',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <AuthWatcher />
        {children}
      </body>
    </html>
  );
}
