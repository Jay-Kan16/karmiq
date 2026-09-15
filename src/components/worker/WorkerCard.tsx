import { BadgeCheck, MapPin, Star } from "lucide-react";
import type { Worker } from "../../types";
import { useApp } from "../../context/AppContext";

export default function WorkerCard({ worker, assigned = false, fare }: { worker: Worker; assigned?: boolean; fare?: number }) {
  const { t, translateService } = useApp();
  return (
    <div className={`card p-5 ${assigned ? "border-brand-200 ring-2 ring-brand-50" : ""}`}>
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-lg font-extrabold text-brand-700">
          {worker.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-900">{worker.name}</h3>
            {worker.verified && <BadgeCheck size={17} className="text-brand-600" />}
          </div>
          <p className="text-sm text-slate-500">
            {translateService(worker.skill)} • {worker.experience} {t("yearsExperience")}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {worker.rating}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} />
              {worker.distance} km
            </span>
            <span className="text-brand-600">
              {worker.availability === "online" ? t("workerAvailable") : t("workerBusy")}
            </span>
          </div>
        </div>
        <div className="text-right">
          {assigned && (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 inline-block">
              96% {t("match")}
            </span>
          )}
          {fare && (
            <span className="mt-1 block text-sm font-black text-slate-900">
              ₹{fare}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}