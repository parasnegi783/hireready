import { NextRequest, NextResponse } from "next/server";
import { askAI } from "@/lib/ai";
import {
  INTERVIEW_QUESTIONS_PROMPT,
  MOCK_INTERVIEW_EVALUATE_PROMPT,
  fillPrompt,
} from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { action, resumeText, jobDescription, question, answer } =
      await request.json();

    if (action === "generate") {
      if (!resumeText || !jobDescription) {
        return NextResponse.json(
          { error: "Resume and JD are required to generate questions" },
          { status: 400 }
        );
      }

      const prompt = fillPrompt(INTERVIEW_QUESTIONS_PROMPT, {
        resume: resumeText,
        jobDescription,
      });

      const response = await askAI(prompt, {
        maxTokens: 3000,
        temperature: 0.5,
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json(
          { error: "Failed to parse AI response" },
          { status: 500 }
        );
      }

      const questions = JSON.parse(jsonMatch[0]);
      return NextResponse.json(questions);
    }

    if (action === "evaluate") {
      if (!question || !answer) {
        return NextResponse.json(
          { error: "Question and answer are required" },
          { status: 400 }
        );
      }

      const prompt = fillPrompt(MOCK_INTERVIEW_EVALUATE_PROMPT, {
        question,
        answer,
      });

      const response = await askAI(prompt, {
        maxTokens: 1500,
        temperature: 0.4,
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json(
          { error: "Failed to parse AI response" },
          { status: 500 }
        );
      }

      const evaluation = JSON.parse(jsonMatch[0]);
      return NextResponse.json(evaluation);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Interview API error:", error);
    return NextResponse.json(
      { error: "Failed to process interview request" },
      { status: 500 }
    );
  }
}
