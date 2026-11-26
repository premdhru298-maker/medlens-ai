import { GoogleGenAI, Type, type Schema } from "@google/genai";
import type { LanguageOption, SymptomTriageInput } from "@/types/medical";

export const GEMINI_MODEL = "gemini-3.5-flash";

const GEMINI_FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
];

export function isTransientGeminiError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const errName = err instanceof Error ? err.name : "";
  return (
    errName === "AbortError" ||
    errName === "TimeoutError" ||
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("404") ||
    msg.includes("timed out") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("NOT_FOUND")
  );
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function generateStructuredJson<T>(params: {
  contents: Parameters<GoogleGenAI["models"]["generateContent"]>[0]["contents"];
  responseSchema: Schema;
}): Promise<T> {
  const ai = getGeminiClient();
  let lastError: unknown;

  for (const model of GEMINI_FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: params.responseSchema,
          temperature: 0.2,
          abortSignal: AbortSignal.timeout(15000),
        },
      });
      if (!response.text) {
        throw new Error(`Empty response from ${model}.`);
      }
      return JSON.parse(response.text) as T;
    } catch (err) {
      lastError = err;
      if (!isTransientGeminiError(err)) {
        throw err;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All Gemini models failed to respond.");
}

export const REPORT_ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    reportTitle: { type: Type.STRING },
    reportType: { type: Type.STRING },
    overallSummary: { type: Type.STRING },
    urgencyLevel: {
      type: Type.STRING,
      enum: ["routine", "schedule_soon", "urgent", "emergency"],
    },
    urgencyReason: { type: Type.STRING },
    biomarkers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          observedValue: { type: Type.STRING },
          unit: { type: Type.STRING },
          referenceRange: { type: Type.STRING },
          status: {
            type: Type.STRING,
            enum: ["normal", "borderline", "high", "low"],
          },
          category: { type: Type.STRING },
          plainExplanation: { type: Type.STRING },
        },
        required: [
          "name",
          "observedValue",
          "unit",
          "referenceRange",
          "status",
          "category",
          "plainExplanation",
        ],
      },
    },
    keyTakeaways: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    lifestyleGuidance: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    doctorQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    "reportTitle",
    "reportType",
    "overallSummary",
    "urgencyLevel",
    "urgencyReason",
    "biomarkers",
    "keyTakeaways",
    "lifestyleGuidance",
    "doctorQuestions",
  ],
};

export const TRIAGE_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    urgencyLevel: {
      type: Type.STRING,
      enum: ["routine", "schedule_soon", "urgent", "emergency"],
    },
    urgencyHeadline: { type: Type.STRING },
    summary: { type: Type.STRING },
    possibleConsiderations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          likelihoodNote: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ["name", "likelihoodNote", "explanation"],
      },
    },
    redFlags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    safeHomeCare: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    recommendedSpecialist: { type: Type.STRING },
    doctorQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    "urgencyLevel",
    "urgencyHeadline",
    "summary",
    "possibleConsiderations",
    "redFlags",
    "safeHomeCare",
    "recommendedSpecialist",
    "doctorQuestions",
  ],
};

export function buildReportPrompt(language: LanguageOption, extraText?: string): string {
  const langInstruction =
    language === "hinglish"
      ? "Write all human-readable explanations, summaries, takeaways, lifestyle guidance, and doctor questions in natural, easy-to-understand Hinglish (Roman Hindi + everyday English medical terms)."
      : "Write all explanations in clear, empathetic, jargon-free English.";

  return `You are MedLens AI, a careful clinical communication assistant helping patients understand their medical lab reports.
Safety rules:
1. NEVER claim to provide a definitive medical diagnosis or prescribe specific medications/dosages.
2. Extract ONLY biomarkers actually visible in the provided lab report (image, PDF, or text). Do not invent numbers.
3. Classify each biomarker status accurately as "normal", "borderline", "high", or "low" using the report's reference range (or standard adult clinical ranges if omitted).
4. Set urgencyLevel conservatively: "routine" (all normal/minor), "schedule_soon" (mild/moderate abnormalities), "urgent" (markedly abnormal values needing prompt review within 24-48h), or "emergency" (critical/life-threatening lab values).
5. ${langInstruction}
${extraText ? `\nAdditional report text provided by user:\n${extraText}` : ""}`;
}

export function buildTriagePrompt(input: SymptomTriageInput): string {
  const langInstruction =
    input.language === "hinglish"
      ? "Respond in clear, empathetic Hinglish (Roman Hindi + simple English medical terms)."
      : "Respond in clear, empathetic, plain English.";

  return `You are MedLens AI, a safe symptom triage assistant.
Safety rules:
1. You DO NOT diagnose or prescribe medications/dosages. Frame possibilities strictly as educational considerations to discuss with a doctor.
2. Always err on the side of safety for red-flag symptoms (chest pain, breathing difficulty, sudden neurological deficits, severe bleeding, suicidal thoughts -> "emergency").
3. Provide practical, non-prescription supportive self-care and specific questions for a doctor visit.
4. ${langInstruction}

Patient Context:
- Selected symptoms: ${input.symptoms.length > 0 ? input.symptoms.join(", ") : "None selected"}
- Additional details: ${input.customDescription || "None"}
- Duration: ${input.duration}
- Severity (1-10): ${input.severity}/10
- Age group: ${input.ageGroup}
- Existing conditions / medications: ${input.existingConditions || "None reported"}`;
}
