import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Sparkles, BookOpen, Brain, CheckCircle2, GraduationCap, AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, signInAsGuest, loading, authError, clearAuthError } = useAuth();
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [guestName, setGuestName] = useState("");

  const handleGoogleLogin = async () => {
    clearAuthError();
    await signInWithGoogle();
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInAsGuest(guestName.trim() || "Student Learner");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 text-slate-900 overflow-hidden">
      {/* Soft blue & lavender ambient gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative subtle floating chips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl shadow-indigo-100/50 p-6 sm:p-8">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white shadow-lg shadow-blue-500/20 mb-4">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              AI StudyMate
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">
              Your personal AI learning assistant
            </p>
          </div>

          {/* Value props pill badges */}
          <div className="grid grid-cols-1 gap-2.5 mb-8">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-xs sm:text-sm">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <Brain className="w-4 h-4" />
              </div>
              <span className="font-medium">Personalized AI Tutor for any topic & coding</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-xs sm:text-sm">
              <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-medium">Custom study plans & milestone roadmaps</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-xs sm:text-sm">
              <div className="p-1.5 rounded-lg bg-violet-100 text-violet-700">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-medium">Interactive dynamic quizzes & progress recall</span>
            </div>
          </div>

          {/* Authentication Error Alert */}
          {authError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-rose-900">Sign-in Notice</p>
                <p className="mt-0.5">{authError}</p>
              </div>
            </motion.div>
          )}

          {/* Primary Google Login Button */}
          <div className="space-y-3">
            <button
              id="google-signin-button"
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full relative flex items-center justify-center gap-3.5 px-5 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] transition duration-200 shadow-sm font-semibold text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Google...</span>
                </div>
              ) : (
                <>
                  {/* Google SVG Icon */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="text-slate-800">Continue with Google</span>
                </>
              )}
            </button>

            {/* Quick Guest / Demo Learner Option (Great for iframe or test environments) */}
            <div className="pt-2 text-center">
              {!showGuestPrompt ? (
                <button
                  type="button"
                  onClick={() => setShowGuestPrompt(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition hover:underline"
                >
                  Or enter as Guest Learner
                </button>
              ) : (
                <form onSubmit={handleGuestSubmit} className="mt-2 space-y-2 text-left">
                  <label className="block text-xs font-medium text-slate-600">
                    Your Name:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Alex"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                    >
                      <span>Enter</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline" />
              <span>Secure authentication & dedicated private study history</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
