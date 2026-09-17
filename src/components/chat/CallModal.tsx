import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Phone, X, ShieldCheck, Copy, Check, Lock, Loader2, Sparkles } from "lucide-react";
import { api } from "../../services/api";

export default function CallModal({
  phone,
  name,
  bookingId,
  onClose,
}: {
  phone?: string;
  name: string;
  bookingId?: string;
  onClose: () => void;
}) {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(Boolean(bookingId));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    let active = true;
    api
      .createCallSession(bookingId)
      .then((res) => {
        if (active) {
          setSession(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Could not create Plivo session:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [bookingId]);

  const virtualNumber = session?.virtualNumber || "+918000000000";
  const cleanPhone = (phone || "").replace(/[^\d+]/g, "");
  const maskedDialString = `#31#${cleanPhone}`;
  const maskedTelUri = `tel:%2331%23${cleanPhone}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm"
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
        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          <ShieldCheck size={13} className="text-emerald-600" /> Private Masked Calling
        </div>

        {/* PRIMARY OPTION: PLIVO VIRTUAL NUMBER CALLING */}
        <div className="mt-4 rounded-2xl border-2 border-emerald-400/80 bg-gradient-to-b from-emerald-50 to-white p-4 text-left shadow-sm">
          <div className="flex items-start gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white shadow-sm">
              <Sparkles size={14} />
            </span>
            <div>
              <p className="text-xs font-black text-emerald-950">Plivo Masked Virtual Bridge</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-800">
                Call through KarmiK's secure virtual number. Neither party's phone number is ever revealed.
              </p>
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between rounded-xl border border-emerald-200 bg-white px-3 py-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Virtual Bridge Number</p>
              <p className="font-mono text-xs font-black text-slate-900">
                {loading ? "Connecting bridge..." : virtualNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(virtualNumber)}
              disabled={loading}
              className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <a
            href={`tel:${virtualNumber}`}
            className="btn-primary mt-3 flex w-full items-center justify-center gap-2 bg-emerald-600 py-3 text-xs font-black text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Phone size={15} />}
            Call via Plivo Virtual Bridge
          </a>
        </div>

        {/* SECONDARY OPTION: #31# CELLULAR CALL (If phone number provided) */}
        {cleanPhone && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Lock size={12} className="text-slate-500" /> Cellular Dialing with #31#
              </span>
              <a
                href={maskedTelUri}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
              >
                Dial #31#
              </a>
            </div>
            <p className="mt-1 text-[10px] text-slate-500 leading-tight">
              Suppresses Caller ID on GSM network. Masked string: <span className="font-mono font-bold text-slate-800">{maskedDialString}</span>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
