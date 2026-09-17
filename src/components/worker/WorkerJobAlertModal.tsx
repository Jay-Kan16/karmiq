import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BellRing,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Siren,
  Sparkles,
  X,
  XCircle,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CalendarDays
} from "lucide-react";
import { api } from "../../services/api";
import { useApp } from "../../context/AppContext";
import ServiceIcon from "../common/ServiceIcon";

function playAlertChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First bell tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second bell tone (harmonic)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.18); // A5
    gain2.gain.setValueAtTime(0.35, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.65);
  } catch (_) {
    // Gracefully handle browsers blocking unprompted audio
  }

  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch (_) {}
  }
}

export default function WorkerJobAlertModal() {
  const nav = useNavigate();
  const { translateService, t } = useApp();
  const [incomingJob, setIncomingJob] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<"accept" | "decline" | null>(null);
  const dismissedIds = useRef<Set<string>>(new Set());
  const soundPlayedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    let active = true;

    const checkJobs = async () => {
      try {
        const jobs = await api.getWorkerJobs();
        if (!active || !Array.isArray(jobs)) return;

        // Look for the newest booking waiting for this worker's acceptance (instant or scheduled)
        const assignedJob = jobs.find(
          (j: any) =>
            (j.status === "WORKER_ASSIGNED" || j.status === "SCHEDULED") &&
            !dismissedIds.current.has(j.id || j._id)
        );

        if (assignedJob) {
          const jobId = assignedJob.id || assignedJob._id;
          setIncomingJob(assignedJob);

          // Play alert chime once per new incoming job
          if (!soundPlayedIds.current.has(jobId)) {
            soundPlayedIds.current.add(jobId);
            playAlertChime();
          }
        } else {
          setIncomingJob(null);
        }
      } catch (err) {
        // Silently continue polling
      }
    };

    // Initial check
    checkJobs();

    // Poll every 3 seconds for real-time incoming bookings
    const interval = setInterval(checkJobs, 3000);

    const onFocus = () => checkJobs();
    window.addEventListener("focus", onFocus);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const handleDismiss = () => {
    if (incomingJob) {
      dismissedIds.current.add(incomingJob.id || incomingJob._id);
    }
    setIncomingJob(null);
  };

  const handleAccept = async () => {
    if (!incomingJob) return;
    const jobId = incomingJob.id || incomingJob._id;
    const isScheduled = incomingJob.status === "SCHEDULED" || !!incomingJob.scheduledDate;
    setActionLoading("accept");
    try {
      await api.updateBookingStatus(jobId, "ACCEPTED");
      setIncomingJob(null);
      if (isScheduled) {
        nav("/worker/jobs");
      } else {
        nav(`/worker/jobs/${jobId}`);
      }
    } catch (err: any) {
      alert(err.message || "Failed to accept booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    if (!incomingJob) return;
    const jobId = incomingJob.id || incomingJob._id;
    setActionLoading("decline");
    try {
      await api.updateBookingStatus(jobId, "REJECTED");
      dismissedIds.current.add(jobId);
      setIncomingJob(null);
    } catch (err: any) {
      alert(err.message || "Failed to decline booking");
    } finally {
      setActionLoading(null);
    }
  };

  if (!incomingJob) return null;

  const isScheduled = incomingJob.status === "SCHEDULED" || !!incomingJob.scheduledDate;
  const serviceName =
    incomingJob.serviceId?.name || incomingJob.serviceName || "Service";
  const customerName =
    incomingJob.customerId?.name || "Customer";
  const address =
    incomingJob.location?.address || "Customer specified location";
  const distance = incomingJob.distance || 1.2;
  const eta = incomingJob.eta || Math.max(2, Math.round(distance * 4));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className={`relative w-full max-w-lg overflow-hidden rounded-3xl border-2 bg-white p-6 shadow-2xl ${
            isScheduled
              ? "border-purple-500/60 ring-4 ring-purple-500/10"
              : "border-emerald-500/50 ring-4 ring-emerald-500/10"
          }`}
        >
          {/* Top animated badge banner */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                    isScheduled ? "bg-purple-400" : "bg-emerald-400"
                  }`}
                />
                <span
                  className={`relative inline-flex h-3 w-3 rounded-full ${
                    isScheduled ? "bg-purple-600" : "bg-emerald-600"
                  }`}
                />
              </span>

              {isScheduled ? (
                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-800">
                  <CalendarDays size={16} className="animate-bounce text-purple-600" />
                  New Scheduled Job Reservation!
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700">
                  <BellRing size={15} className="animate-bounce text-emerald-600" />
                  New Instant Booking Request!
                </span>
              )}
            </div>

            <button
              onClick={handleDismiss}
              className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              title="Dismiss alert"
            >
              <X size={18} />
            </button>
          </div>

          {/* Service & Fare Overview */}
          <div
            className={`mt-4 flex items-start justify-between gap-4 rounded-2xl p-4 border ${
              isScheduled
                ? "bg-gradient-to-r from-purple-50 to-indigo-50/60 border-purple-200"
                : "bg-gradient-to-r from-emerald-50 to-teal-50/60 border-emerald-100"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-xs border border-slate-100">
                <ServiceIcon nameOrId={serviceName} size={34} />
              </span>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {translateService(serviceName)}
                </h3>
                {isScheduled ? (
                  <p className="flex items-center gap-1 text-xs font-black text-purple-900 mt-1">
                    <CalendarDays size={13} className="text-purple-600" />
                    Slot: {incomingJob.scheduledDate} • {incomingJob.scheduledTime || "Flexible Window"}
                  </p>
                ) : (
                  <p className="flex items-center gap-1 text-xs font-bold text-emerald-800 mt-0.5">
                    <Sparkles size={13} /> Immediate Dispatch
                  </p>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total Fare
              </span>
              <p className={`text-2xl font-black ${isScheduled ? "text-purple-700" : "text-emerald-700"}`}>
                ₹{incomingJob.fare || incomingJob.serviceId?.startingPrice || 299}
              </p>
            </div>
          </div>

          {/* Emergency Tag if applicable */}
          {incomingJob.emergency && !isScheduled && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2 text-xs font-black text-red-700 border border-red-200">
              <Siren size={16} className="animate-pulse" />
              PRIORITY EMERGENCY REQUEST - Rapid response required
            </div>
          )}

          {/* Customer & Location Details */}
          <div className="mt-4 space-y-2.5 rounded-2xl bg-slate-50 p-4 text-xs font-semibold text-slate-700 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                Customer
              </span>
              <span className="font-bold text-slate-900 text-sm">{customerName}</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/50 pt-2">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Customer Contact</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 text-[11px]">
                <ShieldCheck size={12} className="text-emerald-600" /> Number Masked (Private Bridge)
              </span>
            </div>

            <div className="flex items-start justify-between border-t border-slate-200/50 pt-2">
              <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0">
                Address
              </span>
              <span className="flex items-center gap-1 text-right text-slate-800 font-bold max-w-[260px] truncate">
                <MapPin size={13} className={`shrink-0 ${isScheduled ? "text-purple-600" : "text-emerald-600"}`} /> {address}
              </span>
            </div>

            {isScheduled ? (
              <div className="flex items-center justify-between border-t border-slate-200/50 pt-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Appointment Window</span>
                <span className="flex items-center gap-1.5 font-black text-purple-900">
                  <CalendarDays size={13} className="text-purple-600" />
                  {incomingJob.scheduledDate} at {incomingJob.scheduledTime || "Flexible"}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between border-t border-slate-200/50 pt-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Distance & ETA</span>
                <span className="flex items-center gap-1.5 font-black text-emerald-700">
                  <Clock size={13} /> {eta} min ({distance} km away)
                </span>
              </div>
            )}

            {incomingJob.description && (
              <div className="border-t border-slate-200/50 pt-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                  Task Details
                </span>
                <p className="rounded-lg bg-white p-2.5 text-xs text-slate-600 font-normal italic border border-slate-200">
                  "{incomingJob.description}"
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={handleDecline}
              disabled={Boolean(actionLoading)}
              className="btn-secondary flex items-center justify-center gap-1.5 border-slate-300 py-3 text-xs font-bold text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition active:scale-98"
            >
              {actionLoading === "decline" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <XCircle size={16} />
              )}
              {isScheduled ? "Decline Slot" : "Decline / Busy"}
            </button>

            <button
              onClick={handleAccept}
              disabled={Boolean(actionLoading)}
              className={`btn-primary flex items-center justify-center gap-1.5 py-3 text-xs font-black text-white transition active:scale-98 ${
                isScheduled
                  ? "bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/30"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30"
              }`}
            >
              {actionLoading === "accept" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              {isScheduled ? "Confirm Schedule Slot" : "Accept Job Now"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
