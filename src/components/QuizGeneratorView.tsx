import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { QuizQuestion, QuizResultRecord } from "../types";
import { saveUserQuizResult } from "../lib/studyService";
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  BrainCircuit,
  BarChart,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const QuizGeneratorView: React.FC = () => {
  const { user } = useAuth();

  // Generator inputs
  const [subject, setSubject] = useState("Computer Science");
  const [topic, setTopic] = useState("Python Basics & Data Structures");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState<number>(5);

  // Quiz active state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [savedToDb, setSavedToDb] = useState(false);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !topic.trim()) return;

    setLoading(true);
    setError(null);
    setQuizQuestions([]);
    setUserAnswers({});
    setSubmitted(false);
    setScore(null);
    setSavedToDb(false);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic,
          difficulty,
          questionCount,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate quiz.");
      }

      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuizQuestions(data.questions);
      } else {
        throw new Error("No quiz questions were returned by the AI.");
      }
    } catch (err: any) {
      console.error("Quiz generation error:", err);
      setError(err.message || "Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (quizQuestions.length === 0) return;

    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctOptionIndex) {
        correctCount += 1;
      }
    });

    setScore(correctCount);
    setSubmitted(true);

    // Save to Firestore
    if (user?.uid) {
      const savedId = await saveUserQuizResult(user.uid, {
        subject,
        topic,
        difficulty,
        score: correctCount,
        totalQuestions: quizQuestions.length,
        questions: quizQuestions,
        userAnswers,
      });
      if (savedId) {
        setSavedToDb(true);
      }
    }
  };

  const handleRestartQuiz = () => {
    setUserAnswers({});
    setSubmitted(false);
    setScore(null);
    setSavedToDb(false);
  };

  const answeredCount = Object.keys(userAnswers).length;
  const isAllAnswered = quizQuestions.length > 0 && answeredCount === quizQuestions.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-2">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Adaptive Knowledge Evaluation</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          AI Quiz Generator
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Challenge your understanding with tailored multiple-choice tests created by Gemini.
        </p>
      </div>

      {/* Quiz Form (Only visible when no active quiz or when re-configuring) */}
      {quizQuestions.length === 0 && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleGenerateQuiz}
          className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Science, World History"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Topic
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Recursion & Dynamic Programming"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="Easy">Easy (Fundamental concepts)</option>
                <option value="Medium">Medium (Application & reasoning)</option>
                <option value="Hard">Hard (Deep edge cases & analysis)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Number of Questions
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value={3}>3 Questions (Quick check)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={8}>8 Questions (In-depth review)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-violet-600/20 disabled:opacity-60 transition active:scale-[0.99]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Crafting challenging quiz questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Interactive Quiz</span>
              </>
            )}
          </button>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium text-center">
              {error}
            </p>
          )}
        </motion.form>
      )}

      {/* Active Quiz Card */}
      {quizQuestions.length > 0 && (
        <div className="space-y-6">
          {/* Quiz Status Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                {subject} • {difficulty}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {topic}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500">
                Answered: {answeredCount} / {quizQuestions.length}
              </span>

              <button
                type="button"
                onClick={() => {
                  setQuizQuestions([]);
                  setUserAnswers({});
                  setSubmitted(false);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 transition"
              >
                New Quiz
              </button>
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-6">
            {quizQuestions.map((q, qIdx) => {
              const selectedOpt = userAnswers[qIdx];
              const isCorrect = submitted && selectedOpt === q.correctOptionIndex;
              const isIncorrect = submitted && selectedOpt !== undefined && selectedOpt !== q.correctOptionIndex;

              return (
                <div
                  key={q.id || qIdx}
                  className={`p-6 rounded-2xl bg-white dark:bg-slate-800/90 border transition-all duration-200 shadow-xs ${
                    submitted
                      ? isCorrect
                        ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20"
                        : "border-rose-300 dark:border-rose-800 bg-rose-50/20"
                      : "border-slate-200/80 dark:border-slate-800"
                  }`}
                >
                  {/* Question Prompt */}
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-7 h-7 rounded-xl bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {qIdx + 1}
                    </span>
                    <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                      {q.question}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5 ml-10">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      const isThisCorrect = q.correctOptionIndex === optIdx;

                      let btnStyle = "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60";
                      if (submitted) {
                        if (isThisCorrect) {
                          btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold";
                        } else if (isSelected) {
                          btnStyle = "border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200";
                        }
                      } else if (isSelected) {
                        btnStyle = "border-violet-600 bg-violet-50 dark:bg-violet-950/60 text-violet-900 dark:text-violet-200 font-semibold shadow-xs";
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={submitted}
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm transition flex items-center justify-between ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {submitted && isThisCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {submitted && isSelected && !isThisCorrect && (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Explanation (When submitted) */}
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 ml-10 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed"
                    >
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-violet-500" />
                        <span>Explanation & Concept Walkthrough</span>
                      </p>
                      <p className="text-slate-600 dark:text-slate-300">{q.explanation}</p>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submission and Result Bar */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            {!submitted ? (
              <>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Ready to submit your answers?
                  </p>
                  <p className="text-xs text-slate-500">
                    {isAllAnswered
                      ? "All questions answered. Submit to reveal detailed insights!"
                      : `You have answered ${answeredCount} of ${quizQuestions.length} questions.`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-violet-600/20 active:scale-95 transition"
                >
                  Submit Quiz
                </button>
              </>
            ) : (
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-300 flex items-center justify-center font-bold text-lg">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Your Score: {score} / {quizQuestions.length} (
                      {Math.round(((score || 0) / quizQuestions.length) * 100)}%)
                    </h4>
                    <p className="text-xs text-slate-500">
                      {savedToDb ? "✓ Saved to your Firestore study history" : "Evaluating answers"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleRestartQuiz}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizQuestions([]);
                      setUserAnswers({});
                      setSubmitted(false);
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>New Topic</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
