import type { LucideIcon } from "lucide-react";

export default function KpiCard({ label, value, icon: Icon, trend }: { label: string; value: string; icon: LucideIcon; trend?: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon size={19}/></span>{trend && <span className="rounded-full bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-700">{trend}</span>}</div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}