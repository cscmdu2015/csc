"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Keyboard, 
  Trophy, 
  ChevronDown, 
  User as UserIcon, 
  LogOut, 
  ShieldAlert, 
  Menu, 
  X
} from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [testsDropdownOpen, setTestsDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine if we should show only the school branding layout (Landing Page and Auth Pages)
  const isMinimalPage = pathname === "/" || pathname.startsWith("/auth");

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-glass-border bg-opacity-70 backdrop-blur-md bg-bg-base/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section - Visible Everywhere */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-brand-indigo flex items-center justify-center border border-white/20">
                <Image 
                  src="/my-logo.png" 
                  alt="CSC Logo" 
                  fill 
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <span className="text-sm font-bold tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-emerald sm:text-base">
                CENTRAL SCHOOL OF COMMERCE
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {!isMinimalPage && (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "text-brand-indigo bg-brand-indigo/10"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Dashboard
                </Link>

                {/* Typing Tests Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setTestsDropdownOpen(!testsDropdownOpen);
                      setAccountDropdownOpen(false);
                    }}
                    onBlur={() => setTimeout(() => setTestsDropdownOpen(false), 200)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname.startsWith("/typing-test")
                        ? "text-brand-indigo bg-brand-indigo/10"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Keyboard className="w-4 h-4" />
                    <span>Typing Tests</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${testsDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {testsDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-glass-border bg-slate-900/95 backdrop-blur-xl p-1 shadow-2xl z-50">
                      <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        English Tests
                      </div>
                      <Link
                        href="/typing-test/english/junior"
                        className="flex items-center justify-between px-3 py-2 text-sm rounded-lg text-slate-300 hover:text-white hover:bg-brand-indigo/20 transition-all"
                      >
                        <span>Junior Level</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-indigo/35 text-brand-indigo font-bold">ENG</span>
                      </Link>
                      <Link
                        href="/typing-test/english/senior"
                        className="flex items-center justify-between px-3 py-2 text-sm rounded-lg text-slate-300 hover:text-white hover:bg-brand-indigo/20 transition-all"
                      >
                        <span>Senior Level</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-indigo/35 text-brand-indigo font-bold">ENG</span>
                      </Link>

                      <div className="h-px bg-glass-border my-1" />

                      <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Tamil Tests
                      </div>
                      <Link
                        href="/typing-test/tamil/junior"
                        className="flex items-center justify-between px-3 py-2 text-sm rounded-lg text-slate-300 hover:text-white hover:bg-brand-emerald/20 transition-all"
                      >
                        <span>Junior Level</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-emerald/35 text-brand-emerald font-bold">TAM</span>
                      </Link>
                      <Link
                        href="/typing-test/tamil/senior"
                        className="flex items-center justify-between px-3 py-2 text-sm rounded-lg text-slate-300 hover:text-white hover:bg-brand-emerald/20 transition-all"
                      >
                        <span>Senior Level</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-emerald/35 text-brand-emerald font-bold">TAM</span>
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/leaderboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/leaderboard")
                      ? "text-brand-indigo bg-brand-indigo/10"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Trophy className="w-4 h-4 text-brand-gold" />
                  <span>Leaderboard</span>
                </Link>

                <Link
                  href="/contact"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/contact")
                      ? "text-brand-indigo bg-brand-indigo/10"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Contact
                </Link>

                {/* Admin Panel (If authorized) */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border border-brand-purple/35 transition-colors ${
                      isActive("/admin")
                        ? "text-brand-purple bg-brand-purple/10 border-brand-purple"
                        : "text-brand-purple hover:bg-brand-purple/5 hover:text-brand-purple-400"
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-brand-purple animate-pulse" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Account Profile Section (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {!isMinimalPage && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => {
                        setAccountDropdownOpen(!accountDropdownOpen);
                        setTestsDropdownOpen(false);
                      }}
                      onBlur={() => setTimeout(() => setAccountDropdownOpen(false), 200)}
                      className="flex items-center gap-2 p-1 px-3 border border-glass-border hover:border-brand-indigo rounded-full bg-slate-900/40 text-sm hover:bg-slate-800/40 transition-all cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center text-xs font-bold text-white uppercase">
                        {(profile?.full_name || user.email || "U").substring(0, 2)}
                      </div>
                      <span className="text-slate-300 max-w-[120px] truncate">
                        {profile?.full_name || "Student"}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {accountDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-xl border border-glass-border bg-slate-900/95 backdrop-blur-xl p-1 shadow-2xl z-50">
                        <div className="px-3 py-2 text-xs border-b border-glass-border">
                          <p className="text-slate-400">Signed in as</p>
                          <p className="font-semibold text-slate-200 truncate">{profile?.full_name || user.email}</p>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-3 py-2.5 mt-1 text-sm rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>My Profile</span>
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg text-brand-danger hover:bg-brand-danger/10 transition-all font-medium text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/auth?mode=login"
                      className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth?mode=register"
                      className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-brand-indigo to-brand-purple rounded-lg shadow-lg hover:shadow-brand-indigo/25 transition-all glow-indigo"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            {!isMinimalPage && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && !isMinimalPage && (
        <div className="md:hidden border-t border-glass-border bg-slate-950/95 backdrop-blur-xl p-4 space-y-3 z-50">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5"
          >
            Dashboard
          </Link>
          
          <div className="space-y-1">
            <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase">
              English Exams
            </div>
            <Link
              href="/typing-test/english/junior"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-6 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5"
            >
              English Junior
            </Link>
            <Link
              href="/typing-test/english/senior"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-6 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5"
            >
              English Senior
            </Link>
          </div>

          <div className="space-y-1">
            <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase">
              Tamil Exams
            </div>
            <Link
              href="/typing-test/tamil/junior"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-6 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5"
            >
              Tamil Junior
            </Link>
            <Link
              href="/typing-test/tamil/senior"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-6 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5"
            >
              Tamil Senior
            </Link>
          </div>

          <Link
            href="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5"
          >
            Leaderboard
          </Link>

          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5"
          >
            Contact
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-brand-purple hover:bg-brand-purple/10"
            >
              Admin Panel
            </Link>
          )}

          <div className="h-px bg-glass-border my-2" />

          {user ? (
            <div className="space-y-2">
              <div className="px-3 py-1 text-sm font-bold text-slate-200">
                Hi, {profile?.full_name || "Student"}
              </div>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-400 hover:text-white hover:bg-white/5"
              >
                My Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-lg text-base font-medium text-brand-danger hover:bg-brand-danger/10 cursor-pointer"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/auth?mode=login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-4 py-2 border border-glass-border text-sm font-medium text-slate-300 rounded-lg hover:text-white hover:bg-white/5"
              >
                Sign In
              </Link>
              <Link
                href="/auth?mode=register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-indigo to-brand-purple rounded-lg shadow-lg hover:shadow-brand-indigo/25"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}