"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/config/supabase";
import { 
  Loader2, 
  Users, 
  BookOpen, 
  Upload, 
  Trash2, 
  LineChart, 
  User, 
  FileText, 
  Globe, 
  Activity, 
  AlertTriangle,
  History,
  FileCheck
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface Student {
  id: string;
  email: string;
  full_name: string;
  mobile_number: string;
  date_of_birth: string | null;
  created_at: string;
}

interface Passage {
  id: string;
  text: string;
  language: "english" | "tamil";
  level: "junior" | "senior";
  created_at: string;
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

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"progress" | "passages">("progress");
  const [students, setStudents] = useState<Student[]>([]);
  const [passages, setPassages] = useState<Passage[]>([]);
  
  // Student Progress state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentAttempts, setStudentAttempts] = useState<TestAttempt[]>([]);
  const [studentChartData, setStudentChartData] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // Manage Passage Form state
  const [passageText, setPassageText] = useState("");
  const [passageLanguage, setPassageLanguage] = useState<"english" | "tamil">("english");
  const [passageLevel, setPassageLevel] = useState<"junior" | "senior">("junior");
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [savingPassage, setSavingPassage] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  
  const [dbLoading, setDbLoading] = useState(true);

  // Authenticate Admin Access
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth?mode=login");
      } else if (!isAdmin) {
        // Redirection block for standard users
      }
    }
  }, [user, isAdmin, authLoading, router]);

  // Load Initial Admin Data
  useEffect(() => {
    if (!isAdmin) return;

    const fetchAdminData = async () => {
      setDbLoading(true);
      try {
        // 1. Fetch Students
        const { data: stdData, error: stdErr } = await supabase
          .from("profiles")
          .select("*")
          .order("full_name", { ascending: true });
        
        if (stdErr) console.error("Error fetching students:", stdErr.message);
        else setStudents(stdData || []);

        // 2. Fetch Passages
        const { data: pasData, error: pasErr } = await supabase
          .from("passages")
          .select("*")
          .order("created_at", { ascending: false });

        if (pasErr) console.error("Error fetching passages:", pasErr.message);
        else setPassages(pasData || []);

      } catch (err) {
        console.error("Admin data query failed:", err);
      } finally {
        setDbLoading(false);
      }
    };

    fetchAdminData();
  }, [isAdmin]);

  // Fetch Student specific history and map chart
  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setLoadingAttempts(true);
    setStudentAttempts([]);
    setStudentChartData([]);

    try {
      const { data, error } = await supabase
        .from("test_results")
        .select("*")
        .eq("user_id", student.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching student attempts:", error.message);
      } else if (data) {
        setStudentAttempts(data);
        // Map data in chronological order (ascending) for progress line charts
        const chartMapped = [...data]
          .reverse()
          .map((item, index) => ({
            attempt: `Test #${index + 1}`,
            WPM: item.wpm,
            Accuracy: item.accuracy,
            Level: item.level.toUpperCase(),
            Lang: item.language.toUpperCase(),
          }));
        setStudentChartData(chartMapped);
      }
    } catch (err) {
      console.error("Failed to load student timeline:", err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  // PDF File upload handler
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    setPdfError(null);
    setFormSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to process PDF file.");
      }

      setPassageText(result.text || "");
      setFormSuccess("PDF parsed and normalized to text successfully!");
    } catch (err: any) {
      setPdfError(err.message || "An error occurred during parsing.");
    } finally {
      setUploadingPdf(false);
      // Reset file input value
      e.target.value = "";
    }
  };

  // Create Passage submission
  const handleSavePassage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passageText.trim()) return;

    setSavingPassage(true);
    setFormSuccess(null);
    setPdfError(null);

    try {
      const { data, error } = await supabase
        .from("passages")
        .insert({
          text: passageText.trim(),
          language: passageLanguage,
          level: passageLevel,
        })
        .select()
        .single();

      if (error) {
        setPdfError(error.message || "Failed to save passage.");
      } else {
        setFormSuccess("Typing passage added to database successfully!");
        setPassageText("");
        // Reload passages list
        setPassages([data, ...passages]);
      }
    } catch (err) {
      setPdfError("An unexpected error occurred.");
    } finally {
      setSavingPassage(false);
    }
  };

  // Delete Passage handler
  const handleDeletePassage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this passage? This action cannot be undone.")) return;

    try {
      const { error } = await supabase
        .from("passages")
        .delete()
        .eq("id", id);

      if (error) {
        alert("Error deleting passage: " + error.message);
      } else {
        setPassages(passages.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Delete query failed:", err);
    }
  };

  // Protect Unauthorized
  if (!authLoading && !isAdmin) {
    return (
      <div className="flex flex-col min-h-[60vh] items-center justify-center text-center space-y-4 px-4">
        <AlertTriangle className="w-16 h-16 text-brand-danger animate-pulse" />
        <h1 className="text-2xl font-bold uppercase tracking-wider text-white">Access Denied</h1>
        <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
          You are not authorized to view this page. Access is strictly limited to the official admin account.
        </p>
      </div>
    );
  }

  if (authLoading || dbLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-indigo" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Admin Title Banner */}
      <div className="p-6 glass-panel glow-purple flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white">CSC Admin Console</h1>
          <p className="text-slate-400 text-sm mt-1">
            Central School of Commerce portal management. Track metrics and upload exam sheets.
          </p>
        </div>
        <div className="hidden sm:block text-xs bg-brand-purple/20 border border-brand-purple/40 text-brand-purple px-3 py-1.5 rounded-full font-bold uppercase">
          System Admin
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-glass-border">
        <button
          onClick={() => setActiveTab("progress")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeTab === "progress"
              ? "border-brand-purple text-brand-purple"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>📊 Student Progress</span>
        </button>

        <button
          onClick={() => setActiveTab("passages")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeTab === "passages"
              ? "border-brand-purple text-brand-purple"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📝 Manage Passages</span>
        </button>
      </div>

      {/* TAB 1: STUDENT PROGRESS */}
      {activeTab === "progress" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Student Selection List */}
          <div className="glass-panel p-6 space-y-4 md:col-span-1 h-[600px] flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-glass-border pb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-purple" />
              <span>Registered Students ({students.length})</span>
            </h3>

            {students.length > 0 ? (
              <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                      selectedStudent?.id === student.id
                        ? "border-brand-purple bg-brand-purple/15 text-white font-bold"
                        : "border-glass-border hover:border-slate-500 hover:bg-white/5 text-slate-300"
                    }`}
                  >
                    <div className="space-y-1 truncate">
                      <p className="font-semibold truncate">{student.full_name || "Unknown Name"}</p>
                      <p className="text-slate-500 truncate">{student.email}</p>
                    </div>
                    {selectedStudent?.id === student.id && (
                      <div className="w-2 h-2 rounded-full bg-brand-purple animate-ping" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                No students registered yet.
              </div>
            )}
          </div>

          {/* Student Progress Detail View */}
          <div className="md:col-span-2 space-y-8">
            {selectedStudent ? (
              <>
                {/* Meta details */}
                <div className="glass-panel p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-purple/10 border border-brand-purple/35 text-brand-purple flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                        {selectedStudent.full_name || "Unknown"}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Email: {selectedStudent.email} | Mobile: {selectedStudent.mobile_number || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Chart */}
                <div className="glass-panel p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-glass-border pb-3">
                    <LineChart className="w-5 h-5 text-brand-purple" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Speed Progression Profile
                    </h4>
                  </div>

                  {loadingAttempts ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
                    </div>
                  ) : studentChartData.length > 0 ? (
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={studentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="attempt" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "#0f172a", 
                              borderColor: "rgba(255,255,255,0.08)",
                              color: "#fff"
                            }} 
                          />
                          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                          <Line type="monotone" dataKey="WPM" stroke="#a855f7" strokeWidth={2.5} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="Accuracy" stroke="#10b981" strokeWidth={2} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      No attempts logged to generate a chart.
                    </div>
                  )}
                </div>

                {/* Attempt History */}
                <div className="glass-panel p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-glass-border pb-3">
                    <History className="w-5 h-5 text-brand-purple" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Exam Session Log
                    </h4>
                  </div>

                  {loadingAttempts ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
                    </div>
                  ) : studentAttempts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-glass-border text-slate-500 uppercase tracking-wider">
                            <th className="py-2.5">Date</th>
                            <th className="py-2.5">Language</th>
                            <th className="py-2.5">Level</th>
                            <th className="py-2.5">WPM</th>
                            <th className="py-2.5">Accuracy</th>
                            <th className="py-2.5">Strokes</th>
                            <th className="py-2.5">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border/40 text-slate-300">
                          {studentAttempts.map((attempt) => (
                            <tr key={attempt.id} className="hover:bg-white/5 transition-all">
                              <td className="py-2.5">{new Date(attempt.created_at).toLocaleDateString()}</td>
                              <td className="py-2.5 capitalize">{attempt.language}</td>
                              <td className="py-2.5 capitalize">{attempt.level}</td>
                              <td className="py-2.5 font-bold text-white">{attempt.wpm}</td>
                              <td className="py-2.5 text-brand-emerald">{attempt.accuracy}%</td>
                              <td className="py-2.5">{attempt.strokes}</td>
                              <td className="py-2.5">{attempt.duration_seconds}s</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No typing exam data logged.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="glass-panel p-12 text-center text-slate-500 flex flex-col items-center justify-center h-[350px]">
                <Activity className="w-12 h-12 text-brand-purple/30 mb-4" />
                <p className="text-sm font-semibold uppercase tracking-wider">Select a Student</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Click any student from the left menu panel to view their telemetry charts and speed records.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE PASSAGES */}
      {activeTab === "passages" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Create/Upload Passage Form */}
          <div className="glass-panel p-6 space-y-6 md:col-span-1 h-fit glow-purple">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-glass-border pb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-brand-purple" />
              <span>Add Typing Passage</span>
            </h3>

            {formSuccess && (
              <div className="p-3.5 rounded bg-brand-emerald/10 border border-brand-emerald/30 text-xs text-brand-emerald">
                {formSuccess}
              </div>
            )}

            {pdfError && (
              <div className="p-3.5 rounded bg-brand-danger/10 border border-brand-danger/30 text-xs text-brand-danger">
                {pdfError}
              </div>
            )}

            <form onSubmit={handleSavePassage} className="space-y-4">
              
              {/* Language Selection */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Language</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPassageLanguage("english")}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      passageLanguage === "english"
                        ? "border-brand-purple bg-brand-purple/15 text-white"
                        : "border-glass-border text-slate-400 hover:text-white"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassageLanguage("tamil")}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      passageLanguage === "tamil"
                        ? "border-brand-purple bg-brand-purple/15 text-white"
                        : "border-glass-border text-slate-400 hover:text-white"
                    }`}
                  >
                    Tamil
                  </button>
                </div>
              </div>

              {/* Level Selection */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Level</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPassageLevel("junior")}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      passageLevel === "junior"
                        ? "border-brand-purple bg-brand-purple/15 text-white"
                        : "border-glass-border text-slate-400 hover:text-white"
                    }`}
                  >
                    Junior
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassageLevel("senior")}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      passageLevel === "senior"
                        ? "border-brand-purple bg-brand-purple/15 text-white"
                        : "border-glass-border text-slate-400 hover:text-white"
                    }`}
                  >
                    Senior
                  </button>
                </div>
              </div>

              {/* PDF Parser trigger */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Option: Load Text from PDF
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    id="pdf-uploader"
                    className="hidden"
                    disabled={uploadingPdf}
                  />
                  <label
                    htmlFor="pdf-uploader"
                    className="flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-glass-border hover:border-slate-500 rounded-lg text-slate-400 text-xs font-semibold cursor-pointer transition-all uppercase tracking-wider hover:text-white"
                  >
                    {uploadingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin text-brand-purple" />
                    ) : (
                      <Upload className="w-4 h-4 text-brand-purple" />
                    )}
                    <span>{uploadingPdf ? "Parsing..." : "Upload PDF"}</span>
                  </label>
                </div>
              </div>

              {/* Text Area */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Passage Content (Text)
                </label>
                <textarea
                  rows={8}
                  required
                  value={passageText}
                  onChange={(e) => setPassageText(e.target.value)}
                  placeholder="Paste or write the exam text here..."
                  className="block w-full p-3 bg-slate-950/40 border border-glass-border rounded-lg text-white text-xs focus:outline-none focus:border-brand-purple resize-none focus:ring-1 focus:ring-brand-purple"
                />
              </div>

              <button
                type="submit"
                disabled={savingPassage || !passageText.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-purple text-white text-xs font-bold rounded-lg uppercase tracking-wider hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer shadow-lg hover:shadow-brand-purple/20"
              >
                {savingPassage ? "Saving..." : "Add Passage"}
              </button>
            </form>
          </div>

          {/* List of Passages */}
          <div className="glass-panel p-6 space-y-4 md:col-span-2 h-[550px] flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-glass-border pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-purple" />
              <span>Existing Passages ({passages.length})</span>
            </h3>

            {passages.length > 0 ? (
              <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                {passages.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-glass-border bg-slate-950/30 text-xs flex justify-between gap-4 items-start hover:border-slate-800 transition-all"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-brand-indigo/15 text-brand-indigo font-bold uppercase text-[9px] tracking-wider border border-brand-indigo/20">
                          {p.language}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-brand-purple/15 text-brand-purple font-bold uppercase text-[9px] tracking-wider border border-brand-purple/20">
                          {p.level}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold self-center ml-2">
                          ID: {p.id.substring(0, 8)}...
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-mono whitespace-pre-line border border-glass-border/10 p-2.5 rounded bg-slate-950/50 max-h-24 overflow-y-auto">
                        {p.text}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleDeletePassage(p.id)}
                      className="p-2 border border-glass-border rounded-lg text-slate-400 hover:text-brand-danger hover:border-brand-danger/30 hover:bg-brand-danger/5 transition-all cursor-pointer flex-shrink-0 self-center"
                      title="Delete Passage"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                No exam passages present in the database.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
