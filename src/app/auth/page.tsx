"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, signIn, signUp, loading: authLoading } = useAuth();

  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const queryMode = searchParams.get("mode");
    if (queryMode === "register") {
      setMode("register");
    } else {
      setMode("login");
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && !authLoading) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      mobileNumber: "",
      dateOfBirth: "",
    },
  });

  const onSubmit = async (data: any) => {
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(data.email, data.password);
        if (error) {
          setErrorMsg(error.message || "Invalid email or password.");
        } else {
          router.push("/dashboard");
        }
      } else {
        const { error } = await signUp(
          data.fullName,
          data.email,
          data.password,
          data.mobileNumber,
          data.dateOfBirth
        );
        if (error) {
          setErrorMsg(error.message || "Failed to create an account.");
        } else {
          reset();
          setErrorMsg(null);
          setTimeout(() => router.push("/dashboard"), 1500);
        }
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setErrorMsg(null);
    setShowPassword(false);
    const newMode = mode === "login" ? "register" : "login";
    setMode(newMode);
    router.push(`/auth?mode=${newMode}`);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-indigo" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 shadow-2xl relative overflow-hidden glow-indigo">

        {/* Glow orb details inside the card */}
        <div className="absolute top-[-30px] right-[-30px] w-20 h-20 rounded-full bg-brand-indigo/25 filter blur-xl pointer-events-none" />
        <div className="absolute bottom-[-30px] left-[-30px] w-20 h-20 rounded-full bg-brand-purple/20 filter blur-xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
            {mode === "login" ? "Sign In" : "Register Student"}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {mode === "login"
              ? "Access Central School of Commerce Typing Portal"
              : "Register to practice and take certifications"}
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-lg bg-brand-danger/10 border border-brand-danger/30 flex items-start gap-3 text-sm text-brand-danger">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Register-only fields */}
          {mode === "register" && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register("fullName", { required: "Full name is required" })}
                  placeholder="Enter your full name"
                  className="block w-full px-4 py-2.5 bg-slate-950/50 border border-glass-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo text-sm"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-brand-danger">{errors.fullName.message}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  {...register("mobileNumber", {
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Invalid mobile number. Must be 10 digits.",
                    },
                  })}
                  placeholder="Enter 10-digit mobile number"
                  className="block w-full px-4 py-2.5 bg-slate-950/50 border border-glass-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo text-sm"
                />
                {errors.mobileNumber && (
                  <p className="mt-1 text-xs text-brand-danger">{errors.mobileNumber.message}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  {...register("dateOfBirth", { required: "Date of birth is required" })}
                  className="block w-full px-4 py-2.5 bg-slate-950/50 border border-glass-border rounded-lg text-white focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo text-sm"
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-xs text-brand-danger">{errors.dateOfBirth.message}</p>
                )}
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              placeholder="you@example.com"
              className="block w-full px-4 py-2.5 bg-slate-950/50 border border-glass-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo text-sm"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-brand-danger">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                placeholder="••••••••"
                className="block w-full pr-12 px-4 py-2.5 bg-slate-950/50 border border-glass-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-brand-indigo transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-brand-danger">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-semibold rounded-lg shadow-lg hover:shadow-brand-indigo/35 hover:brightness-110 active:brightness-95 transition-all disabled:opacity-50 disabled:pointer-events-none text-sm cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {mode === "login"
              ? isSubmitting ? "Signing In..." : "Sign In"
              : isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Mode Toggle */}
        <div className="mt-6 text-center text-sm">
          <span className="text-slate-400">
            {mode === "login" ? "New student? " : "Already registered? "}
          </span>
          <button
            onClick={toggleMode}
            className="font-semibold text-brand-indigo hover:text-brand-indigo-400 hover:underline cursor-pointer"
          >
            {mode === "login" ? "Register here" : "Sign In here"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-indigo" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
