import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { StudyPlanItem } from "../types";
import { saveUserStudyPlan, fetchUserStudyPlans } from "../lib/studyService";
import Markdown from "react-markdown";
import {
  CalendarCheck,
  Sparkles,
  Clock,
  Target,
  BookOpen,
  CheckCircle2,
  Calendar,
  Layers,
  Save,
  ArrowRight,
  ListTodo,
  FileText,
} from "lucide-react";
import { motion } from "motion/react";

export const StudyPlannerView: React.FC = () => {
  const { user } = useAuth();

  // Form states
  const [subject, setSubject] = useState("Computer Science");
  const [topic, setTopic] = useState("Data Structures & Algorithms (Trees & Graphs)");
  const [currentLevel, setCurrentLevel] = useState("Beginner");
  const [dailyHours, setDailyHours] = useState("2 hours");
  const [targetDate, setTargetDate] = useState("3 weeks");

  // Output states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<StudyPlanItem[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"generator" | "saved">("generator");

  // Load user's saved study plans from Firestore
  useEffect(() => {
    if (user?.uid) {
      fetchUserStudyPlans(user.uid).then((plans) => {
        setSavedPlans(plans);
      });
    }
  }, [user]);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !topic.trim()) return;

    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic,
          currentLevel,
          dailyHours,
          targetDate,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate study plan.");
      }

      const data = await res.json();
      setGeneratedPlan(data.plan);

      // Auto-save generated plan to Firestore for durable student persistence
      if (user?.uid && data.plan) {
        saveUserStudyPlan(user.uid, {
          subject,
          topic,
          currentLevel,
          dailyHours,
          targetDate,
          planContent: data.plan,
        }).then((id) => {
          if (id) {
            setSaveSuccess(true);
            fetchUserStudyPlans(user.uid).then(setSavedPlans);
          }
        });
      }
    } catch (err: any) {
      console.error("Study plan error:", err);
      setError(err.message || "Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSavedPlan = (plan: StudyPlanItem) => {
    setSubject(plan.subject);
    setTopic(plan.topic);
    setCurrentLevel(plan.currentLevel);
    setDailyHours(plan.dailyHours);
    setTargetDate(plan.targetDate);
    setGeneratedPlan(plan.planContent);
    setActiveTab("generator");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>AI Syllabus Architect</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Personalized Study Planner
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Turn any ambitious goal into daily actionable milestones with Gemini.
          </p>
        </div>

        {/* Tab switcher: Generate vs Saved Plans */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("generator")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "generator"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Create Plan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "saved"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <span>Saved Plans</span>
            {savedPlans.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900 text-[10px] text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold">
                {savedPlans.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "saved" ? (
        /* Saved Plans View */
        <div className="space-y-4">
          {savedPlans.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Calendar className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                No saved study plans yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Generate your first study roadmap to have it saved automatically to your profile.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("generator")}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Study Plan</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider mb-1.5">
                      <span>{plan.subject}</span>
                      <span className="text-slate-400 dark:text-slate-500">
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {plan.topic}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700">
                        Level: {plan.currentLevel}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700">
                        Time: {plan.dailyHours}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700">
                        Target: {plan.targetDate}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleSelectSavedPlan(plan)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                    >
                      <span>View Full Plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Generator View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Form Column */}
          <div className="lg:col-span-5 space-y-6">
            <form
              onSubmit={handleGeneratePlan}
              className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" />
                <span>Learning Parameters</span>
              </h3>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Computer Science, Calculus, Biology"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Specific Topic */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic or Target Goal
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Dynamic Programming, Organic Chemistry"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Current Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Knowledge Level
                </label>
                <select
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Absolute Beginner">Absolute Beginner (Starting from scratch)</option>
                  <option value="Beginner">Beginner (Know basic definitions)</option>
                  <option value="Intermediate">Intermediate (Some practical experience)</option>
                  <option value="Advanced">Advanced (Seeking mastery / interview readiness)</option>
                </select>
              </div>

              {/* Daily Study Time & Target Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Daily Study Time
                  </label>
                  <input
                    type="text"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(e.target.value)}
                    placeholder="e.g. 1.5 hours"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Timeframe
                  </label>
                  <input
                    type="text"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    placeholder="e.g. 4 weeks, Exam in 14 days"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 disabled:opacity-60 transition active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Gemini is designing syllabus...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Personalized Study Plan</span>
                  </>
                )}
              </button>

              {saveSuccess && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved to your Firestore study archive</span>
                </p>
              )}
            </form>
          </div>

          {/* Plan Display Column */}
          <div className="lg:col-span-7">
            {loading ? (
              <div className="p-12 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center animate-pulse">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    Architecting Your Study Plan
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Analyzing cognitive milestones, active recall spacing, and practice milestones tailored to your schedule.
                  </p>
                </div>
              </div>
            ) : generatedPlan ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm"
              >
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-700/60">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Target Milestone
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {subject}: {topic}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                    Customized
                  </span>
                </div>

                <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                  <Markdown>{generatedPlan}</Markdown>
                </div>
              </motion.div>
            ) : (
              <div className="p-12 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                <ListTodo className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Ready to Plan Your Study Journey
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Fill in your subject and target timeframe on the left to generate an interactive, milestone-driven roadmap.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
