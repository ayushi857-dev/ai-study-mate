import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { AppView } from "../types";
import {
  Bell,
  Sun,
  Moon,
  Clock,
  LogOut,
  User as UserIcon,
  Sparkles,
  ChevronDown,
  BookOpen,
  GraduationCap,
} from "lucide-react";

interface TopNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenMobileMenu?: () => void;
}

const VIEW_TITLES: Record<AppView, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Your personal learning center" },
  tutor: { title: "AI Tutor", subtitle: "Conversational intelligent mentoring" },
  planner: { title: "Study Planner", subtitle: "Personalized syllabus & milestones" },
  quiz: { title: "Quiz Generator", subtitle: "Interactive knowledge evaluations" },
  history: { title: "Study History", subtitle: "Your archived Q&A and progress logs" },
};

export const TopNav: React.FC<TopNavProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const viewMeta = VIEW_TITLES[currentView] || VIEW_TITLES.dashboard;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Student";
  const photoUrl = user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

  return (
    <header className="sticky top-0 z-20 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>{viewMeta.title}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {viewMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Quick Study Tip / Notification */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Study Assistant Updates
                </span>
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="mt-3 space-y-2.5">
                <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs">
                  <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                    💡 Daily Retention Tip
                  </p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Active recall through interactive quizzes boosts long-term memory retention by up to 50% compared to passive reading.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    🎯 AI Gemini 2.5 Active
                  </p>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    Connected to secure server-side Gemini tutor for instant step-by-step guidance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
          >
            <img
              src={photoUrl}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-indigo-200 dark:border-indigo-800 shadow-sm"
            />
            <span className="hidden md:block text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Profile Details Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={photoUrl}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full border border-indigo-200 dark:border-indigo-800"
                  />
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.email || "Guest Learner"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate("history");
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Study History</span>
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-2.5">
                    {theme === "light" ? (
                      <Sun className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-indigo-400" />
                    )}
                    <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">Toggle</span>
                </button>
              </div>

              {/* Logout button */}
              <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800 p-1">
                <button
                  type="button"
                  onClick={async () => {
                    setProfileOpen(false);
                    await logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
