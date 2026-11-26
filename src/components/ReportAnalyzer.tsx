"use client";

import { useRef, useState } from "react";
import {
  Activity,
  Check,
  Copy,
  FileText,
  HelpCircle,
  Loader2,
  Printer,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { SAMPLE_REPORTS } from "@/lib/sample-data";
import { BiomarkerStatusPill, UrgencyBadge } from "@/components/UrgencyBadge";
import type { LanguageOption, ReportAnalysisResult } from "@/types/medical";

interface ReportAnalyzerProps {
  language: LanguageOption;
  geminiConfigured: boolean;
  onSaveResult: (result: ReportAnalysisResult) => void;
  activeResult: ReportAnalysisResult | null;
  onChangeResult: (result: ReportAnalysisResult | null) => void;
}

export function ReportAnalyzer({
  language,
  geminiConfigured,
  onSaveResult,
  activeResult,
  onChangeResult,
}: ReportAnalyzerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reportText, setReportText] = useState("");
  const [selectedSampleId, setSelectedSampleId] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedQuestions, setCopiedQuestions] = useState(false);

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
    setSelectedFile(file);
    setSelectedSampleId("");
    setError(null);
  };

  const handlePickSample = (sampleId: string) => {
    const preset = SAMPLE_REPORTS.find((s) => s.id === sampleId);
    if (!preset) return;
    setSelectedSampleId(preset.id);
    setReportText(preset.rawText);
    setSelectedFile(null);
    setError(null);
  };

  const runAnalysis = async (forceDemo = false) => {
    setError(null);
    setIsLoading(true);
    try {
      const formData = new FormData();
      if (selectedFile) formData.append("file", selectedFile);
      if (reportText.trim()) formData.append("reportText", reportText.trim());
      if (selectedSampleId) formData.append("sampleId", selectedSampleId);
      formData.append("language", language);
      if (forceDemo) formData.append("forceDemo", "true");

      const res = await fetch("/api/analyze-report", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to analyze report.");
      }
      onChangeResult(data as ReportAnalysisResult);
      onSaveResult(data as ReportAnalysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyDoctorQuestions = async () => {
    if (!activeResult) return;
    const text = activeResult.doctorQuestions
      .map((q, i) => `${i + 1}. ${q}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 2000);
  };

  const abnormalCount =
    activeResult?.biomarkers.filter((b) => b.status !== "normal").length ?? 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Column: Upload & Sample Input */}
      <section className="lg:col-span-5 space-y-5 print:hidden">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Upload Lab Report
              </h2>
              <p className="text-xs text-slate-500">
                PDF, PNG, JPG, WEBP (max 10 MB) or paste report text below
              </p>
            </div>
            <FileText className="h-5 w-5 text-teal-600" />
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFileSelect(e.dataTransfer.files?.[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
              isDragging
                ? "border-teal-500 bg-teal-50/70"
                : "border-slate-300 bg-slate-50/60 hover:border-teal-400 hover:bg-teal-50/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
            <UploadCloud className="mx-auto mb-2 h-8 w-8 text-teal-600" />
            <p className="text-sm font-medium text-slate-700">
              Click to upload or drag &amp; drop
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Supports blood tests, lipid panels, LFT, thyroid, or prescriptions
            </p>
          </div>

          {selectedFile && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-900">
              <span className="truncate font-medium">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
              </span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="ml-2 rounded p-0.5 hover:bg-teal-100"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Quick Sample Reports */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              1-Click Demo Lab Reports
            </p>
            <div className="grid grid-cols-1 gap-2">
              {SAMPLE_REPORTS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handlePickSample(sample.id)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition ${
                    selectedSampleId === sample.id
                      ? "border-teal-500 bg-teal-50 text-teal-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-semibold">{sample.label}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                    {sample.shortTag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="mt-5">
            <label
              htmlFor="report-text"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Or Paste Report Values
            </label>
            <textarea
              id="report-text"
              rows={5}
              value={reportText}
              onChange={(e) => {
                setReportText(e.target.value);
                setSelectedSampleId("");
              }}
              placeholder="e.g., Hemoglobin: 10.4 g/dL (Ref: 13-17), HbA1c: 6.1%..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 font-mono text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
            />
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              {error}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => runAnalysis(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing Report...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {geminiConfigured
                    ? "Analyze with Gemini AI"
                    : "Analyze (Demo Mode)"}
                </>
              )}
            </button>

            {geminiConfigured && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => runAnalysis(true)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Sample Demo
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Right Column: Structured Results */}
      <section className="lg:col-span-7">
        {!activeResult ? (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
            <div className="mb-3 rounded-2xl bg-teal-50 p-4 text-teal-600">
              <Activity className="h-8 w-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              Ready to Explain Your Lab Report
            </h3>
            <p className="mt-1.5 max-w-md text-sm text-slate-500">
              Upload a blood test PDF/photo or click one of the 1-click sample
              reports on the left. You&apos;ll get a plain-language breakdown,
              abnormal flags, and doctor questions.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Summary Header Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {activeResult.reportType}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        activeResult.mode === "gemini"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {activeResult.mode === "gemini"
                        ? "Live Gemini AI"
                        : "Built-in Demo Mode"}
                    </span>
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    {activeResult.reportTitle}
                  </h2>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  <UrgencyBadge level={activeResult.urgencyLevel} />
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                    title="Print / Save as PDF"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                {activeResult.overallSummary}
              </p>

              {activeResult.fallbackReason && (
                <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-900">
                  {activeResult.fallbackReason}
                </p>
              )}

              <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-3 text-center">
                <div>
                  <p className="text-xs text-slate-500">Parameters</p>
                  <p className="text-lg font-bold text-slate-900">
                    {activeResult.biomarkers.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Within Range</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {activeResult.biomarkers.length - abnormalCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Needs Attention</p>
                  <p className="text-lg font-bold text-rose-700">
                    {abnormalCount}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs font-medium text-slate-600">
                <span className="font-semibold text-slate-800">
                  Follow-up timing:
                </span>{" "}
                {activeResult.urgencyReason}
              </p>
            </div>

            {/* Biomarkers Table */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Extracted Biomarkers Breakdown
              </h3>
              <div className="space-y-3">
                {activeResult.biomarkers.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className="rounded-xl border border-slate-200 p-3.5 transition hover:border-slate-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-semibold text-slate-900">
                          {item.name}
                        </span>
                        <span className="ml-2 text-xs text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-bold text-slate-900">
                          {item.observedValue}{" "}
                          <span className="text-xs font-normal text-slate-500">
                            {item.unit}
                          </span>
                        </span>
                        <BiomarkerStatusPill status={item.status} />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Reference: {item.referenceRange}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-700">
                      {item.plainExplanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Takeaways & Lifestyle */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-2.5 text-sm font-semibold text-slate-900">
                  Key Takeaways
                </h3>
                <ul className="space-y-2 text-xs leading-relaxed text-slate-700">
                  {activeResult.keyTakeaways.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-2.5 text-sm font-semibold text-slate-900">
                  General Lifestyle Next Steps
                </h3>
                <ul className="space-y-2 text-xs leading-relaxed text-slate-700">
                  {activeResult.lifestyleGuidance.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Questions for Doctor */}
            <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5">
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-teal-700" />
                  <h3 className="text-sm font-semibold text-teal-950">
                    Questions to Ask Your Doctor
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={copyDoctorQuestions}
                  className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-white px-2.5 py-1 text-xs font-medium text-teal-800 hover:bg-teal-50 print:hidden"
                >
                  {copiedQuestions ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
              <ol className="list-inside list-decimal space-y-1.5 text-xs leading-relaxed text-teal-950">
                {activeResult.doctorQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
