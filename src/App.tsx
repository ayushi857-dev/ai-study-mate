import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LoginPage } from "./components/LoginPage";
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { DashboardView } from "./components/DashboardView";
import { AITutorView } from "./components/AITutorView";
import { StudyPlannerView } from "./components/StudyPlannerView";
import { QuizGeneratorView } from "./components/QuizGeneratorView";
import { StudyHistoryView } from "./components/StudyHistoryView";
import { AppView } from "./types";
import { GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function MainApp() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [initialPrompt, setInitialPrompt] = useState<string>("");

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 animate-pulse">
          <GraduationCap className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Loading AI StudyMate...
        </p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleLaunchPrompt = (prompt: string) => {
    setInitialPrompt(prompt);
    setCurrentView("tutor");
  };

  const handleNewChat = () => {
    setInitialPrompt("");
    setCurrentView("tutor");
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onNewChat={handleNewChat}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden pb-14 md:pb-0">
        <TopNav currentView={currentView} onNavigate={(view) => setCurrentView(view)} />

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {currentView === "dashboard" && (
                <DashboardView
                  onNavigate={(view) => setCurrentView(view)}
                  onLaunchPrompt={handleLaunchPrompt}
                />
              )}
              {currentView === "tutor" && (
                <AITutorView
                  initialPrompt={initialPrompt}
                  onClearInitialPrompt={() => setInitialPrompt("")}
                  onNavigate={(view) => setCurrentView(view)}
                />
              )}
              {currentView === "planner" && <StudyPlannerView />}
              {currentView === "quiz" && <QuizGeneratorView />}
              {currentView === "history" && (
                <StudyHistoryView
                  onNavigate={(view) => setCurrentView(view)}
                  onSelectPromptForTutor={handleLaunchPrompt}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

