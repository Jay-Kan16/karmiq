import type { BookingStatus } from "../../types";
import { Check } from "lucide-react";
import { useApp } from "../../context/AppContext";
import type { TranslationKey } from "../../data/translations";

const steps: { status: BookingStatus; key: TranslationKey }[] = [
  { status: "WORKER_ASSIGNED", key: "statusWorkerAssigned" },
  { status: "ON_THE_WAY", key: "statusOnTheWay" },
  { status: "ARRIVED", key: "statusArrived" },
  { status: "SERVICE_STARTED", key: "statusServiceStarted" },
  { status: "COMPLETED", key: "statusCompleted" }
];

const rank: Partial<Record<BookingStatus, number>> = {
  SEARCHING: 0, WORKER_ASSIGNED: 1, ACCEPTED: 1, ON_THE_WAY: 2, ARRIVED: 3, SERVICE_STARTED: 4, COMPLETED: 5, PAYMENT: 6, RATING: 7, CANCELLED: -1
};

export default function BookingStepper({ status }: { status: BookingStatus }) {
  const { t } = useApp();
  const current = rank[status] ?? 0;
  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const done = current > index + 1;
        const active = current === index + 1;
        return (
          <div key={step.status} className="flex items-center gap-3">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 ${done || active ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-300"}`}>
              {done ? <Check size={16}/> : <span className="h-2 w-2 rounded-full bg-current"/>}
            </span>
            <span className={`text-sm ${active ? "font-bold text-slate-900" : done ? "font-semibold text-slate-500" : "text-slate-400"}`}>
              {t(step.key)}
            </span>
          </div>
        );
      })}
    </div>
  );
}