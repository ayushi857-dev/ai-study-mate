import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { StudyHistoryRecord, StudyPlanItem, QuizResultRecord } from "../types";

// Save a general learning Q&A / interaction to history
export async function saveToHistory(
  userId: string,
  record: {
    title: string;
    question: string;
    summary: string;
    content: string;
    type: "chat" | "study-plan" | "quiz";
    metadata?: Record<string, any>;
  }
): Promise<string | null> {
  if (!userId) return null;
  try {
    const userHistoryRef = collection(db, "users", userId, "history");
    const docRef = await addDoc(userHistoryRef, {
      userId,
      title: record.title || "Study Session",
      question: record.question || "",
      summary: record.summary || "",
      content: record.content || "",
      type: record.type,
      metadata: record.metadata || {},
      timestamp: Date.now(),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Failed to save study history to Firestore:", error);
    return null;
  }
}

// Fetch all history for a specific authenticated user
export async function fetchUserHistory(userId: string): Promise<StudyHistoryRecord[]> {
  if (!userId) return [];
  try {
    const userHistoryRef = collection(db, "users", userId, "history");
    const q = query(userHistoryRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    const items: StudyHistoryRecord[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      items.push({
        id: docSnapshot.id,
        userId: data.userId || userId,
        type: data.type || "chat",
        title: data.title || "Study Note",
        question: data.question || "",
        summary: data.summary || "",
        content: data.content || "",
        timestamp: data.timestamp || Date.now(),
        metadata: data.metadata,
      });
    });
    return items;
  } catch (error) {
    console.error("Error fetching user history:", error);
    return [];
  }
}

// Delete a history record
export async function deleteHistoryRecord(userId: string, recordId: string): Promise<boolean> {
  if (!userId || !recordId) return false;
  try {
    const recordRef = doc(db, "users", userId, "history", recordId);
    await deleteDoc(recordRef);
    return true;
  } catch (error) {
    console.error("Error deleting history record:", error);
    return false;
  }
}

// Save a generated study plan
export async function saveUserStudyPlan(
  userId: string,
  plan: Omit<StudyPlanItem, "id" | "userId" | "createdAt">
): Promise<string | null> {
  if (!userId) return null;
  try {
    const plansRef = collection(db, "users", userId, "studyPlans");
    const docRef = await addDoc(plansRef, {
      ...plan,
      userId,
      createdAt: Date.now(),
    });

    // Also link into general history
    await saveToHistory(userId, {
      title: `${plan.subject} Plan: ${plan.topic}`,
      question: `Study Plan for ${plan.subject} (${plan.currentLevel}) - ${plan.dailyHours}/day`,
      summary: `Roadmap for ${plan.topic} targeting ${plan.targetDate}`,
      content: plan.planContent,
      type: "study-plan",
      metadata: { planId: docRef.id, subject: plan.subject, topic: plan.topic },
    });

    return docRef.id;
  } catch (error) {
    console.error("Failed to save study plan:", error);
    return null;
  }
}

// Fetch user study plans
export async function fetchUserStudyPlans(userId: string): Promise<StudyPlanItem[]> {
  if (!userId) return [];
  try {
    const plansRef = collection(db, "users", userId, "studyPlans");
    const q = query(plansRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const plans: StudyPlanItem[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      plans.push({
        id: docSnapshot.id,
        userId: data.userId || userId,
        subject: data.subject || "",
        topic: data.topic || "",
        currentLevel: data.currentLevel || "Beginner",
        dailyHours: data.dailyHours || "",
        targetDate: data.targetDate || "",
        planContent: data.planContent || "",
        createdAt: data.createdAt || Date.now(),
      });
    });
    return plans;
  } catch (error) {
    console.error("Error fetching study plans:", error);
    return [];
  }
}

// Save a completed quiz result
export async function saveUserQuizResult(
  userId: string,
  result: Omit<QuizResultRecord, "id" | "userId" | "createdAt">
): Promise<string | null> {
  if (!userId) return null;
  try {
    const quizzesRef = collection(db, "users", userId, "quizzes");
    const docRef = await addDoc(quizzesRef, {
      ...result,
      userId,
      createdAt: Date.now(),
    });

    // Also link into general history
    await saveToHistory(userId, {
      title: `${result.subject} Quiz: ${result.topic}`,
      question: `Completed ${result.difficulty} Quiz on ${result.topic}`,
      summary: `Score: ${result.score} / ${result.totalQuestions} (${Math.round(
        (result.score / result.totalQuestions) * 100
      )}%)`,
      content: `Quiz Results: Scored ${result.score} of ${result.totalQuestions} questions correctly.`,
      type: "quiz",
      metadata: {
        quizId: docRef.id,
        score: result.score,
        total: result.totalQuestions,
        subject: result.subject,
      },
    });

    return docRef.id;
  } catch (error) {
    console.error("Failed to save quiz result:", error);
    return null;
  }
}
