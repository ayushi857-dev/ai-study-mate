import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { StudyHistoryRecord, AppView } from "../types";
import { fetchUserHistory, deleteHistoryRecord } from "../lib/studyService";
import Markdown from "react-markdown";
import {
  Clock,
  MessageSquare,
  CalendarCheck,
  HelpCircle,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
  X,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StudyHistoryViewProps {
  onNavigate: (view: AppView) => void;
  onSelectPromptForTutor: (prompt: string) => void;
}

export const StudyHistoryView: React.FC<StudyHistoryViewProps> = ({
  onNavigate,
  onSelectPromptForTutor,
}) => {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState<StudyHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [activeItem, setActiveItem] = useState<StudyHistoryRecord | null>(null);

  const loadHistory = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const records = await fetchUserHistory(user.uid);
      setHistoryItems(records);
    } catch (err) {
      console.error("Failed to load study history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const handleDelete = async (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) return;
    const ok = await deleteHistoryRecord(user.uid, recordId);
    if (ok) {
      setHistoryItems((prev) => prev.filter((item) => item.id !== recordId));
      if (activeItem?.id === recordId) {
        setActiveItem(null);
      }
    }
  };

  // Filter items based on query & category
  const filteredItems = historyItems.filter((item) => {
    const matchesType = selectedType === "all" || item.type === selectedType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.question && item.question.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Firestore Persistent Storage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Study History
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review past tutoring sessions, roadmaps, and quiz results linked to your account.
          </p>
        </div>

        {/* Quick action */}
        <button
          type="button"
          onClick={() => onNavigate("tutor")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Study Session</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, question, or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl shrink-0 w-full sm:w-auto overflow-x-auto">
          {["all", "chat", "study-plan", "quiz"].map((typeKey) => {
            const labelMap: Record<string, string> = {
              all: "All Logs",
              chat: "AI Tutor Q&A",
              "study-plan": "Study Plans",
              quiz: "Quizzes",
            };
            return (
              <button
                key={typeKey}
                type="button"
                onClick={() => setSelectedType(typeKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedType === typeKey
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {labelMap[typeKey]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Syncing study records from Firestore...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No study history found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? "No study logs match your current search criteria. Try a different query."
              : "When you ask questions in the AI Tutor, generate roadmaps, or complete quizzes, your progress will be recorded here automatically."}
          </p>
          <button
            type="button"
            onClick={() => onNavigate("tutor")}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
          >
            <span>Ask your first question</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredItems.map((item) => {
            const isChat = item.type === "chat";
            const isPlan = item.type === "study-plan";
            const isQuiz = item.type === "quiz";

            let icon = MessageSquare;
            let badgeBg = "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300";
            let typeLabel = "AI Tutor Q&A";

            if (isPlan) {
              icon = CalendarCheck;
              badgeBg = "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300";
              typeLabel = "Study Plan";
            } else if (isQuiz) {
              icon = HelpCircle;
              badgeBg = "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300";
              typeLabel = "Quiz Record";
            }

            const Icon = icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setActiveItem(item)}
                className="group cursor-pointer p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition shadow-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl ${badgeBg} shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeBg}`}>
                        {typeLabel}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(item.timestamp).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {item.title}
                    </h4>

                    {item.question && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {item.question}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    title="Delete record"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Record Inspection Modal */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {activeItem.type.toUpperCase()} RECORD
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeItem.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {activeItem.question && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 mb-0.5">
                      Question / Topic:
                    </p>
                    <p>{activeItem.question}</p>
                  </div>
                )}

                <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm">
                  <Markdown>{activeItem.content || activeItem.summary}</Markdown>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Logged: {new Date(activeItem.timestamp).toLocaleString()}
                </span>

                <div className="flex items-center gap-2">
                  {activeItem.question && (
                    <button
                      type="button"
                      onClick={() => {
                        const q = activeItem.question!;
                        setActiveItem(null);
                        onSelectPromptForTutor(q);
                        onNavigate("tutor");
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
                    >
                      Re-open in Tutor
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveItem(null)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
