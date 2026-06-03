import React from "react";
import Link from "next/link";
import { Keyboard, Shield, BarChart3, Users, Zap, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="space-y-20 py-10">
      
      {/* Hero Section */}
      <section className="text-center relative max-w-4xl mx-auto px-4">
        {/* Glow effect back */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-brand-indigo/15 filter blur-3xl -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-indigo/30 bg-brand-indigo/5 text-brand-indigo text-xs font-semibold uppercase tracking-wider mb-6">
          <Zap className="w-3.5 h-3.5" />
          <span>Speed & Accuracy Portal</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white uppercase sm:text-6xl md:text-7xl">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Central School
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-emerald">
            of Commerce
          </span>
        </h1>

        <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
          Recreating typing excellence. Master typing tests in English and Tamil with real-time performance indicators and analytics.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/auth?mode=register"
            className="px-8 py-3.5 bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold rounded-lg shadow-lg hover:shadow-brand-indigo/25 hover:brightness-110 active:brightness-95 transition-all text-sm uppercase tracking-wider glow-indigo"
          >
            Get Started
          </Link>
          <Link
            href="/auth?mode=login"
            className="px-8 py-3.5 bg-slate-900/60 text-slate-200 font-bold rounded-lg border border-glass-border hover:border-slate-500 hover:text-white transition-all text-sm uppercase tracking-wider"
          >
            Student Sign In
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-12">
       

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-panel p-6 hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-brand-indigo/10 border border-brand-indigo/35 flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6 text-brand-indigo" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase mb-2">
              Real-Time Telemetry
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track raw metrics including Gross Words-Per-Minute (WPM), live error rates, accuracy percentages, and key strokes as you type.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel p-6 hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-brand-emerald/10 border border-brand-emerald/35 flex items-center justify-center mb-6">
              <Keyboard className="w-6 h-6 text-brand-emerald" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase mb-2">
              Multi-Language Support
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Full coverage of standard English QWERTY layouts and Tamil layouts, configured specifically for official Junior and Senior speeds.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel p-6 hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-brand-purple/10 border border-brand-purple/35 flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-brand-purple" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase mb-2">
              School Leaderboard
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Measure your progress and compete against peers at Central School of Commerce. Climb ranks based on top average speeds.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="glass-panel p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/5 filter blur-3xl pointer-events-none" />
        
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-white sm:text-3xl">
            Certification Workflow
          </h2>
          <p className="text-slate-400 mt-2">Follow these 4 simple steps to record your speeds</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
          {/* Step 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-indigo/15 text-brand-indigo font-bold border border-brand-indigo/35 flex items-center justify-center text-sm">
                1
              </div>
              <h4 className="font-bold text-white uppercase text-sm tracking-wider">Register Profile</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Create your profile by filling in your name, contact information, and date of birth details.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-purple/15 text-brand-purple font-bold border border-brand-purple/35 flex items-center justify-center text-sm">
                2
              </div>
              <h4 className="font-bold text-white uppercase text-sm tracking-wider">Select Passage</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Choose your test configuration. We support English and Tamil.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-emerald/15 text-brand-emerald font-bold border border-brand-emerald/35 flex items-center justify-center text-sm">
                3
              </div>
              <h4 className="font-bold text-white uppercase text-sm tracking-wider">Submit Test</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Type the original text. Highlight indicators guide you word-by-word with backspace controls.
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-gold/15 text-brand-gold font-bold border border-brand-gold/35 flex items-center justify-center text-sm">
                4
              </div>
              <h4 className="font-bold text-white uppercase text-sm tracking-wider">Print Results</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Save results to Supabase instantly. Print your performance report certificate on passing scores.
            </p>
          </div>
        </div>
      </section>

     
    </div>
  );
}
