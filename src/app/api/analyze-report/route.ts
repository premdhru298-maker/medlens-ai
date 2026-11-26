import { NextResponse } from "next/server";
import {
  buildReportPrompt,
  generateStructuredJson,
  isGeminiConfigured,
  isTransientGeminiError,
  REPORT_ANALYSIS_SCHEMA,
} from "@/lib/gemini";
import {
  generateDemoReportAnalysis,
  MEDICAL_DISCLAIMER,
  MEDICAL_DISCLAIMER_HINGLISH,
} from "@/lib/sample-data";
import type { LanguageOption, ReportAnalysisResult } from "@/types/medical";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const reportText = String(formData.get("reportText") || "").trim();
    const sampleId = String(formData.get("sampleId") || "").trim();
    const language = (String(formData.get("language") || "english") ===
    "hinglish"
      ? "hinglish"
      : "english") as LanguageOption;
    const forceDemo = String(formData.get("forceDemo") || "") === "true";

    let filePart: { inlineData: { data: string; mimeType: string } } | null =
      null;
    let fileName: string | undefined;

    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { error: "File exceeds 10 MB limit. Please upload a smaller report." },
          { status: 400 }
        );
      }
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          {
            error:
              "Unsupported file format. Please upload PDF, PNG, JPG, or WEBP.",
          },
          { status: 400 }
        );
      }
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");
      filePart = {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      };
      fileName = file.name;
    }

    if (!filePart && !reportText && !sampleId) {
      return NextResponse.json(
        {
          error:
            "Please upload a medical report (PDF/Image), paste lab text, or pick a sample report.",
        },
        { status: 400 }
      );
    }

    if (forceDemo || !isGeminiConfigured()) {
      const demoResult = generateDemoReportAnalysis(
        { sampleId: sampleId || undefined, reportText, fileName },
        language
      );
      return NextResponse.json(demoResult);
    }

    const parts: Array<
      string | { inlineData: { data: string; mimeType: string } }
    > = [buildReportPrompt(language, reportText || undefined)];
    if (filePart) {
      parts.push(filePart);
    }

    try {
      const parsed = await generateStructuredJson<
        Omit<
          ReportAnalysisResult,
          "id" | "timestamp" | "mode" | "language" | "disclaimer"
        >
      >({
        contents: parts,
        responseSchema: REPORT_ANALYSIS_SCHEMA,
      });

      const result: ReportAnalysisResult = {
        id: `rep_${Date.now()}`,
        timestamp: new Date().toISOString(),
        mode: "gemini",
        language,
        ...parsed,
        disclaimer:
          language === "hinglish"
            ? MEDICAL_DISCLAIMER_HINGLISH
            : MEDICAL_DISCLAIMER,
      };

      return NextResponse.json(result);
    } catch (geminiErr) {
      if (isTransientGeminiError(geminiErr)) {
        const fallback = generateDemoReportAnalysis(
          { sampleId: sampleId || undefined, reportText, fileName },
          language
        );
        fallback.fallbackReason =
          "Gemini servers are temporarily busy (503). Showing structured Demo Mode fallback.";
        return NextResponse.json(fallback);
      }
      throw geminiErr;
    }
  } catch (error) {
    console.error("Report analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to analyze report.";
    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 500 }
    );
  }
}
