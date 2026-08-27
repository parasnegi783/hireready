import { NextRequest, NextResponse } from "next/server";
import { askAI } from "@/lib/ai";
import { RESUME_ANALYSIS_PROMPT, fillPrompt } from "@/lib/prompts";
import { tryParseJSON } from "@/lib/ai-json";

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription } = await request.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Resume text and job description are required" },
        { status: 400 }
      );
    }

    const prompt = fillPrompt(RESUME_ANALYSIS_PROMPT, {
      resume: resumeText.substring(0, 4000),
      jobDescription: jobDescription.substring(0, 3000),
    });

    const response = await askAI(prompt, {
      maxTokens: 2000,
      temperature: 0.2,
      systemPrompt:
        "You are a resume analyst. Respond with ONLY a valid JSON object. No text before or after. No markdown code blocks.",
    });

    const analysis = tryParseJSON(response);

    if (!analysis) {
      console.error("Could not parse AI response:", response.substring(0, 500));
      return NextResponse.json(
        { error: "AI returned invalid format. Please try again." },
        { status: 500 }
      );
    }

    // Normalize priority values
    if (analysis.suggestions) {
      analysis.suggestions = analysis.suggestions.map(
        (s: { priority?: string; [key: string]: unknown }) => ({
          ...s,
          priority:
            s.priority === "high" || s.priority === "critical"
              ? "critical"
              : s.priority === "medium" || s.priority === "important"
                ? "important"
                : "nice-to-have",
        })
      );
    }

    return NextResponse.json({
      matchScore: analysis.matchScore || 0,
      atsScore: analysis.atsScore || 0,
      skillsPresent: analysis.skillsPresent || [],
      skillsMissing: analysis.skillsMissing || [],
      suggestions: analysis.suggestions || [],
      sectionFeedback: analysis.sectionFeedback || [],
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Analysis API error:", errMsg);
    return NextResponse.json(
      { error: `Analysis failed: ${errMsg}` },
      { status: 500 }
    );
  }
}
