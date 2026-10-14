'use client';

import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  ChefHat,
  Sparkles,
  UtensilsCrossed,
  Boxes,
  MessageSquareWarning,
  LineChart,
} from 'lucide-react';

export default function LandingPage() {
  const { theme } = useStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const features = [
    { icon: UtensilsCrossed, label: 'POS & Kitchen Order Tickets' },
    { icon: Boxes, label: 'Recipe-Linked Inventory Tracking' },
    { icon: MessageSquareWarning, label: 'Staff Complaint Desks' },
    { icon: LineChart, label: 'Real-Time Owner Dashboards' },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden bg-slate-950 px-4 py-10">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />

      {/* Header */}
      <div className="z-10 flex items-center gap-2">
        <ChefHat className="h-8 w-8 text-indigo-400" />
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Surya Dhosa
        </span>
      </div>

      {/* Hero content */}
      <div className="z-10 max-w-2xl text-center space-y-6 my-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
          <Sparkles className="h-3 w-3" /> Production-Ready ERP
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
          Manage your food business like a pro.
        </h1>

        <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
          Integrate order takers, POS terminals, recipe calculations, store stock counts,
          and staff complaint desks in one real-time dashboard.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-xl mx-auto">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur"
            >
              <Icon className="h-5 w-5 text-indigo-400" />
              <span className="text-[11px] text-slate-400 leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sign In / Sign Up options */}
      <div className="z-10 flex flex-col items-center gap-4 w-full max-w-xs">
        <div className="flex w-full gap-3">
          <a
            href="/login"
            className="flex-1 text-center py-3 rounded-lg font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
          >
            Login
          </a>
          <a
            href="/register"
            className="flex-1 text-center py-3 rounded-lg font-semibold text-sm text-slate-200 border border-slate-700 bg-slate-900 hover:bg-slate-800 hover:border-slate-600 transition-colors"
          >
            Sign Up
          </a>
        </div>
        <p className="text-[11px] text-slate-500">
          Powered by Next.js &amp; NestJS Microservices
        </p>
      </div>
    </div>
  );
}
