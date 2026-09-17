import { motion } from "framer-motion";
import { Phone, X, ShieldCheck } from "lucide-react";

export default function CallModal({
  phone,
  name,
  onClose
}: {
  phone: string;
  name: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="card relative w-full max-w-sm rounded-3xl p-7 text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          <X size={18} />
        </button>

        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-700 shadow-inner">
          <Phone size={32} />
        </div>

        <h2 className="mt-4 text-xl font-black text-slate-900">{name}</h2>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1 text-sm font-black text-slate-800">
          <Phone size={13} className="text-emerald-600" /> {phone}
        </div>

        {/* Customer Privacy Shield Notification */}
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-left">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-xs font-black text-emerald-900">Your Number is Protected</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-700">
                KarmiK privacy bridge is active. Your personal phone number will not be revealed or shared with the worker.
              </p>
            </div>
          </div>
        </div>

        <a
          href={`tel:${phone}`}
          className="btn-primary mt-5 flex w-full items-center justify-center gap-2 bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/25"
        >
          <Phone size={17} /> Call Worker
        </a>
      </div>
    </motion.div>
  );
}
