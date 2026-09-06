import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ChatMessage, AppView } from "../types";
import { saveToHistory } from "../lib/studyService";
import Markdown from "react-markdown";
import {
  GraduationCap,
  Send,
  Plus,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  BookOpen,
  Code,
  Compass,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AITutorViewProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onNavigate?: (view: AppView) => void;
}

export const AITutorView: React.FC<AITutorViewProps> = ({
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showQuickOptions, setShowQuickOptions] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const firstName = user?.displayName ? user.displayName.split(" ")[0] : "Scholar";
  const userPhoto = user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}`;

  const suggestionCards = [
    {
      title: "Explain Binary Search in simple words",
      category: "Computer Science",
      icon: Code,
    },
    {
      title: "Explain Python for beginners",
      category: "Programming",
      icon: BookOpen,
    },
    {
      title: "Create a DSA study plan",
      category: "Roadmap",
      icon: Compass,
    },
    {
      title: "Create a Python quiz",
      category: "Practice",
      icon: Sparkles,
    },
  ];

  // Handle incoming initial prompt (from dashboard quick launch)
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt.trim());
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : input).trim();
    if (!query || loading) return;

    setErrorMessage(null);
    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: query,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setLoading(true);

    try {
      // Call backend secure Gemini API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: query,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to receive response from Gemini.");
      }

      const data = await response.json();
      const aiReply = data.reply || "I am ready for your next study question.";

      const aiMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: aiReply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Save to user Firestore history in background
      if (user?.uid) {
        saveToHistory(user.uid, {
          title: query.slice(0, 45) + (query.length > 45 ? "..." : ""),
          question: query,
          summary: aiReply.slice(0, 100) + (aiReply.length > 100 ? "..." : ""),
          content: aiReply,
          type: "chat",
        }).catch((err) => console.warn("Firestore save notice:", err));
      }
    } catch (err: any) {
      console.error("AI Tutor chat error:", err);
      setErrorMessage(
        err.message || "An error occurred connecting to the AI Tutor. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
    setErrorMessage(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] max-w-5xl mx-auto w-full relative">
      {/* Top action bar when messages exist */}
      {messages.length > 0 && (
        <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            Study Session • {messages.length} messages
          </span>
          <button
            type="button"
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>
        </div>
      )}

      {/* Main Messages & Empty State Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-auto py-8">
            {/* AI StudyMate Icon */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-5">
              <GraduationCap className="w-9 h-9" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hello, {firstName}
            </h2>
            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mt-1 font-medium">
              What can I help you learn today?
            </p>

            {/* 4 Required Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mt-8">
              {suggestionCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(card.title)}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition duration-150 text-left group flex items-start justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                        {card.category}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {card.title}
                      </p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/60 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition shrink-0 ml-2">
                      <Icon className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-3 sm:gap-4 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 text-sm ${
                      isUser
                        ? "bg-indigo-600 text-white rounded-br-xs shadow-sm"
                        : "bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-bl-xs shadow-xs"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed font-normal">{msg.content}</p>
                    ) : (
                      <div className="prose dark:prose-invert prose-sm max-w-none leading-relaxed text-slate-800 dark:text-slate-200">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    )}

                    {/* Action Bar for AI response (Copy, Timestamp) */}
                    {!isUser && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                        <span>AI Tutor • Gemini</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy response</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <img
                      src={userPhoto}
                      alt={firstName}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-xl object-cover border border-indigo-200 shrink-0 mt-0.5"
                    />
                  )}
                </motion.div>
              );
            })}

            {/* Thinking / Typing indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 sm:gap-4 items-start"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <GraduationCap className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-xs p-4 shadow-xs flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse [animation-delay:0.4s]" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    AI StudyMate is preparing step-by-step guidance...
                  </span>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Unable to fetch explanation</p>
                  <p className="mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick Option Topics Menu */}
      <AnimatePresence>
        {showQuickOptions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 left-4 right-4 sm:left-6 sm:right-6 max-w-xl mx-auto p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-20 space-y-1"
          >
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
              Quick Prompt Starters
            </p>
            {suggestionCards.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setShowQuickOptions(false);
                  handleSendMessage(item.title);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition"
              >
                <span>{item.title}</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Input Bar at Bottom */}
      <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-2 sm:p-2.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition shadow-xs"
        >
          {/* Plus button for quick ideas */}
          <button
            type="button"
            title="Quick Learning Starters"
            onClick={() => setShowQuickOptions(!showQuickOptions)}
            className="p-2 sm:p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 transition shrink-0"
          >
            <Plus className={`w-5 h-5 transition-transform ${showQuickOptions ? "rotate-45" : ""}`} />
          </button>

          {/* Textarea input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI StudyMate anything..."
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base resize-none focus:outline-none max-h-40 py-1.5 px-1 leading-relaxed"
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition shrink-0 shadow-sm active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-2 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            AI StudyMate teaches with step-by-step clarity • Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
};
