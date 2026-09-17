import type { BookingStatus } from "../../types";
import { Check } from "lucide-react";
import { useApp } from "../../context/AppContext";
import type { TranslationKey } from "../../data/translations";

const steps: { status: BookingStatus; key: TranslationKey }[] = [
  { status: "WORKER_ASSIGNED", key: "statusWorkerAssigned" },
  { status: "ACCEPTED", key: "statusAccepted" },
  { status: "ON_THE_WAY", key: "statusOnTheWay" },
  { status: "ARRIVED", key: "statusArrived" },
  { status: "SERVICE_STARTED", key: "statusServiceStarted" },
  { status: "COMPLETED", key: "statusCompleted" }
];

const rank: Partial<Record<BookingStatus, number>> = {
  SEARCHING: 0,
  REQUESTED: 0,
  MATCHING: 0,
  WORKER_ASSIGNED: 1,
  ACCEPTED: 2,
  ON_THE_WAY: 3,
  ARRIVED: 4,
  SERVICE_STARTED: 5,
  COMPLETED: 6,
  PAYMENT: 7,
  RATING: 8,
  CANCELLED: -1,
  REJECTED: -1
};

export default function BookingStepper({ status }: { status: BookingStatus }) {
  const { t } = useApp();
  const current = rank[status] ?? 0;
  return (
    <div className="space-y-2">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const done = current > stepNum;
        const active = current === stepNum;
        return (
          <div key={step.status} className="flex items-center gap-3">
            <span
              className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-all ${
                done
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                  : active
                  ? "border-brand-600 bg-brand-600 text-white shadow-sm ring-4 ring-brand-100"
                  : "border-slate-200 bg-white text-slate-300"
              }`}
            >
              {done ? (
                <Check size={16} strokeWidth={3} />
              ) : active ? (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                </span>
              ) : (
                <span className="h-2 w-2 rounded-full bg-slate-300" />
              )}
            </span>
            <span
              className={`text-sm transition-colors ${
                active
                  ? "font-extrabold text-slate-900"
                  : done
                  ? "font-semibold text-slate-600"
                  : "text-slate-400"
              }`}
            >
              {t(step.key)}
              {active && (
                <span className="ml-2 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                  Current
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}