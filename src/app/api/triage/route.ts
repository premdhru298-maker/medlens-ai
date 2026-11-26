import { NextResponse } from "next/server";
import {
  buildTriagePrompt,
  generateStructuredJson,
  isGeminiConfigured,
  isTransientGeminiError,
  TRIAGE_RESPONSE_SCHEMA,
} from "@/lib/gemini";
import {
  generateDemoSymptomTriage,
  hasEmergencyRedFlags,
  MEDICAL_DISCLAIMER,
  MEDICAL_DISCLAIMER_HINGLISH,
} from "@/lib/sample-data";
import type {
  SymptomTriageInput,
  SymptomTriageResult,
} from "@/types/medical";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<SymptomTriageInput> & {
      forceDemo?: boolean;
    };

    const input: SymptomTriageInput = {
      symptoms: Array.isArray(body.symptoms) ? body.symptoms : [],
      customDescription: String(body.customDescription || "").trim(),
      duration: String(body.duration || "1-3 days"),
      severity:
        typeof body.severity === "number"
          ? Math.min(10, Math.max(1, body.severity))
          : 5,
      ageGroup: String(body.ageGroup || "18-35"),
      existingConditions: String(body.existingConditions || "").trim(),
      language: body.language === "hinglish" ? "hinglish" : "english",
    };

    if (input.symptoms.length === 0 && !input.customDescription) {
      return NextResponse.json(
        { error: "Please select at least one symptom or describe how you feel." },
        { status: 400 }
      );
    }

    if (body.forceDemo || !isGeminiConfigured()) {
      return NextResponse.json(generateDemoSymptomTriage(input));
    }

    try {
      const parsed = await generateStructuredJson<
        Omit<
          SymptomTriageResult,
          "id" | "timestamp" | "mode" | "language" | "disclaimer"
        >
      >({
        contents: buildTriagePrompt(input),
        responseSchema: TRIAGE_RESPONSE_SCHEMA,
      });

      // Hard safety floor: if emergency red-flag phrases were present, never downgrade below emergency.
      const safeUrgency = hasEmergencyRedFlags(input)
        ? "emergency"
        : parsed.urgencyLevel;

      const result: SymptomTriageResult = {
        id: `tri_${Date.now()}`,
        timestamp: new Date().toISOString(),
        mode: "gemini",
        language: input.language,
        ...parsed,
        urgencyLevel: safeUrgency,
        disclaimer:
          input.language === "hinglish"
            ? MEDICAL_DISCLAIMER_HINGLISH
            : MEDICAL_DISCLAIMER,
      };

      return NextResponse.json(result);
    } catch (geminiErr) {
      if (isTransientGeminiError(geminiErr)) {
        const fallback = generateDemoSymptomTriage(input);
        fallback.fallbackReason =
          "Gemini servers are temporarily busy (503). Showing structured Demo Mode fallback.";
        return NextResponse.json(fallback);
      }
      throw geminiErr;
    }
  } catch (error) {
    console.error("Symptom triage error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to run symptom triage.";
    return NextResponse.json(
      { error: `Triage failed: ${message}` },
      { status: 500 }
    );
  }
}
