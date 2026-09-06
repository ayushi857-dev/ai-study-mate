import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { AppView } from "../types";
import {
  MessageSquare,
  CalendarCheck,
  HelpCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  BookOpen,
} from "lucide-react";
import { motion } from "motion/react";

interface DashboardViewProps {
  onNavigate: (view: AppView) => void;
  onLaunchPrompt: (prompt: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onLaunchPrompt }) => {
  const { user } = useAuth();
  const firstName = user?.displayName ? user.displayName.split(" ")[0] : "Scholar";

  const cards = [
    {
      id: "tutor" as AppView,
      title: "AI Tutor",
      subtitle: "Ask questions and learn with AI",
      description: "Interactive real-time explanations, code walkthroughs, math proofs, and homework guidance.",
      icon: MessageSquare,
      color: "from-blue-500 to-indigo-600",
      accent: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
      border: "hover:border-blue-300 dark:hover:border-blue-700",
      buttonText: "Launch Tutor",
    },
    {
      id: "planner" as AppView,
      title: "Study Planner",
      subtitle: "Create your personalized study plan",
      description: "Generate structured study roadmaps, daily checklists, and spaced repetition schedules.",
      icon: CalendarCheck,
      color: "from-indigo-500 to-violet-600",
      accent: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
      border: "hover:border-indigo-300 dark:hover:border-indigo-700",
      buttonText: "Plan Studies",
    },
    {
      id: "quiz" as AppView,
      title: "Quiz Generator",
      subtitle: "Practice and test your knowledge",
      description: "Generate tailored multiple-choice tests with instant scoring and detailed step-by-step explanations.",
      icon: HelpCircle,
      color: "from-violet-500 to-purple-600",
      accent: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
      border: "hover:border-violet-300 dark:hover:border-violet-700",
      buttonText: "Start Quiz",
    },
    {
      id: "history" as AppView,
      title: "Study History",
      subtitle: "View your learning activity",
      description: "Access all your previous questions, generated plans, and quiz records saved safely to Firestore.",
      icon: Clock,
      color: "from-sky-500 to-blue-600",
      accent: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
      border: "hover:border-sky-300 dark:hover:border-sky-700",
      buttonText: "View History",
    },
  ];

  const quickStarters = [
    "Explain Binary Search in simple words",
    "Explain Python for beginners",
    "Create a DSA study plan",
    "Create a Python quiz",
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Welcome Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-violet-900/20 border border-indigo-100 dark:border-indigo-900/50 p-6 sm:p-10 shadow-xs"
      >
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI-Powered Personal Mentor</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {firstName}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Your personal AI learning dashboard. What would you like to master today?
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate("tutor")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI Tutor</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate("planner")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-sm transition"
            >
              <CalendarCheck className="w-4 h-4 text-indigo-500" />
              <span>Generate Study Plan</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Four Main Feature Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            <span>Learning Modules</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Select any tool to begin</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                onClick={() => onNavigate(card.id)}
                className={`group cursor-pointer relative p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 ${card.border}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-2xl ${card.accent} transition-transform group-hover:scale-105 duration-200`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition duration-200">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-5">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {card.title}
                  </h4>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {card.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>{card.buttonText}</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-indigo-500">→</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Suggested Quick Starts */}
      <div className="pt-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Quick Learning Prompts</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickStarters.map((prompt, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onLaunchPrompt(prompt)}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 text-left hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 group"
            >
              <span className="truncate mr-2">{prompt}</span>
              <span className="shrink-0 text-indigo-600 dark:text-indigo-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                Ask AI →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
