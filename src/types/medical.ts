export type LanguageOption = "english" | "hinglish";

export type BiomarkerStatus = "normal" | "borderline" | "high" | "low";

export type UrgencyLevel = "routine" | "schedule_soon" | "urgent" | "emergency";

export interface BiomarkerItem {
  name: string;
  observedValue: string;
  unit: string;
  referenceRange: string;
  status: BiomarkerStatus;
  category: string;
  plainExplanation: string;
}

export interface ReportAnalysisResult {
  id: string;
  timestamp: string;
  mode: "gemini" | "demo";
  fallbackReason?: string;
  language: LanguageOption;
  reportTitle: string;
  reportType: string;
  overallSummary: string;
  urgencyLevel: UrgencyLevel;
  urgencyReason: string;
  biomarkers: BiomarkerItem[];
  keyTakeaways: string[];
  lifestyleGuidance: string[];
  doctorQuestions: string[];
  disclaimer: string;
}

export interface SymptomTriageInput {
  symptoms: string[];
  customDescription: string;
  duration: string;
  severity: number;
  ageGroup: string;
  existingConditions: string;
  language: LanguageOption;
}

export interface PossibleConsideration {
  name: string;
  likelihoodNote: string;
  explanation: string;
}

export interface SymptomTriageResult {
  id: string;
  timestamp: string;
  mode: "gemini" | "demo";
  fallbackReason?: string;
  language: LanguageOption;
  urgencyLevel: UrgencyLevel;
  urgencyHeadline: string;
  summary: string;
  possibleConsiderations: PossibleConsideration[];
  redFlags: string[];
  safeHomeCare: string[];
  recommendedSpecialist: string;
  doctorQuestions: string[];
  disclaimer: string;
}

export interface SampleReportPreset {
  id: string;
  label: string;
  shortTag: string;
  reportType: string;
  rawText: string;
}
