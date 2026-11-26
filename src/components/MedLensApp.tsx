"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  AlertCircle,
  Clock,
  FileText,
  HeartPulse,
  Languages,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { ReportAnalyzer } from "@/components/ReportAnalyzer";
import { SymptomTriage } from "@/components/SymptomTriage";
import { HistoryPanel, type HistoryEntry } from "@/components/HistoryPanel";
import {
  MEDICAL_DISCLAIMER,
  MEDICAL_DISCLAIMER_HINGLISH,
} from "@/lib/sample-data";
import type {
  LanguageOption,
  ReportAnalysisResult,
  SymptomTriageResult,
} from "@/types/medical";

type ActiveTab = "report" | "triage" | "history";
const STORAGE_KEY = "medlens_ai_history_v1";
const HISTORY_EVENT = "medlens-history-change";

function subscribeHistory(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(HISTORY_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(HISTORY_EVENT, callback);
  };
}

function getHistorySnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || "[]";
  } catch {
    return "[]";
  }
}

export function MedLensApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("report");
  const [language, setLanguage] = useState<LanguageOption>("english");
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [modelName, setModelName] = useState("gemini-3.5-flash");
  const [activeReport, setActiveReport] = useState<ReportAnalysisResult | null>(
    null
  );
  const [activeTriage, setActiveTriage] = useState<SymptomTriageResult | null>(
    null
  );

  const historyRaw = useSyncExternalStore(
    subscribeHistory,
    getHistorySnapshot,
    () => "[]"
  );

  const history = useMemo<HistoryEntry[]>(() => {
    try {
      const parsed = JSON.parse(historyRaw) as HistoryEntry[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [historyRaw]);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setGeminiConfigured(Boolean(data.geminiConfigured));
        if (data.model) setModelName(data.model);
      })
      .catch(() => setGeminiConfigured(false));
  }, []);

  const persistHistory = (next: HistoryEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 20)));
      window.dispatchEvent(new Event(HISTORY_EVENT));
    } catch {
      // Ignore storage quota errors
    }
  };

  const saveReportToHistory = (result: ReportAnalysisResult) => {
    persistHistory([{ kind: "report", data: result }, ...history]);
  };

  const saveTriageToHistory = (result: SymptomTriageResult) => {
    persistHistory([{ kind: "triage", data: result }, ...history]);
  };

  const handleOpenHistory = (entry: HistoryEntry) => {
    if (entry.kind === "report") {
      setActiveReport(entry.data);
      setActiveTab("report");
    } else {
      setActiveTriage(entry.data);
      setActiveTab("triage");
    }
  };

  const handleDeleteHistory = (id: string) => {
    persistHistory(history.filter((h) => h.data.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Clinical Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  MedLens AI
                </h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    geminiConfigured
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-800"
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  {geminiConfigured ? `Live (${modelName})` : "Demo Mode"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Medical Report Explainer &amp; Symptom Triage Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs">
              <Languages className="mx-1.5 h-3.5 w-3.5 text-slate-500" />
              <button
                type="button"
                onClick={() => setLanguage("english")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  language === "english"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hinglish")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  language === "hinglish"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Hinglish
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mx-auto flex max-w-7xl gap-1 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setActiveTab("report")}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "report"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-4 w-4" />
            Lab Report Explainer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("triage")}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "triage"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <HeartPulse className="h-4 w-4" />
            Symptom Triage
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "history"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="h-4 w-4" />
            History ({history.length})
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Safety Disclaimer Banner */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-950">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div className="flex-1 leading-relaxed">
            <span className="font-semibold">Clinical Safety Notice: </span>
            {language === "hinglish"
              ? MEDICAL_DISCLAIMER_HINGLISH
              : MEDICAL_DISCLAIMER}
            {!geminiConfigured && (
              <span className="mt-1 flex items-center gap-1 font-medium text-amber-900 print:hidden">
                <AlertCircle className="h-3.5 w-3.5" />
                Currently running in Demo Mode. Add{" "}
                <code className="rounded bg-amber-100 px-1 font-mono">
                  GEMINI_API_KEY
                </code>{" "}
                in{" "}
                <code className="rounded bg-amber-100 px-1 font-mono">
                  .env.local
                </code>{" "}
                for live multimodal PDF/image analysis.
              </span>
            )}
          </div>
        </div>

        {activeTab === "report" && (
          <ReportAnalyzer
            language={language}
            geminiConfigured={geminiConfigured}
            onSaveResult={saveReportToHistory}
            activeResult={activeReport}
            onChangeResult={setActiveReport}
          />
        )}

        {activeTab === "triage" && (
          <SymptomTriage
            language={language}
            geminiConfigured={geminiConfigured}
            onSaveResult={saveTriageToHistory}
            activeResult={activeTriage}
            onChangeResult={setActiveTriage}
          />
        )}

        {activeTab === "history" && (
          <HistoryPanel
            items={history}
            onOpenItem={handleOpenHistory}
            onDeleteItem={handleDeleteHistory}
            onClearAll={() => persistHistory([])}
          />
        )}
      </main>
    </div>
  );
}
