import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, X, ShieldCheck, Copy, Check, Lock } from "lucide-react";

export default function CallModal({
  phone,
  name,
  onClose
}: {
  phone: string;
  name: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const cleanPhone = phone.replace(/[^\d+]/g, "");
  const maskedDialString = `#31#${cleanPhone}`;
  const maskedTelUri = `tel:%2331%23${cleanPhone}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(maskedDialString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="card relative w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          <X size={18} />
        </button>

        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700 shadow-inner">
          <Phone size={28} />
        </div>

        <h2 className="mt-3 text-xl font-black text-slate-900">{name}</h2>
        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
          <Phone size={12} className="text-emerald-600" /> Worker Number: {phone}
        </div>

        {/* #31# Caller ID Masking Box */}
        <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50/90 p-3.5 text-left">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-xs font-black text-emerald-950 flex items-center gap-1">
                Caller ID Masking Active (<span className="font-mono text-emerald-700">#31#</span>)
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-emerald-800">
                Dialing with the <b className="font-bold">#31#</b> prefix suppresses your mobile Caller ID. The worker will see <b>"Private Number"</b> or <b>"Unknown Caller"</b> on their phone screen.
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-white px-3 py-2">
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Masked Dial String</p>
              <p className="font-mono text-xs font-black text-slate-900">{maskedDialString}</p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Call Actions */}
        <div className="mt-4 space-y-2">
          <a
            href={maskedTelUri}
            className="btn-primary flex w-full items-center justify-center gap-2 bg-emerald-600 py-3 text-sm font-black text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700"
          >
            <Lock size={16} /> Dial Masked Call (#31#)
          </a>

          <a
            href={`tel:${cleanPhone}`}
            className="block text-center text-xs font-semibold text-slate-400 hover:text-slate-600 hover:underline pt-1"
          >
            Standard call without #31#
          </a>
        </div>
      </div>
    </motion.div>
  );
}
