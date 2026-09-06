import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initializer for Gemini client to prevent crashes if key is not immediately available
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the server environment.");
  }
  return new GoogleGenAI({ apiKey });
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "AI StudyMate Server", time: new Date().toISOString() });
});

const GEMINI_MODEL = "gemini-3.6-flash";

// 1. AI Tutor Chat Endpoint
app.post("/api/chat", async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, userPrompt } = req.body;
    if (!userPrompt && (!messages || messages.length === 0)) {
      res.status(400).json({ error: "A message or question is required." });
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are "AI StudyMate", a world-class, supportive, and pedagogical AI tutor designed for students and self-directed learners.
Your objectives:
1. Explain complex concepts (in Programming, Computer Science, DSA, Math, Science, Humanities, etc.) with crystal clarity using intuition, real-world analogies, and step-by-step breakdowns.
2. When answering coding or technical queries, provide clean, well-commented code snippets, explain the time/space complexity, and highlight common pitfalls.
3. Keep the tone friendly, academic yet conversational, encouraging, and intellectually rigorous.
4. Structure long responses with clear Markdown headings (##, ###), bullet points, and bold terms for high readability.
5. Conclude with a helpful follow-up question or quick check-for-understanding quizlet question to reinforce learning.`;

    let contents: any[] = [];

    if (Array.isArray(messages) && messages.length > 0) {
      contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" || m.role === "model" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
    } else if (userPrompt) {
      contents = [{ role: "user", parts: [{ text: userPrompt }] }];
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I was unable to generate an explanation at this moment. Please try asking again!";
    res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      error: error.message || "Failed to communicate with AI Tutor. Please try again in a few moments.",
    });
  }
});

// 2. Study Planner Generation Endpoint
app.post("/api/study-plan", async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, topic, currentLevel, dailyHours, targetDate } = req.body;

    if (!subject || !topic) {
      res.status(400).json({ error: "Subject and topic are required to generate a study plan." });
      return;
    }

    const ai = getGeminiClient();

    const prompt = `Create a comprehensive, highly actionable, personalized study plan for a student.
Details:
- Subject: ${subject}
- Specific Topic / Goal: ${topic}
- Current Knowledge Level: ${currentLevel || "Beginner"}
- Available Daily Study Time: ${dailyHours || "1-2 hours"}
- Target Completion Date: ${targetDate || "Within 4 weeks"}

Format the response in rich, elegant Markdown with:
1. ## 🎯 Study Roadmap Overview & Key Milestones
2. ## 📅 Structured Breakdown (Phase by Phase or Day-by-Day/Week-by-Week)
   - Specific Core Topics to Master
   - Recommended Daily Time Allocation
   - Hands-on Exercises & Practice Tasks
3. ## 🔄 Active Recall & Spaced Revision Schedule
4. ## 💡 Pro Tips for Mastery & Common Mistakes to Avoid
5. ## 🚀 Recommended Practical Milestone Project

Ensure the tone is motivating, realistic, structured, and easy to follow.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.6,
      },
    });

    const planText = response.text || "Unable to generate study plan. Please try again.";
    res.json({
      title: `${subject}: ${topic}`,
      plan: planText,
    });
  } catch (error: any) {
    console.error("Error in /api/study-plan:", error);
    res.status(500).json({
      error: error.message || "Failed to generate study plan. Please try again.",
    });
  }
});

// 3. Quiz Generation Endpoint
app.post("/api/quiz", async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, topic, difficulty, questionCount = 5 } = req.body;

    if (!subject || !topic) {
      res.status(400).json({ error: "Subject and topic are required." });
      return;
    }

    const count = Math.min(Math.max(Number(questionCount) || 5, 1), 10);
    const ai = getGeminiClient();

    const prompt = `Generate a high-quality educational quiz with exactly ${count} multiple-choice questions.
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty || "Medium"}

Each question must have:
- A clear, well-phrased question testing conceptual understanding or problem solving.
- Exactly 4 plausible options.
- The 0-based index of the correct option (0, 1, 2, or 3).
- A thorough, encouraging explanation explaining why the correct answer is right and clarifying common misconceptions.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctOptionIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ["id", "question", "options", "correctOptionIndex", "explanation"],
              },
            },
          },
          required: ["title", "questions"],
        },
      },
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from AI quiz generator.");
    }

    const quizData = JSON.parse(rawJson);
    res.json(quizData);
  } catch (error: any) {
    console.error("Error in /api/quiz:", error);
    res.status(500).json({
      error: error.message || "Failed to generate quiz questions. Please try again.",
    });
  }
});

// Vite middleware & Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI StudyMate server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
