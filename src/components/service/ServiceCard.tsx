import { ArrowRight, CircleCheck } from "lucide-react";
import type { Service } from "../../types";
import { motion } from "framer-motion";
import { useApp } from "../../context/AppContext";
import ServiceIcon from "../common/ServiceIcon";

const serviceBgMap: Record<string, string> = {
  electrician: "bg-amber-50/90 border-amber-200/80 text-amber-600 shadow-amber-500/10",
  plumber: "bg-sky-50/90 border-sky-200/80 text-sky-600 shadow-sky-500/10",
  carpenter: "bg-orange-50/90 border-orange-200/80 text-orange-700 shadow-orange-500/10",
  painter: "bg-indigo-50/90 border-indigo-200/80 text-indigo-600 shadow-indigo-500/10",
  cleaner: "bg-teal-50/90 border-teal-200/80 text-teal-600 shadow-teal-500/10",
  driver: "bg-blue-50/90 border-blue-200/80 text-blue-600 shadow-blue-500/10",
  caregiver: "bg-rose-50/90 border-rose-200/80 text-rose-600 shadow-rose-500/10",
  gardener: "bg-emerald-50/90 border-emerald-200/80 text-emerald-700 shadow-emerald-500/10",
  technician: "bg-slate-100/90 border-slate-200/80 text-slate-700 shadow-slate-500/10"
};

export default function ServiceCard({ service, onClick, emergency = false }: { service: Service; onClick: () => void; emergency?: boolean }) {
  const { t, translateService } = useApp();
  const nameKey = (service.name || service.id || "").toLowerCase();
  const matchedKey = Object.keys(serviceBgMap).find(k => nameKey.includes(k)) || "";
  const bgStyle = serviceBgMap[matchedKey] || "bg-slate-50 border-slate-200 text-slate-700";

  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`card group relative w-full p-4 text-left transition-all duration-200 hover:border-brand-300 hover:shadow-md ${
        emergency ? "border-red-100" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <span className={`grid h-13 w-13 place-items-center rounded-2xl border p-2 shadow-xs transition-transform duration-200 group-hover:scale-105 ${bgStyle}`}>
          <ServiceIcon nameOrId={service.name || service.id} size={32} />
        </span>
        <ArrowRight
          size={18}
          className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-600"
        />
      </div>
      <div className="mt-4">
        <h3 className="font-bold text-slate-900 group-hover:text-brand-700 transition">
          {translateService(service.name)}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {t("fromPrice")} ₹{service.startingPrice}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-brand-600">
          <CircleCheck size={13} /> {service.nearby} {t("nearbyAvailable")}
        </p>
      </div>
    </motion.button>
  );
}