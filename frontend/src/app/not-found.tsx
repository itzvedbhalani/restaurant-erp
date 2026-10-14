'use client';

import Link from 'next/link';
import { ChefHat, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-950 px-4 text-center">
      <ChefHat className="h-14 w-14 text-indigo-400" />
      <div className="space-y-2">
        <h1 className="text-6xl font-extrabold text-white">404</h1>
        <h2 className="text-lg font-semibold text-white">This page isn&apos;t on the menu</h2>
        <p className="text-sm text-slate-400 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20"
      >
        <Home className="h-4 w-4" /> Back to Home
      </Link>
    </div>
  );
}
