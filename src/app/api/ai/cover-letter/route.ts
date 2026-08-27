import { NextRequest, NextResponse } from "next/server";
import { askAI } from "@/lib/ai";
import { COVER_LETTER_PROMPT, fillPrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription, company } = await request.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Resume and JD are required" },
        { status: 400 }
      );
    }

    const prompt = fillPrompt(COVER_LETTER_PROMPT, {
      resume: resumeText,
      jobDescription,
      company: company || "the company",
    });

    const response = await askAI(prompt, {
      maxTokens: 2000,
      temperature: 0.6,
    });

    return NextResponse.json({ coverLetter: response });
  } catch (error) {
    console.error("Cover letter API error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
