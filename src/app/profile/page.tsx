"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/config/supabase";
import { useForm } from "react-hook-form";
import { Loader2, User, Phone, Calendar, Mail, CheckCircle, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();

  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Authenticate check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth?mode=login");
    }
  }, [user, authLoading, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      mobileNumber: "",
      dateOfBirth: "",
    },
  });

  // Pre-fill form values when profile loads
  useEffect(() => {
    if (profile) {
      setValue("fullName", profile.full_name || "");
      setValue("mobileNumber", profile.mobile_number || "");
      setValue("dateOfBirth", profile.date_of_birth || "");
    }
  }, [profile, setValue]);

  const onSubmit = async (data: any) => {
    if (!user) return;
    setIsUpdating(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.fullName,
          mobile_number: data.mobileNumber,
          date_of_birth: data.dateOfBirth || null,
        })
        .eq("id", user.id);

      if (error) {
        setErrorMsg(error.message || "Failed to update profile.");
      } else {
        setSuccessMsg("Profile details updated successfully!");
        await refreshProfile();
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-indigo" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="glass-panel p-8 shadow-2xl relative overflow-hidden glow-indigo">
        
        <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-brand-indigo/15 rounded-full filter blur-xl pointer-events-none" />

        <div className="border-b border-glass-border pb-6 mb-8 text-center sm:text-left">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white">
            Student Profile Details
          </h1>
          <p className="text-slate-400 text-xs mt-1.5">
            Manage your personal verification credentials for Central School of Commerce
          </p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 rounded-lg bg-brand-emerald/10 border border-brand-emerald/30 flex items-start gap-3 text-sm text-brand-emerald">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-lg bg-brand-danger/10 border border-brand-danger/30 flex items-start gap-3 text-sm text-brand-danger">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email (Readonly) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Email Address (Account ID)
            </label>
            <div className="relative opacity-60">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4.5 w-4.5 text-slate-500" />
              </div>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/30 border border-glass-border rounded-lg text-slate-400 text-sm cursor-not-allowed focus:outline-none"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">Contact admin if you need to alter registration emails.</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Full Name (Used in Certificates)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4.5 w-4.5 text-slate-500" />
              </div>
              <input
                type="text"
                {...register("fullName", { required: "Full name is required" })}
                placeholder="Enter your full name"
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-glass-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo text-sm"
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-xs text-brand-danger">{errors.fullName.message}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4.5 w-4.5 text-slate-500" />
              </div>
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
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-glass-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo text-sm"
              />
            </div>
            {errors.mobileNumber && (
              <p className="mt-1 text-xs text-brand-danger">{errors.mobileNumber.message}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Date of Birth
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4.5 w-4.5 text-slate-500" />
              </div>
              <input
                type="date"
                {...register("dateOfBirth", { required: "Date of birth is required" })}
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-glass-border rounded-lg text-white focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo text-sm"
              />
            </div>
            {errors.dateOfBirth && (
              <p className="mt-1 text-xs text-brand-danger">{errors.dateOfBirth.message}</p>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold rounded-lg shadow-lg hover:shadow-brand-indigo/35 hover:brightness-110 active:brightness-95 transition-all disabled:opacity-50 disabled:pointer-events-none text-sm cursor-pointer"
          >
            {isUpdating ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : null}
            Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  );
}
