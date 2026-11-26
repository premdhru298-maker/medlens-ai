import {
  AlertOctagon,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";
import type { BiomarkerStatus, UrgencyLevel } from "@/types/medical";

const URGENCY_META: Record<
  UrgencyLevel,
  { label: string; bg: string; border: string; text: string }
> = {
  routine: {
    label: "Routine / Monitor",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
  },
  schedule_soon: {
    label: "Schedule Doctor Visit",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-800",
  },
  urgent: {
    label: "Urgent (Within 24h)",
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-900",
  },
  emergency: {
    label: "Emergency Care Now",
    bg: "bg-rose-50",
    border: "border-rose-300",
    text: "text-rose-900",
  },
};

export function UrgencyBadge({ level }: { level: UrgencyLevel }) {
  const meta = URGENCY_META[level] ?? URGENCY_META.routine;
  const Icon =
    level === "emergency"
      ? AlertOctagon
      : level === "urgent"
        ? AlertTriangle
        : level === "schedule_soon"
          ? CalendarClock
          : CheckCircle2;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.border} ${meta.text}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

const BIOMARKER_META: Record<
  BiomarkerStatus,
  { label: string; classes: string }
> = {
  normal: {
    label: "Normal",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  borderline: {
    label: "Borderline",
    classes: "bg-amber-50 text-amber-800 border-amber-200",
  },
  high: {
    label: "High",
    classes: "bg-rose-50 text-rose-700 border-rose-200",
  },
  low: {
    label: "Low",
    classes: "bg-orange-50 text-orange-800 border-orange-200",
  },
};

export function BiomarkerStatusPill({ status }: { status: BiomarkerStatus }) {
  const meta = BIOMARKER_META[status] ?? BIOMARKER_META.normal;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.classes}`}
    >
      {meta.label}
    </span>
  );
}
