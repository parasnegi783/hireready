import { NextRequest, NextResponse } from "next/server";
import { askAI } from "@/lib/ai";
import { MOCK_INTERVIEW_EVALUATE_PROMPT, fillPrompt } from "@/lib/prompts";
import { tryParseJSON } from "@/lib/ai-json";

export async function POST(request: NextRequest) {
  try {
    const { question, transcript } = await request.json();

    if (!question || !transcript) {
      return NextResponse.json(
        { error: "Question and transcript are required" },
        { status: 400 },
      );
    }

    const prompt = fillPrompt(MOCK_INTERVIEW_EVALUATE_PROMPT, {
      question,
      answer: transcript,
    });

    const response = await askAI(prompt, {
      maxTokens: 1000,
      temperature: 0.3,
      systemPrompt:
        "You are an interview evaluator. Respond with ONLY a valid JSON object. No text before or after.",
    });

    const parsed = tryParseJSON(response);

    if (!parsed) {
      return NextResponse.json(
        { error: "Failed to evaluate answer" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      score: parsed.score || 0,
      feedback: parsed.feedback || parsed.sampleAnswer || "",
      modelAnswer: parsed.sampleAnswer || "",
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
    });
  } catch (error) {
    console.error("Mock interview evaluate error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer" },
      { status: 500 },
    );
  }
}
