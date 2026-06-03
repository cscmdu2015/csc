"use client";

import React, { useEffect, useState, useRef, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/config/supabase";
import { 
  Loader2, 
  Play, 
  RefreshCw, 
  FileCheck, 
  XCircle, 
  Download, 
  ShieldAlert, 
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";

// Preset fallbacks if Supabase database passages are not seeded yet
const DEFAULT_PASSAGES = {
  english: {
    junior: "The quick brown fox jumps over the lazy dog. Continuous typing practice helps build finger memory and rhythm. Typing at a steady speed is often better than bursts of speed that lead to mistakes. Keep your eyes on the screen and try not to look down at your hands. Position your fingers on the home row keys. Practice with common business letters and reports to improve your commercial typing speed. Regular training is the key to success.",
    senior: "Dear Sir, We are in receipt of your letter dated tenth ultimo regarding the supply of office typewriters. We regret to inform you that owing to an unexpected strike in our factory, we are unable to execute your order within the specified date. We hope to resume normal production by next week and will dispatch the machines immediately thereafter. We thank you for your kind patience in this regard. Yours faithfully, Manager, Central Commerce Company."
  },
  tamil: {
    junior: "தமிழ் மொழி மிகவும் பழமையான மற்றும் வளமையான தொன்மை வாய்ந்த மொழியாகும். தட்டச்சு பயிற்சி செய்வதன் மூலம் நாம் வேகமாகவும் பிழையின்றியும் எழுத முடியும். தினமும் பயிற்சி செய்வது தட்டச்சில் தேர்ச்சி பெற உதவும். உங்கள் விரல்களை சரியான முறையில் விசைப்பலகையில் வைக்கவும். கவனம் எப்போதும் திரையிலேயே இருக்க வேண்டும். மெதுவாகவும் நேர்த்தியாகவும் தட்டச்சு செய்யத் தொடங்கி படிப்படியாக வேகத்தை அதிகரிக்கவும்.",
    senior: "அன்புடையீர், வணக்கம். தங்களின் கடிதம் கிடைக்கப் பெற்றோம். எங்களது வணிகப் பள்ளியில் புதிய தட்டச்சு இயந்திரங்கள் வாங்குவது தொடர்பாக தாங்கள் அனுப்பிய விலைப்பட்டியல் பரிசீலனையில் உள்ளது. அடுத்த வாரத்திற்குள் தகுந்த முடிவை அறிவிக்கிறோம். எங்களது மாணவர்களின் பயிற்சிக்கு ஏற்றவாறு உயர்தர விசைப்பலகைகளை வழங்குமாறு கேட்டுக் கொள்கிறோம். தங்கள் நம்பிக்கையுள்ள, முதல்வர், மத்திய வணிகவியல் பள்ளி."
  }
};

// Keyboard layout configurations
const KEYBOARD_ROWS = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
  ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["CapsLock", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
  ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "Shift"],
  ["Space"]
];

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

  const [inputVal, setInputVal] = useState("");
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  
  // Controls
  const [allowBackspace, setAllowBackspace] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600 seconds)
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Metrics telemetry
  const [strokes, setStrokes] = useState(0);
  const [errors, setErrors] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [marks, setMarks] = useState(100);
  const [savingResults, setSavingResults] = useState(false);

  // Refs for scrolling and input focus
  const passageContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Authenticate check
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

        if (error) {
          console.error("Error loading passage:", error.message);
        }

        if (data && data.length > 0) {
          // Select latest uploaded passage matching requirements
          const selected = data[0];
          setPassage(selected.text);
          setPassageId(selected.id);
        } else {
          // Preset Fallback
          const fallbackMap = DEFAULT_PASSAGES[language as keyof typeof DEFAULT_PASSAGES];
          const text = fallbackMap ? fallbackMap[level as keyof typeof fallbackMap] : "Default passage content.";
          setPassage(text);
          setPassageId(null);
        }
      } catch (err) {
        console.error("Failed to query passage table:", err);
      } finally {
        setDbLoading(false);
      }
    };

    loadPassage();
  }, [user, language, level]);

  // Handle word formatting arrays
  useEffect(() => {
    if (passage) {
      const words = passage.trim().split(/\s+/);
      setPassageWords(words);
    }
  }, [passage]);

  // Keyboard Event Listeners for virtual visual feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key = e.key;
      if (key === " ") key = "Space";
      setActiveKey(key);
    };

    const handleKeyUp = () => {
      setActiveKey(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Timer loop logic
  useEffect(() => {
    if (testStarted && timeLeft > 0 && !testFinished) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && testStarted && !testFinished) {
      handleFinishTest();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [testStarted, timeLeft, testFinished]);

  // Telemetry Calculations
  useEffect(() => {
    if (!testStarted || testFinished) return;

    const timeElapsedMins = (600 - timeLeft) / 60;
    if (timeElapsedMins <= 0) return;

    // Gross WPM = (Total characters typed / 5) / (Elapsed time in minutes)
    const computedWpm = Math.round((strokes / 5) / timeElapsedMins);
    setWpm(computedWpm);

    // Calculate mistakes and accuracy
    let correctCount = 0;
    typedWords.forEach((word, idx) => {
      if (word === passageWords[idx]) {
        correctCount++;
      }
    });

    const totalTypedWords = typedWords.length;
    const computedAccuracy = totalTypedWords > 0 
      ? Math.round((correctCount / totalTypedWords) * 100) 
      : 100;
    setAccuracy(computedAccuracy);

    // Errors count
    let currentErrors = 0;
    typedWords.forEach((word, idx) => {
      if (word !== passageWords[idx]) {
        currentErrors++;
      }
    });
    setErrors(currentErrors);

    // Marks Calculations
    // Junior deducts 1.8 marks per error. Senior deducts 1.25 marks. Base marks: 100
    const multiplier = level === "junior" ? 1.8 : 1.25;
    const computedMarks = Math.max(0, 100 - (currentErrors * multiplier));
    setMarks(Math.round(computedMarks * 100) / 100);

  }, [inputVal, typedWords, strokes, timeLeft, testStarted, testFinished, passageWords, level]);

  // Start Typing Core trigger
  const handleStartTest = () => {
    setTestStarted(true);
    setInputVal("");
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

  // Auto-scroll passage viewport element
  const scrollActiveWordIntoView = (index: number) => {
    const activeWordEl = document.getElementById(`word-${index}`);
    if (activeWordEl && passageContainerRef.current) {
      const container = passageContainerRef.current;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      
      const elemTop = activeWordEl.offsetTop;
      const elemBottom = elemTop + activeWordEl.clientHeight;

      if (elemTop < containerTop + 20 || elemBottom > containerBottom - 20) {
        container.scrollTo({
          top: elemTop - container.clientHeight / 2 + activeWordEl.clientHeight / 2,
          behavior: "smooth"
        });
      }
    }
  };

  // Key Down Input Filter handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Auto-start if not started
    if (!testStarted) {
      setTestStarted(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }

    // Check if user hit space
    if (value.endsWith(" ")) {
      const word = value.trim();
      if (word) {
        const nextIdx = currentWordIdx + 1;
        const newTyped = [...typedWords, word];
        setTypedWords(newTyped);
        setCurrentWordIdx(nextIdx);
        setInputVal("");

        // Check if finished passage early
        if (nextIdx >= passageWords.length) {
          handleFinishTest(newTyped);
        } else {
          scrollActiveWordIntoView(nextIdx);
        }
      }
    } else {
      setInputVal(value);
    }

    // Count stroke characters
    setStrokes((prev) => prev + 1);
  };

  // Backspace key validation override
  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace" && !allowBackspace) {
      e.preventDefault();
    }
  };

  // Finish exam triggers saving
  const handleFinishTest = async (finalTyped: string[] = typedWords) => {
    setTestFinished(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    // Final checks
    let finalErrors = 0;
    finalTyped.forEach((word, idx) => {
      if (word !== passageWords[idx]) {
        finalErrors++;
      }
    });

    // Check if the current word has some typos before submission
    const activeText = inputVal.trim();
    if (activeText) {
      finalTyped.push(activeText);
      setTypedWords(finalTyped);
      if (activeText !== passageWords[currentWordIdx]) {
        finalErrors++;
      }
    }

    const correctCount = finalTyped.filter((w, i) => w === passageWords[i]).length;
    const finalAccuracy = finalTyped.length > 0 ? Math.round((correctCount / passageWords.length) * 100) : 0;
    
    const timeElapsedMins = (600 - timeLeft) / 60 || 0.1;
    const finalWpm = Math.round((strokes / 5) / timeElapsedMins);
    
    const multiplier = level === "junior" ? 1.8 : 1.25;
    const finalMarks = Math.round(Math.max(0, 100 - (finalErrors * multiplier)));

    setErrors(finalErrors);
    setAccuracy(finalAccuracy);
    setWpm(finalWpm);
    setMarks(finalMarks);

    // Save to Database
    setSavingResults(true);
    try {
      // Ensure passage is registered. If using fallbacks, we seed it first or map it to a system dummy.
      let dbPassageId = passageId;
      if (!dbPassageId) {
        // Find or create default passage record to avoid constraint failures
        const { data: psgData } = await supabase
          .from("passages")
          .select("id")
          .eq("text", passage)
          .single();

        if (psgData) {
          dbPassageId = psgData.id;
        } else {
          // Quick seed
          const { data: newPsg } = await supabase
            .from("passages")
            .insert({ text: passage, language, level })
            .select()
            .single();
          dbPassageId = newPsg?.id || null;
        }
      }

      if (dbPassageId && user) {
        const { error } = await supabase
          .from("test_results")
          .insert({
            user_id: user.id,
            passage_id: dbPassageId,
            wpm: finalWpm,
            accuracy: finalAccuracy,
            strokes: strokes,
            duration_seconds: 600 - timeLeft,
            language: language,
            level: level,
            typed_text: finalTyped.join(" ")
          });

        if (error) {
          console.error("Error saving result to DB:", error.message);
        }
      }
    } catch (err) {
      console.error("Database save exception:", err);
    } finally {
      setSavingResults(false);
    }
  };

  // Safe PDF download trigger (jsPDF)
  const generateCertificate = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: "a4"
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Dark Blue Border Style
    doc.setFillColor(11, 15, 25);
    doc.rect(0, 0, width, height, "F");

    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(4);
    doc.rect(15, 15, width - 30, height - 30, "D");

    doc.setDrawColor(168, 85, 247);
    doc.setLineWidth(1.5);
    doc.rect(20, 20, width - 40, height - 40, "D");

    // Title branding
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(24);
    doc.text("CENTRAL SCHOOL OF COMMERCE", width / 2, 70, { align: "center" });

    doc.setTextColor(168, 85, 247);
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(14);
    doc.text("Madurai, Tamil Nadu, India", width / 2, 90, { align: "center" });

    // Certificate header
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(28);
    doc.text("CERTIFICATE OF PROFICIENCY", width / 2, 140, { align: "center" });

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(200, 200, 200);
    doc.text("This is to certify that the student", width / 2, 180, { align: "center" });

    // Student name
    doc.setTextColor(16, 185, 129);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text(profile?.full_name?.toUpperCase() || user?.email?.toUpperCase() || "TYPIST", width / 2, 210, { align: "center" });

    // Achievement text
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(180, 180, 180);
    const examDesc = `has successfully cleared the typing evaluation in ${language.toUpperCase()} (${level.toUpperCase()}) language configuration.`;
    doc.text(examDesc, width / 2, 240, { align: "center" });

    // Details Grid box
    doc.setFillColor(30, 41, 59);
    doc.rect(50, 270, width - 100, 60, "F");
    doc.setDrawColor(255, 255, 255, 0.1);
    doc.rect(50, 270, width - 100, 60, "D");

    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.text("SPEED", 120, 290, { align: "center" });
    doc.text("ACCURACY", width / 2, 290, { align: "center" });
    doc.text("MARKS SECURED", width - 120, 290, { align: "center" });

    doc.setTextColor(99, 102, 241);
    doc.setFontSize(16);
    doc.text(`${wpm} WPM`, 120, 315, { align: "center" });
    doc.text(`${accuracy}%`, width / 2, 315, { align: "center" });
    doc.text(`${marks} / 100`, width - 120, 315, { align: "center" });

    // Date and signature
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.setFont("Helvetica", "normal");
    doc.text(`Verification Date: ${new Date().toLocaleDateString()}`, 80, 370);
    
    doc.text("__________________________", width - 200, 365);
    doc.text("Principal & Director", width - 150, 380);

    doc.save(`CSC_Typing_Certificate_${profile?.full_name || "Student"}.pdf`);
  };

  // Anti-cheat prevention
  const handlePrevention = (e: React.SyntheticEvent) => {
    e.preventDefault();
  };

  if (authLoading || dbLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-indigo" />
      </div>
    );
  }

  // Formatting remaining timer digits
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8 py-4 max-w-6xl mx-auto">
      
      {/* Top Test Header Control */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 glass-panel glow-indigo">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 border border-glass-border hover:border-slate-500 rounded-lg text-slate-400 hover:text-white transition-all">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              Typing Exam Arena
            </h1>
            <p className="text-slate-400 text-xs mt-0.5 capitalize">
              Language: {language} | Level: {level}
            </p>
          </div>
        </div>

        {/* Real-time Stat Panel */}
        <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-wider">
          <div className="bg-slate-950/40 p-2.5 px-4 rounded-lg border border-glass-border">
            <span className="text-slate-500 block mb-0.5">Timer</span>
            <span className={`text-sm font-extrabold ${timeLeft < 60 ? "text-brand-danger animate-pulse" : "text-white"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="bg-slate-950/40 p-2.5 px-4 rounded-lg border border-glass-border">
            <span className="text-slate-500 block mb-0.5">Speed</span>
            <span className="text-sm font-extrabold text-brand-indigo">{wpm} WPM</span>
          </div>
          <div className="bg-slate-950/40 p-2.5 px-4 rounded-lg border border-glass-border">
            <span className="text-slate-500 block mb-0.5">Accuracy</span>
            <span className="text-sm font-extrabold text-brand-emerald">{accuracy}%</span>
          </div>
          <div className="bg-slate-950/40 p-2.5 px-4 rounded-lg border border-glass-border">
            <span className="text-slate-500 block mb-0.5">Marks</span>
            <span className="text-sm font-extrabold text-brand-purple">{marks} / 100</span>
          </div>
        </div>
      </div>

      {/* CORE SANDBOX COMPONENT (ACTIVE TEST RUN) */}
      {!testFinished ? (
        <div className="space-y-6">
          {/* Target Text Box */}
          <div className="relative">
            {/* Blurry start cover if not started */}
            {!testStarted && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-xl border border-glass-border gap-4">
                <Play className="w-10 h-10 text-brand-indigo animate-bounce" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Click Begin to start 10-Minute Typing Exam</h3>
                <button
                  onClick={handleStartTest}
                  className="px-6 py-2.5 bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold rounded-lg uppercase tracking-wider hover:brightness-110 active:brightness-95 transition-all shadow-lg hover:shadow-brand-indigo/25 cursor-pointer"
                >
                  Begin Typing Test
                </button>
              </div>
            )}

            <div 
              ref={passageContainerRef}
              className="glass-panel p-6 h-60 overflow-y-auto leading-relaxed text-sm md:text-base select-none font-mono text-slate-400 border border-glass-border/40 scroll-smooth"
            >
              {passageWords.map((word, wIdx) => {
                let colorClass = "text-slate-500";
                let underlineClass = "";
                let glowFrame = "";

                if (wIdx < currentWordIdx) {
                  // Past typed words color checks
                  if (typedWords[wIdx] === word) {
                    colorClass = "text-brand-emerald font-semibold";
                  } else {
                    colorClass = "text-brand-danger font-semibold";
                    underlineClass = "wavy-underline";
                  }
                } else if (wIdx === currentWordIdx) {
                  // Active pulsing frame
                  colorClass = "text-white font-bold";
                  glowFrame = "px-1.5 py-0.5 border border-brand-indigo/40 rounded bg-brand-indigo/10 caret-active shadow-sm shadow-brand-indigo/10";
                }

                return (
                  <span 
                    key={wIdx} 
                    id={`word-${wIdx}`} 
                    className={`${colorClass} ${underlineClass} ${glowFrame} inline-block mr-2 transition-all duration-150`}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Toggle and Input section */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAllowBackspace(!allowBackspace)}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white uppercase transition-colors"
                >
                  {allowBackspace ? (
                    <ToggleRight className="w-9 h-9 text-brand-emerald cursor-pointer" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-600 cursor-pointer" />
                  )}
                  <span>Toggle Backspace: {allowBackspace ? "Enabled" : "Disabled"}</span>
                </button>
              </div>

              {testStarted && (
                <button
                  onClick={() => handleFinishTest()}
                  className="px-5 py-2 border border-brand-danger/35 hover:bg-brand-danger/10 text-brand-danger text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                >
                  Submit Early
                </button>
              )}
            </div>

            {/* Typing text area area - anti cheat hooks */}
            <textarea
              ref={inputRef}
              rows={4}
              value={inputVal}
              onChange={handleInputChange}
              onKeyDown={handleKeyDownInput}
              onPaste={handlePrevention}
              onCopy={handlePrevention}
              onCut={handlePrevention}
              onDragStart={handlePrevention}
              onContextMenu={handlePrevention}
              placeholder="Keep typing target words here. Hits space to move onto the next word..."
              className="block w-full p-4 bg-slate-950/40 border border-glass-border rounded-lg text-white text-sm focus:outline-none focus:border-brand-indigo resize-none focus:ring-1 focus:ring-brand-indigo select-none"
            />
          </div>

          {/* Virtual Keyboard Highlights */}
          <div className="glass-panel p-6 space-y-4 hidden sm:block">
            <div className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-brand-indigo animate-pulse" />
              <span>Interactive Virtual Keyboard Guide</span>
            </div>
            
            <div className="space-y-1.5 max-w-2xl mx-auto">
              {KEYBOARD_ROWS.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-center gap-1.5 text-[10px] uppercase font-bold text-slate-400">
                  {row.map((key) => {
                    const isKeyActive = activeKey?.toLowerCase() === key.toLowerCase() || 
                                       (key === "Space" && activeKey === " ") ||
                                       (key === "Shift" && activeKey === "Shift");

                    // Custom key sizing
                    let keyWidth = "w-8.5";
                    if (key === "Backspace") keyWidth = "w-16";
                    else if (key === "Tab") keyWidth = "w-11";
                    else if (key === "CapsLock") keyWidth = "w-14";
                    else if (key === "Enter") keyWidth = "w-15";
                    else if (key === "Shift") keyWidth = "w-17.5";
                    else if (key === "Space") keyWidth = "w-72";

                    return (
                      <div
                        key={key}
                        className={`h-8.5 ${keyWidth} rounded border border-glass-border/70 flex items-center justify-center bg-slate-950/40 transition-all font-semibold ${
                          isKeyActive ? "key-press-active" : ""
                        }`}
                      >
                        {key}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        
        /* COMPLETION SCREEN */
        <div className="glass-panel p-8 max-w-2xl mx-auto space-y-8 relative overflow-hidden glow-indigo">
          <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-brand-indigo/10 rounded-full filter blur-xl pointer-events-none" />

          {/* Marks Banner */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-brand-indigo/10 border border-brand-indigo/35 text-brand-indigo mb-2">
              <FileCheck className="w-10 h-10 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white">Exam Report Summary</h2>
            
            {/* Status pass/fail banner */}
            {marks >= 50 ? (
              <div className="p-4 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald font-bold max-w-sm mx-auto text-sm">
                🎉 Congratulations! You cleared the exam of Central School of Commerce!
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/30 text-brand-danger font-bold max-w-sm mx-auto text-sm">
                ❌ Exam Failed. Minimum Passing Limit Score: 50 Marks.
              </div>
            )}
          </div>

          {/* Visual statistics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/40 p-5 rounded-xl border border-glass-border/30 text-center uppercase tracking-wider">
            <div>
              <p className="text-[10px] text-slate-500 font-semibold mb-1">Final Score</p>
              <p className="text-xl font-black text-white">{marks} / 100</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold mb-1">Typing Speed</p>
              <p className="text-xl font-black text-brand-indigo">{wpm} WPM</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold mb-1">Accuracy</p>
              <p className="text-xl font-black text-brand-emerald">{accuracy}%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold mb-1">Errors</p>
              <p className="text-xl font-black text-brand-danger">{errors}</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap justify-center gap-4 border-t border-glass-border pt-6">
            <button
              onClick={handleStartTest}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 border border-glass-border hover:border-slate-500 text-slate-200 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Practice</span>
            </button>

            {marks >= 50 && (
              <button
                onClick={generateCertificate}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-emerald to-teal-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider hover:brightness-110 active:brightness-95 transition-all shadow-lg hover:shadow-brand-emerald/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            )}

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold rounded-lg uppercase tracking-wider hover:brightness-110 active:brightness-95 transition-all shadow-lg hover:shadow-brand-indigo/20 cursor-pointer"
            >
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
