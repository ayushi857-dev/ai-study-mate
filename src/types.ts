export type AppView = "dashboard" | "tutor" | "planner" | "quiz" | "history";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface StudyPlanItem {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  currentLevel: string;
  dailyHours: string;
  targetDate: string;
  planContent: string;
  createdAt: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface QuizResultRecord {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  createdAt: number;
  questions: QuizQuestion[];
  userAnswers: Record<number, number>;
}

export interface StudyHistoryRecord {
  id: string;
  userId: string;
  type: "chat" | "study-plan" | "quiz";
  title: string;
  question?: string;
  summary: string;
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}
