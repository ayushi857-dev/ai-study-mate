import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { AppView } from "../types";
import {
  GraduationCap,
  Plus,
  LayoutDashboard,
  MessageSquare,
  CalendarCheck,
  HelpCircle,
  Clock,
  Sun,
  Moon,
  LogOut,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onNewChat }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Student";
  const photoUrl = user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

  const navItems = [
    { id: "dashboard" as AppView, label: "Dashboard", icon: LayoutDashboard },
    { id: "tutor" as AppView, label: "AI Tutor", icon: MessageSquare },
    { id: "planner" as AppView, label: "Study Planner", icon: CalendarCheck },
    { id: "quiz" as AppView, label: "Quiz Generator", icon: HelpCircle },
    { id: "history" as AppView, label: "Study History", icon: Clock },
  ];

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors shrink-0 select-none">
        {/* Logo Section */}
        <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition duration-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                AI StudyMate
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  AI
                </span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block -mt-0.5">
                Smart Learning Partner
              </span>
            </div>
          </button>
        </div>

        {/* New Chat Primary Action Button */}
        <div className="px-4 pt-4 pb-2">
          <button
            type="button"
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-[0.99] transition duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 text-left ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Theme Toggle Button */}
        <div className="px-4 py-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-xs text-slate-700 dark:text-slate-300"
          >
            <div className="flex items-center gap-2">
              {theme === "light" ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
              <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
              {theme === "light" ? "☀ Active" : "☾ Active"}
            </span>
          </button>
        </div>

        {/* User Profile Section at bottom */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={photoUrl}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-indigo-200 dark:border-indigo-800 shrink-0 object-cover"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  {user?.email || "Student Account"}
                </p>
              </div>
            </div>

            <button
              type="button"
              title="Sign Out"
              aria-label="Sign Out"
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] transition ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
