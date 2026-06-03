"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/config/supabase";
import { 
  Loader2, 
  Keyboard, 
  Trophy, 
  LineChart, 
  Award, 
  Target, 
  Zap, 
  Calendar,
  History
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface Stats {
  avgWpm: number;
  avgAccuracy: number;
  totalTests: number;
}

interface TestAttempt {
  id: string;
  wpm: number;
  accuracy: number;
  strokes: number;
  duration_seconds: number;
  language: string;
  level: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState<Stats>({ avgWpm: 0, avgAccuracy: 0, totalTests: 0 });
  const [history, setHistory] = useState<TestAttempt[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  // Authenticate user check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth?mode=login");
    }
  }, [user, authLoading, router]);

  // Fetch student records from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setDbLoading(true);
      try {
        const { data, error } = await supabase
          .from("test_results")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching test results:", error.message);
          return;
        }

        if (data && data.length > 0) {
          const total = data.length;
          const sumWpm = data.reduce((acc, curr) => acc + curr.wpm, 0);
          const sumAcc = data.reduce((acc, curr) => acc + curr.accuracy, 0);

          setStats({
            avgWpm: Math.round(sumWpm / total),
            avgAccuracy: Math.round(sumAcc / total),
            totalTests: total,
          });

          setHistory(data);

          // Get last 10 attempts and map them ascending for the chart timeline
          const last10 = [...data]
            .slice(0, 10)
            .reverse()
            .map((item, index) => ({
              attempt: `Test #${index + 1}`,
              WPM: item.wpm,
              Accuracy: item.accuracy,
              language: item.language,
              level: item.level,
            }));
          setChartData(last10);
        }
      } catch (err) {
        console.error("Database query failed:", err);
      } finally {
        setDbLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (authLoading || dbLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-indigo" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 glass-panel glow-indigo">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white">
            Student Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back, <span className="text-white font-semibold">{profile?.full_name || "Student"}</span>. Check your speed progress dashboard.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1 bg-slate-950/40 p-2 rounded-lg border border-glass-border">
            <Calendar className="w-4 h-4 text-brand-indigo" />
            <span>Joined: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}</span>
          </div>
          {profile?.mobile_number && (
            <div className="flex items-center gap-1 bg-slate-950/40 p-2 rounded-lg border border-glass-border">
              <span>Mobile: {profile.mobile_number}</span>
            </div>
          )}
        </div>
      </div>

      {/* Numerical Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Metric 1: Avg WPM */}
        <div className="glass-panel p-6 flex items-center justify-between relative overflow-hidden group hover:border-brand-indigo/40 transition-all">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average WPM</p>
            <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo to-brand-purple">
              {stats.avgWpm}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-brand-indigo/10 border border-brand-indigo/25 flex items-center justify-center">
            <Zap className="w-6 h-6 text-brand-indigo" />
          </div>
        </div>

        {/* Metric 2: Avg Accuracy */}
        <div className="glass-panel p-6 flex items-center justify-between relative overflow-hidden group hover:border-brand-emerald/40 transition-all">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average Accuracy</p>
            <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald to-teal-400">
              {stats.avgAccuracy}%
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-brand-emerald/10 border border-brand-emerald/25 flex items-center justify-center">
            <Target className="w-6 h-6 text-brand-emerald" />
          </div>
        </div>

        {/* Metric 3: Total Tests */}
        <div className="glass-panel p-6 flex items-center justify-between relative overflow-hidden group hover:border-brand-gold/40 transition-all">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Exams Completed</p>
            <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-500">
              {stats.totalTests}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-brand-gold/10 border border-brand-gold/25 flex items-center justify-center">
            <Award className="w-6 h-6 text-brand-gold" />
          </div>
        </div>
      </div>

      {/* Progress Chart Area */}
      {stats.totalTests > 0 ? (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-glass-border pb-3">
            <LineChart className="w-5 h-5 text-brand-indigo" />
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">Speed & Accuracy Progress Timeline (Last 10 Attempts)</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="wpmColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="accColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="attempt" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#0f172a", 
                    borderColor: "rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    color: "#fff"
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Area 
                  type="monotone" 
                  dataKey="WPM" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#wpmColor)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="Accuracy" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#accColor)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {/* Action Panels and Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Action Panel 1: Start Test */}
        <div className="md:col-span-2 glass-panel p-6 flex flex-col justify-between hover:border-brand-indigo/40 transition-all glow-indigo">
          <div className="space-y-3">
            <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-brand-indigo" />
              <span>Launch Practice Typing Exams</span>
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Test your proficiency in Junior/Senior modes with customized texts. We support full automated scoring and certificates for passing marks (&gt;= 50).
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Link
              href="/typing-test/english/junior"
              className="text-center px-4 py-2.5 bg-brand-indigo/20 border border-brand-indigo/40 hover:bg-brand-indigo/35 text-white text-xs font-bold rounded-lg uppercase transition-all"
            >
              English Junior Test
            </Link>
            <Link
              href="/typing-test/tamil/junior"
              className="text-center px-4 py-2.5 bg-brand-emerald/20 border border-brand-emerald/40 hover:bg-brand-emerald/35 text-white text-xs font-bold rounded-lg uppercase transition-all"
            >
              Tamil Junior Test
            </Link>
          </div>
        </div>

        {/* Action Panel 2: Leaderboard & Peers */}
        <div className="glass-panel p-6 flex flex-col justify-between hover:border-brand-gold/40 transition-all">
          <div className="space-y-3">
            <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
              <Trophy className="w-5 h-5 text-brand-gold" />
              <span>View Leaderboards</span>
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Analyze speed scores of registered students at Central School of Commerce. Earn your rank!
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="w-full text-center px-4 py-2.5 bg-slate-900 border border-glass-border hover:border-brand-gold text-slate-200 text-xs font-bold rounded-lg uppercase transition-all mt-6"
          >
            Open Leaderboards
          </Link>
        </div>

      </div>

      {/* History Log Section */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-glass-border pb-3">
          <History className="w-5 h-5 text-brand-purple" />
          <h3 className="font-bold text-white uppercase tracking-wider text-sm">Historical Sessions Log</h3>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-glass-border text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 font-semibold">Date</th>
                  <th className="py-2.5 font-semibold">Language</th>
                  <th className="py-2.5 font-semibold">Level</th>
                  <th className="py-2.5 font-semibold">Speed (WPM)</th>
                  <th className="py-2.5 font-semibold">Accuracy (%)</th>
                  <th className="py-2.5 font-semibold">Strokes</th>
                  <th className="py-2.5 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/40 text-slate-300">
                {history.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5">{new Date(attempt.created_at).toLocaleDateString()}</td>
                    <td className="py-2.5 capitalize">{attempt.language}</td>
                    <td className="py-2.5 capitalize">{attempt.level}</td>
                    <td className="py-2.5 font-semibold text-white">{attempt.wpm} WPM</td>
                    <td className="py-2.5">{attempt.accuracy}%</td>
                    <td className="py-2.5">{attempt.strokes}</td>
                    <td className="py-2.5">{attempt.duration_seconds}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500">
            No typing attempts completed yet. Launch a test above to begin!
          </div>
        )}
      </div>

    </div>
  );
}
