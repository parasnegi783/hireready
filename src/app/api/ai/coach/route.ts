import { NextRequest, NextResponse } from "next/server";
import { askAIWithHistory } from "@/lib/ai";
import { COACH_SYSTEM_PROMPT, fillPrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { messages, resumeText, jobDescription } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Build context from resume and JD if available
    let context = "";
    if (resumeText) {
      context += `\nUser's Resume:\n${resumeText}\n`;
    }
    if (jobDescription) {
      context += `\nTarget Job Description:\n${jobDescription}\n`;
    }

    const systemPrompt = fillPrompt(COACH_SYSTEM_PROMPT, {
      context: context || "No resume or JD provided yet.",
    });

    const allMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const response = await askAIWithHistory(allMessages, {
      maxTokens: 2000,
      temperature: 0.7,
    });

    return NextResponse.json({ content: response });
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json(
      { error: "Failed to get coach response" },
      { status: 500 }
    );
  }
}
