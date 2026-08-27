import { NextRequest, NextResponse } from "next/server";
import { askAI } from "@/lib/ai";
import { SUGGESTIONS_PROMPT, fillPrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription, matchScore, missingSkills } =
      await request.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Resume and JD are required" },
        { status: 400 }
      );
    }

    const prompt = fillPrompt(SUGGESTIONS_PROMPT, {
      resume: resumeText,
      jobDescription,
      matchScore: String(matchScore || "N/A"),
      missingSkills: (missingSkills || []).join(", ") || "N/A",
    });

    const response = await askAI(prompt, {
      maxTokens: 3000,
      temperature: 0.4,
    });

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const suggestions = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggestions API error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
