import { NextRequest, NextResponse } from "next/server";
import { askAI } from "@/lib/ai";
import { INTERVIEW_QUESTIONS_PROMPT, fillPrompt } from "@/lib/prompts";
import { tryParseJSON } from "@/lib/ai-json";
import type { InterviewQuestion } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { role, jobDescription, count = 8 } = await request.json();

    if (!role) {
      return NextResponse.json(
        { error: "Role is required" },
        { status: 400 },
      );
    }

    const prompt = fillPrompt(INTERVIEW_QUESTIONS_PROMPT, {
      resume: `The candidate is applying for: ${role}`,
      jobDescription: jobDescription || `${role} position`,
    });

    const response = await askAI(prompt, {
      maxTokens: 3000,
      temperature: 0.5,
      systemPrompt:
        "You are an interview question generator. Respond with ONLY a valid JSON object. No text before or after.",
    });

    const parsed = tryParseJSON(response);

    if (!parsed) {
      return NextResponse.json(
        { error: "Failed to generate questions" },
        { status: 500 },
      );
    }

    const questions: InterviewQuestion[] = [];

    for (const category of ["technical", "behavioral", "hr"] as const) {
      const items = parsed[category] || [];
      for (let i = 0; i < items.length; i++) {
        questions.push({
          id: `${category}_${i}`,
          category,
          question: items[i].question,
          hint: items[i].hint,
          difficulty: items[i].difficulty,
        });
      }
    }

    const limited = questions.slice(0, count);

    return NextResponse.json({ questions: limited });
  } catch (error) {
    console.error("Mock interview generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 },
    );
  }
}
