"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/config/supabase";
import { Loader2, FileCheck, RefreshCw, ChevronLeft, Delete } from "lucide-react";
import Link from "next/link";

export default function TypingTestPage() {
  const params = useParams();
  const language = (params.language as string) || "english";
  const level = (params.level as string) || "junior";

  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  // Test state
  const [passage, setPassage] = useState("");
  const [passageWords, setPassageWords] = useState<string[]>([]);
  const [passageId, setPassageId] = useState<string | null>(null);
  const [dbLoading, setDbLoading] = useState(true);

  // Backspace configuration state
  const [allowBackspace, setAllowBackspace] = useState(false);

  // Controlled aggregate string containing entire typed workflow natively
  const [fullInputValue, setFullInputValue] = useState("");
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);

  // Controls
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  // Metrics
  const [strokes, setStrokes] = useState(0);
  const [errors, setErrors] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [marks, setMarks] = useState(100);
  const [savingResults, setSavingResults] = useState(false);

  // Refs
  const passageContainerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth?mode=login");
    }
  }, [user, authLoading, router]);

  // Load passage
  useEffect(() => {
    if (!user) return;
    const loadPassage = async () => {
      setDbLoading(true);
      try {
        const { data, error } = await supabase
          .from("passages")
          .select("*")
          .eq("language", language)
          .eq("level", level);

        if (error) console.error("Error loading passage:", error.message);

        if (data && data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length);
          const selected = data[randomIndex];
          setPassage(selected.text);
          setPassageId(selected.id);
        } else {
          setPassage("No passage found. Please contact your administrator.");
          setPassageId(null);
        }
      } catch (err) {
        console.error("Failed to query passage:", err);
      } finally {
        setDbLoading(false);
      }
    };
    loadPassage();
  }, [user, language, level]);

  // Parse passage into words
  useEffect(() => {
    if (passage) {
      setPassageWords(passage.trim().split(/\s+/));
    }
  }, [passage]);

  // Timer
  useEffect(() => {
    if (testStarted && timeLeft > 0 && !testFinished) {
      timerRef.current = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && testStarted && !testFinished) {
      handleFinishTest();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [testStarted, timeLeft, testFinished]);

  // Compute live current active segment
  const getActiveWordInput = () => {
    const segments = fullInputValue.split(" ");
    return segments[segments.length - 1] || "";
  };

  // Live metrics calculation loop
  useEffect(() => {
    if (!testStarted || testFinished || passageWords.length === 0) return;
    const timeElapsedMins = (600 - timeLeft) / 60;
    if (timeElapsedMins <= 0) return;

    setWpm(Math.round((strokes / 5) / timeElapsedMins));

    let currentErrors = 0;
    let correctCount = 0;

    passageWords.forEach((word, idx) => {
      if (idx < currentWordIdx) {
        if (typedWords[idx] === word) {
          correctCount++;
        } else {
          currentErrors++;
        }
      } else if (idx === currentWordIdx) {
        const currentSegments = fullInputValue.trim().split(/\s+/);
        const activeText = currentSegments[currentWordIdx] || "";
        if (activeText && activeText !== word) {
          const isMismatch = activeText !== word.slice(0, activeText.length);
          if (isMismatch) currentErrors++;
        }
      } else {
        currentErrors++;
      }
    });

    const totalTyped = typedWords.length;
    setAccuracy(totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 100);
    setErrors(currentErrors);

    const multiplier = level === "junior" ? 1.8 : 1.25;
    setMarks(Math.round(Math.max(0, 100 - currentErrors * multiplier) * 100) / 100);
  }, [fullInputValue, typedWords, strokes, timeLeft, testStarted, testFinished, passageWords, level, currentWordIdx]);

  // Scroll active word into view
  useEffect(() => {
    if (activeWordRef.current && passageContainerRef.current) {
      const container = passageContainerRef.current;
      const activeWord = activeWordRef.current;
      const wordOffsetTop = activeWord.offsetTop - container.offsetTop;
      if (wordOffsetTop >= container.scrollTop + container.clientHeight - 80) {
        container.scrollTo({ top: wordOffsetTop - 100, behavior: "smooth" });
      }
    }
  }, [currentWordIdx]);

  const handleStartTest = () => {
    setTestStarted(true);
    setTestFinished(false);
    setFullInputValue("");
    setTypedWords([]);
    setCurrentWordIdx(0);
    setStrokes(0);
    setErrors(0);
    setWpm(0);
    setAccuracy(100);
    setMarks(100);
    setTimeLeft(600);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    if (!testStarted) {
      setTestStarted(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }

    setFullInputValue(value);

    if (value.endsWith(" ")) {
      const trimmedWords = value.trim().split(/\s+/);
      if (trimmedWords.length > currentWordIdx) {
        const finishedWord = trimmedWords[currentWordIdx];
        if (finishedWord) {
          const newTyped = [...typedWords, finishedWord];
          setTypedWords(newTyped);
          const nextIdx = currentWordIdx + 1;
          setCurrentWordIdx(nextIdx);
          
          if (nextIdx >= passageWords.length) {
            handleFinishTest(newTyped);
          }
        }
      }
    }

    setStrokes((prev) => prev + 1);
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace") {
      // If backspace option is disabled, block it entirely
      if (!allowBackspace) {
        e.preventDefault();
        return;
      }
      
      // If backspace is allowed, we still want to block them from erasing words 
      // that have already been finalized with a space character.
      if (fullInputValue.endsWith(" ") && fullInputValue.length > 0) {
        e.preventDefault();
        return;
      }
    }
    if (e.key === " ") {
      if (fullInputValue.endsWith(" ") || fullInputValue === "") {
        e.preventDefault();
      }
    }
  };

  const handleFinishTest = async (finalTyped: string[] = typedWords) => {
    setTestFinished(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    const currentSegments = fullInputValue.trim().split(/\s+/);
    const activeText = currentSegments[currentWordIdx] || "";
    if (activeText && finalTyped.length === currentWordIdx) {
      finalTyped = [...finalTyped, activeText];
      setTypedWords(finalTyped);
    }

    let finalErrors = 0;
    let correctCount = 0;
    
    passageWords.forEach((word, idx) => {
      if (finalTyped[idx] === word) {
        correctCount++;
      } else {
        finalErrors++;
      }
    });

    const finalAccuracy = finalTyped.length > 0 ? Math.round((correctCount / passageWords.length) * 100) : 0;
    const timeElapsedMins = (600 - timeLeft) / 60 || 0.1;
    const finalWpm = Math.round((strokes / 5) / timeElapsedMins);
    const multiplier = level === "junior" ? 1.8 : 1.25;
    const finalMarks = Math.round(Math.max(0, 100 - finalErrors * multiplier));

    setErrors(finalErrors);
    setAccuracy(finalAccuracy);
    setWpm(finalWpm);
    setMarks(finalMarks);

    setSavingResults(true);
    try {
      if (passageId && user) {
        await supabase.from("test_results").insert({
          user_id: user.id,
          passage_id: passageId,
          wpm: finalWpm,
          accuracy: finalAccuracy,
          strokes: strokes,
          duration_seconds: 600 - timeLeft,
          language: language,
          level: level,
          typed_text: finalTyped.join(" "),
        });
      }
    } catch (err) {
      console.error("Database save exception:", err);
    } finally {
      setSavingResults(false);
    }
  };

  const handlePrevention = (e: React.SyntheticEvent) => e.preventDefault();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (authLoading || dbLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-indigo" />
      </div>
    );
  }

  if (!passage || passageWords.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="glass-panel p-12 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">No Passage Available</h1>
          <p className="text-slate-400 mb-8">No passage found for {language} {level}.</p>
          <Link href="/dashboard" className="text-brand-indigo hover:underline font-semibold">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // RESULTS SCREEN
  if (testFinished) {
    const overallPassed = marks >= 50;
    const correctWords = passageWords.filter((w, i) => typedWords[i] === w).length;

    return (
      <div className="space-y-8 py-4 max-w-5xl mx-auto">
        <div className="glass-panel p-8 text-center glow-indigo relative overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-brand-indigo/10 rounded-full filter blur-xl pointer-events-none" />

          <h1 className="text-4xl font-extrabold text-white mb-8">Test Complete!</h1>

          {/* Marks Card */}
          <div className="mb-8 max-w-sm mx-auto p-6 rounded-2xl border border-glass-border bg-slate-950/40 shadow-2xl flex flex-col items-center">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Total Marks Obtained</span>
            <span className="text-6xl font-black text-brand-indigo my-2">{marks}</span>
            <span className={`px-4 py-1 rounded-full text-xs font-bold text-white mt-1 shadow-md ${overallPassed ? "bg-brand-emerald shadow-brand-emerald/30" : "bg-brand-danger shadow-brand-danger/30"}`}>
              {overallPassed ? "PASSED ✅" : "FAILED ❌"}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            <div className="p-5 rounded-xl bg-slate-950/40 border border-glass-border/30">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Speed</p>
              <p className="text-3xl font-extrabold mt-2 text-white">
                {wpm} <span className="text-xs font-normal text-slate-400">WPM</span>
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-950/40 border border-glass-border/30">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Correct Words</p>
              <p className="text-3xl font-extrabold mt-2 text-brand-emerald">{correctWords}</p>
            </div>
            <div className="p-5 rounded-xl bg-slate-950/40 border border-glass-border/30">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Mistakes</p>
              <p className="text-3xl font-extrabold mt-2 text-brand-danger">{errors}</p>
              <p className="text-[10px] text-slate-500 mt-1">-{level === "senior" ? "1.25" : "1.8"} per mistake</p>
            </div>
            <div className="p-5 rounded-xl bg-slate-950/40 border border-glass-border/30">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Strokes</p>
              <p className="text-3xl font-extrabold mt-2 text-white">{strokes}</p>
            </div>
            <div className="p-5 rounded-xl bg-slate-950/40 border border-glass-border/30">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Accuracy</p>
              <p className="text-3xl font-extrabold mt-2 text-brand-indigo">{accuracy}%</p>
            </div>
          </div>

          {/* Pass / Fail Banner */}
          <div className="mb-8">
            {overallPassed ? (
              <div className="bg-brand-emerald/10 border border-brand-emerald/30 rounded-xl p-6">
                <p className="text-brand-emerald font-semibold text-lg">🎉 Congratulations! You cleared the exam of Central School of Commerce!</p>
              </div>
            ) : (
              <div className="bg-brand-danger/10 border border-brand-danger/30 rounded-xl p-6">
                <p className="text-brand-danger font-semibold text-lg">Keep practicing! You need a minimum of 50 marks to pass.</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center border-t border-glass-border pt-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-8 py-3 bg-slate-950/40 border border-glass-border hover:border-slate-500 text-white font-bold rounded-xl transition-all duration-300"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={handleStartTest}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold rounded-xl hover:brightness-110 active:brightness-95 transition-all shadow-lg hover:shadow-brand-indigo/30"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN TEST SCREEN
  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">

      {/* Header Panel */}
      <div className="glass-panel p-6 glow-indigo">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">

          {/* Title */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 border border-glass-border hover:border-slate-500 rounded-lg text-slate-400 hover:text-white transition-all">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-xs font-semibold tracking-wider text-brand-indigo uppercase mb-1 block">Typing Exam</span>
              <h1 className="text-2xl font-extrabold text-white capitalize">
                {language} — {level}
              </h1>
            </div>
          </div>

          {/* Timer, Backspace Toggle + Start Controls */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-6">
            
            {/* Backspace Toggle Button */}
            <button
              onClick={() => setAllowBackspace(!allowBackspace)}
              disabled={testStarted}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
                testStarted 
                  ? "opacity-50 cursor-not-allowed border-glass-border bg-slate-900 text-slate-500" 
                  : allowBackspace
                    ? "bg-brand-purple/20 border-brand-purple text-brand-purple shadow-md shadow-brand-purple/10"
                    : "bg-slate-950/40 border-glass-border text-slate-400 hover:text-white hover:border-slate-500"
              }`}
              title={testStarted ? "Cannot change mode during an active test" : `Click to ${allowBackspace ? 'Disable' : 'Enable'} Backspace`}
            >
              <Delete className="w-4 h-4" />
              Backspace: {allowBackspace ? "ON (Practice)" : "OFF (Exam)"}
            </button>

            <div className={`text-4xl font-mono font-black tracking-wider ${timeLeft < 60 ? "text-brand-danger animate-pulse" : "text-brand-indigo"}`}>
              {formatTime(timeLeft)}
            </div>

            {!testStarted && (
              <button
                onClick={handleStartTest}
                className="bg-brand-emerald hover:brightness-110 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-brand-emerald/30"
              >
                Start Test
              </button>
            )}
            {testStarted && (
              <button
                onClick={() => handleFinishTest()}
                className="px-5 py-3 border border-brand-danger/35 hover:bg-brand-danger/10 text-brand-danger text-xs font-semibold rounded-xl uppercase tracking-wider transition-all cursor-pointer"
              >
                Submit Early
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-950/40 p-4 rounded-xl border border-glass-border/30 group hover:bg-slate-950/60 transition-all duration-300">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">WPM</p>
            <p className="text-3xl font-extrabold text-brand-indigo mt-1 group-hover:text-brand-indigo/80 transition-colors">{wpm}</p>
          </div>
          <div className="bg-slate-950/40 p-4 rounded-xl border border-glass-border/30 group hover:bg-slate-950/60 transition-all duration-300">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Accuracy</p>
            <p className="text-3xl font-extrabold text-brand-emerald mt-1 group-hover:text-brand-emerald/80 transition-colors">{accuracy}%</p>
          </div>
          <div className="bg-slate-950/40 p-4 rounded-xl border border-glass-border/30 group hover:bg-slate-950/60 transition-all duration-300">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Strokes</p>
            <p className="text-3xl font-extrabold text-brand-purple mt-1 group-hover:text-brand-purple/80 transition-colors">{strokes}</p>
          </div>
        </div>
      </div>

      {/* Passage + Textarea Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Passage */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Original Passage</h2>
          <div
            ref={passageContainerRef}
            className="bg-slate-950/40 border border-glass-border/40 p-6 rounded-xl h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10"
          >
            <div className={`text-slate-300 text-base leading-relaxed tracking-normal flex flex-wrap gap-x-2 gap-y-1 ${language === "tamil" ? "tamil-text" : "font-mono"}`}>
              {passageWords.map((word, i) => {
                const isCurrent = i === currentWordIdx;
                let wordClass = "text-slate-500";

                if (i < currentWordIdx) {
                  wordClass = typedWords[i] === word
                    ? "text-brand-emerald font-semibold"
                    : "text-brand-danger font-semibold underline decoration-wavy";
                } else if (isCurrent) {
                  const currentWordVal = getActiveWordInput();
                  const isMismatch = currentWordVal && currentWordVal !== word.slice(0, currentWordVal.length);
                  wordClass = isMismatch
                    ? "bg-brand-danger/20 text-brand-danger font-bold animate-pulse ring-2 ring-brand-danger/50"
                    : "bg-brand-indigo/20 text-white font-bold animate-pulse ring-2 ring-brand-indigo/50";
                }

                return (
                  <span
                    key={i}
                    ref={isCurrent ? activeWordRef : null}
                    className={`${wordClass} px-1.5 py-0.5 rounded-md transition-all duration-200`}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Typing Area */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Your Typing</h2>
          <div className="relative w-full h-72 rounded-xl bg-slate-950/40 border border-glass-border">
            <textarea
              ref={inputRef}
              value={fullInputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDownInput}
              onPaste={handlePrevention}
              onCopy={handlePrevention}
              onCut={handlePrevention}
              onDragStart={handlePrevention}
              onContextMenu={handlePrevention}
              disabled={testFinished}
              autoFocus={testStarted}
              className={`w-full h-full p-4 bg-transparent border-none outline-none resize-none text-base disabled:opacity-50 disabled:cursor-not-allowed text-white caret-white focus:ring-0 ${language === "tamil" ? "tamil-text" : "font-sans"}`}
              placeholder={testStarted ? "" : 'Click "Start Test" to begin'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}