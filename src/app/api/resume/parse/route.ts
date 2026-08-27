import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await extractText(new Uint8Array(arrayBuffer));

    return NextResponse.json({
      text: Array.isArray(pdf.text) ? pdf.text.join("\n\n") : pdf.text,
      pages: pdf.totalPages,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error("PDF parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse PDF", details: error?.message },
      { status: 500 }
    );
  }
}
