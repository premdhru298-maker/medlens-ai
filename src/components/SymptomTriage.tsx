"use client";

import { useState } from "react";
import {
  AlertTriangle,
  HeartPulse,
  HelpCircle,
  Loader2,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import type { LanguageOption, SymptomTriageResult } from "@/types/medical";

const COMMON_SYMPTOMS = [
  "Fever",
  "Cough",
  "Sore Throat",
  "Headache",
  "Fatigue",
  "Stomach Pain",
  "Nausea / Acidity",
  "Body Ache",
  "Dizziness",
  "Chest Pain",
  "Shortness of Breath",
  "Skin Rash",
];

interface SymptomTriageProps {
  language: LanguageOption;
  geminiConfigured: boolean;
  onSaveResult: (result: SymptomTriageResult) => void;
  activeResult: SymptomTriageResult | null;
  onChangeResult: (result: SymptomTriageResult | null) => void;
}

export function SymptomTriage({
  language,
  geminiConfigured,
  onSaveResult,
  activeResult,
  onChangeResult,
}: SymptomTriageProps) {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [customDescription, setCustomDescription] = useState("");
  const [duration, setDuration] = useState("1-3 days");
  const [severity, setSeverity] = useState(4);
  const [ageGroup, setAgeGroup] = useState("18-35");
  const [existingConditions, setExistingConditions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSymptom = (symptom: string) => {
    setSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const applyPreset = (type: "viral" | "emergency") => {
    if (type === "emergency") {
      setSymptoms(["Chest Pain", "Shortness of Breath", "Dizziness"]);
      setCustomDescription("Sudden tightness in chest while climbing stairs");
      setDuration("Less than 24 hours");
      setSeverity(9);
    } else {
      setSymptoms(["Fever", "Sore Throat", "Body Ache"]);
      setCustomDescription("Mild fever around 100.4 F since yesterday evening");
      setDuration("1-3 days");
      setSeverity(5);
    }
    setError(null);
  };

  const runTriage = async (forceDemo = false) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms,
          customDescription,
          duration,
          severity,
          ageGroup,
          existingConditions,
          language,
          forceDemo,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to complete symptom triage.");
      }
      onChangeResult(data as SymptomTriageResult);
      onSaveResult(data as SymptomTriageResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Form */}
      <section className="lg:col-span-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Symptom Triage Intake
              </h2>
              <p className="text-xs text-slate-500">
                Select symptoms for urgency guidance &amp; red-flag screening
              </p>
            </div>
            <HeartPulse className="h-5 w-5 text-teal-600" />
          </div>

          {/* Quick Demo Scenarios */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset("viral")}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Demo: Fever &amp; Throat
            </button>
            <button
              type="button"
              onClick={() => applyPreset("emergency")}
              className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-800 hover:bg-rose-100"
            >
              Demo: Red-Flag Alert
            </button>
          </div>

          {/* Symptom Chips */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select Symptoms
            </p>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map((item) => {
                const selected = symptoms.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleSymptom(item)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      selected
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-300"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Notes */}
          <div>
            <label
              htmlFor="symptom-notes"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Describe How You Feel
            </label>
            <textarea
              id="symptom-notes"
              rows={3}
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="e.g., Mild headache since morning, feels worse after screen time..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
            />
          </div>

          {/* Duration & Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="duration"
                className="mb-1 block text-xs font-semibold text-slate-600"
              >
                Duration
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500"
              >
                <option value="Less than 24 hours">Less than 24 hours</option>
                <option value="1-3 days">1–3 days</option>
                <option value="4-7 days">4–7 days</option>
                <option value="More than 1 week">More than 1 week</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="age-group"
                className="mb-1 block text-xs font-semibold text-slate-600"
              >
                Age Group
              </label>
              <select
                id="age-group"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500"
              >
                <option value="Under 18">Under 18</option>
                <option value="18-35">18–35</option>
                <option value="36-55">36–55</option>
                <option value="56+">56+</option>
              </select>
            </div>
          </div>

          {/* Severity Slider */}
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">
                Severity Level
              </span>
              <span className="font-bold text-teal-700">{severity} / 10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>

          {/* Existing Conditions */}
          <div>
            <label
              htmlFor="existing-conditions"
              className="mb-1 block text-xs font-semibold text-slate-600"
            >
              Existing Conditions / Medications (Optional)
            </label>
            <input
              id="existing-conditions"
              type="text"
              value={existingConditions}
              onChange={(e) => setExistingConditions(e.target.value)}
              placeholder="e.g., Asthma, Diabetes, Thyroid medication"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => runTriage(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Evaluating Urgency...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {geminiConfigured
                    ? "Run AI Triage"
                    : "Run Triage (Demo Mode)"}
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Right Triage Output */}
      <section className="lg:col-span-7">
        {!activeResult ? (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
            <div className="mb-3 rounded-2xl bg-sky-50 p-4 text-sky-600">
              <Stethoscope className="h-8 w-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              Safe Symptom Triage &amp; Care Navigation
            </h3>
            <p className="mt-1.5 max-w-md text-sm text-slate-500">
              Enter your symptoms on the left to check urgency level (Self-Care,
              Routine, Urgent, or Emergency), warning signs, and which specialist
              to consult.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Urgency Banner */}
            <div
              className={`rounded-2xl border p-5 shadow-sm ${
                activeResult.urgencyLevel === "emergency"
                  ? "border-rose-300 bg-rose-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <UrgencyBadge level={activeResult.urgencyLevel} />
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {activeResult.mode === "gemini"
                    ? "Live Gemini AI"
                    : "Built-in Demo Mode"}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-bold text-slate-900">
                {activeResult.urgencyHeadline}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {activeResult.summary}
              </p>
              {activeResult.fallbackReason && (
                <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-900">
                  {activeResult.fallbackReason}
                </p>
              )}
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-900">
                <Stethoscope className="h-4 w-4 text-teal-700" />
                Recommended Specialist: {activeResult.recommendedSpecialist}
              </div>
            </div>

            {/* Possible Considerations */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Educational Possibilities (Not a Diagnosis)
              </h3>
              <div className="space-y-3">
                {activeResult.possibleConsiderations.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 p-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {item.name}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                        {item.likelihoodNote}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Red Flags & Home Care */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5">
                <div className="mb-2.5 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-700" />
                  <h3 className="text-sm font-semibold text-rose-950">
                    Red Flags — Seek Immediate Care
                  </h3>
                </div>
                <ul className="space-y-2 text-xs leading-relaxed text-rose-900">
                  {activeResult.redFlags.map((flag, i) => (
                    <li key={i} className="flex gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-2.5 text-sm font-semibold text-slate-900">
                  Safe Supportive Care
                </h3>
                <ul className="space-y-2 text-xs leading-relaxed text-slate-700">
                  {activeResult.safeHomeCare.map((tip, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Doctor Questions */}
            <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5">
              <div className="mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-teal-700" />
                <h3 className="text-sm font-semibold text-teal-950">
                  Questions for Your Doctor Visit
                </h3>
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
