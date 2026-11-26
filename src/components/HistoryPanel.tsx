"use client";

import { Clock, FileText, HeartPulse, ShieldCheck, Trash2 } from "lucide-react";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import type { ReportAnalysisResult, SymptomTriageResult } from "@/types/medical";

export type HistoryEntry =
  | { kind: "report"; data: ReportAnalysisResult }
  | { kind: "triage"; data: SymptomTriageResult };

interface HistoryPanelProps {
  items: HistoryEntry[];
  onOpenItem: (entry: HistoryEntry) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export function HistoryPanel({
  items,
  onOpenItem,
  onDeleteItem,
  onClearAll,
}: HistoryPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Saved Session History
          </h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Stored locally in your browser only — never uploaded to a third-party
            database.
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
          >
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
          <Clock className="mx-auto mb-2 h-7 w-7 text-slate-400" />
          <p className="text-sm font-medium text-slate-700">
            No saved reports or triage sessions yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Run a Lab Report analysis or Symptom Triage to see it appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((entry) => {
            const isReport = entry.kind === "report";
            const title = isReport
              ? entry.data.reportTitle
              : entry.data.urgencyHeadline;
            const summary = isReport
              ? entry.data.overallSummary
              : entry.data.summary;

            return (
              <div
                key={entry.data.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-teal-300 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      {isReport ? (
                        <>
                          <FileText className="h-3 w-3 text-teal-600" /> Lab
                          Report
                        </>
                      ) : (
                        <>
                          <HeartPulse className="h-3 w-3 text-sky-600" /> Symptom
                          Triage
                        </>
                      )}
                    </span>
                    <UrgencyBadge level={entry.data.urgencyLevel} />
                    <span className="text-[11px] text-slate-400">
                      {new Date(entry.data.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="mt-1.5 truncate text-sm font-semibold text-slate-900">
                    {title}
                  </h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                    {summary}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenItem(entry)}
                    className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteItem(entry.data.id)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                    aria-label="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
