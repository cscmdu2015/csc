"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/config/supabase";
import { Loader2, Trophy, Medal, Search, Sparkles } from "lucide-react";

interface LeaderboardRecord {
  userId: string;
  name: string;
  email: string;
  avgWpm: number;
  avgAccuracy: number;
  totalTests: number;
}

export default function LeaderboardPage() {
  const [rankings, setRankings] = useState<LeaderboardRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Query test results with user profiles
        const { data, error } = await supabase
          .from("test_results")
          .select(`
            wpm,
            accuracy,
            user_id,
            profiles:user_id (
              full_name,
              email
            )
          `);

        if (error) {
          console.error("Error fetching leaderboard data:", error.message);
          return;
        }

        if (data && data.length > 0) {
          // Group by user_id
          const studentMap: {
            [key: string]: {
              name: string;
              email: string;
              sumWpm: number;
              sumAcc: number;
              count: number;
            };
          } = {};

          data.forEach((row: any) => {
            const userId = row.user_id;
            const profile = row.profiles;
            const name = profile?.full_name || profile?.email || "Unknown Student";
            const email = profile?.email || "";

            if (!studentMap[userId]) {
              studentMap[userId] = {
                name,
                email,
                sumWpm: 0,
                sumAcc: 0,
                count: 0,
              };
            }

            studentMap[userId].sumWpm += row.wpm;
            studentMap[userId].sumAcc += row.accuracy;
            studentMap[userId].count += 1;
          });

          // Aggregate into leaderboard records & sort by WPM
          const records = Object.keys(studentMap).map((id) => {
            const entry = studentMap[id];
            return {
              userId: id,
              name: entry.name,
              email: entry.email,
              avgWpm: Math.round(entry.sumWpm / entry.count),
              avgAccuracy: Math.round(entry.sumAcc / entry.count),
              totalTests: entry.count,
            };
          });

          records.sort((a, b) => b.avgWpm - a.avgWpm);
          setRankings(records);
        }
      } catch (err) {
        console.error("Leaderboard query failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const filteredRankings = rankings.filter(
    (record) =>
      record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-indigo" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 glass-panel glow-gold">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-brand-gold animate-bounce" />
            <span>Institute Leaderboard</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Top performing typists at Central School of Commerce ranked by average Speed.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search by student name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 bg-slate-950/40 border border-glass-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold text-xs"
          />
        </div>
      </div>

      {/* Main Ranking Table Card */}
      <div className="glass-panel p-6 shadow-2xl relative overflow-hidden">
        {filteredRankings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-glass-border text-slate-500 uppercase tracking-wider text-xs font-semibold">
                  <th className="py-3 px-4 text-center w-16">Rank</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4 text-center">Avg Speed (WPM)</th>
                  <th className="py-3 px-4 text-center">Avg Accuracy</th>
                  <th className="py-3 px-4 text-center">Total Exams</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/40 text-slate-300">
                {filteredRankings.map((student, index) => {
                  const rank = index + 1;
                  
                  // Style medals for top 3
                  let rankCell = <span className="font-bold text-slate-400">{rank}</span>;
                  let bgRow = "";

                  if (rank === 1) {
                    rankCell = <Medal className="w-5.5 h-5.5 text-brand-gold mx-auto" />;
                    bgRow = "bg-brand-gold/5 hover:bg-brand-gold/10 transition-colors";
                  } else if (rank === 2) {
                    rankCell = <Medal className="w-5.5 h-5.5 text-slate-300 mx-auto" />;
                    bgRow = "bg-slate-300/5 hover:bg-slate-300/10 transition-colors";
                  } else if (rank === 3) {
                    rankCell = <Medal className="w-5.5 h-5.5 text-orange-400 mx-auto" />;
                    bgRow = "bg-orange-400/5 hover:bg-orange-400/10 transition-colors";
                  }

                  return (
                    <tr key={student.userId} className={`${bgRow} hover:bg-white/5 transition-colors`}>
                      <td className="py-4 px-4 text-center">{rankCell}</td>
                      <td className="py-4 px-4 font-semibold text-white flex items-center gap-2">
                        <span>{student.name}</span>
                        {rank === 1 && <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />}
                      </td>
                      <td className="py-4 px-4 text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo to-brand-purple">
                        {student.avgWpm} WPM
                      </td>
                      <td className="py-4 px-4 text-center font-medium text-brand-emerald">
                        {student.avgAccuracy}%
                      </td>
                      <td className="py-4 px-4 text-center text-slate-400 font-semibold">
                        {student.totalTests}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 font-semibold">
            No students found matching your query or no attempts have been logged yet.
          </div>
        )}
      </div>

    </div>
  );
}
