import { ArrowRight, Clock3, ShieldCheck, Siren, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LocationSelector from "../../components/location/LocationSelector";
import ServiceGrid from "../../components/service/ServiceGrid";
import { useApp } from "../../context/AppContext";

export default function CustomerHome() {
  const navigate = useNavigate();
  const { t } = useApp();

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white md:px-10 md:py-14"
      >
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur">
            <Sparkles size={14} /> {t("heroBadge")}
          </span>
          <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">{t("heroTitle")}</h1>
          <p className="mt-3 max-w-xl text-base text-slate-300 md:text-lg">{t("heroSub")}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/customer/services")}
              className="btn-primary bg-brand-500 hover:bg-brand-400"
            >
              {t("bookService")} <ArrowRight size={17} />
            </button>
            <button
              onClick={() => navigate("/booking/new?emergency=true")}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 font-bold text-white transition hover:bg-red-600 active:scale-95"
            >
              <Siren size={17} /> {t("emergencyHelp")}
            </button>
          </div>
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="grid gap-5 lg:grid-cols-[1fr_1.5fr]"
      >
        <LocationSelector />
        <div className="grid grid-cols-3 gap-3">
          {[
            [ShieldCheck, t("verifiedWorkers")],
            [Clock3, t("fastMatching")],
            [Sparkles, t("fairWork")]
          ].map(([Icon, text]) => (
            <div
              key={text as string}
              className="card flex flex-col justify-center p-4 transition hover:border-brand-200 hover:shadow-md"
            >
              <Icon size={22} className="text-brand-600" />
              <p className="mt-2 text-sm font-bold">{text as string}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.14 }}
      >
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="section-title">{t("popularServices")}</h2>
            <p className="muted mt-1">{t("popularServicesSub")}</p>
          </div>
          <button
            onClick={() => navigate("/customer/services")}
            className="hidden text-sm font-bold text-brand-700 transition hover:underline sm:block"
          >
            {t("viewAll")}
          </button>
        </div>
        <ServiceGrid limit={8} />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-extrabold text-red-900">{t("urgentHelp")}</p>
            <p className="mt-1 text-sm text-red-700">{t("urgentHelpSub")}</p>
          </div>
          <button
            onClick={() => navigate("/booking/new?emergency=true")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 active:scale-95"
          >
            {t("priorityMatching")} <ArrowRight size={16} />
          </button>
        </div>
      </motion.section>
    </div>
  );
}