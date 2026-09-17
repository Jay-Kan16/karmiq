import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Copy,
  Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ServiceIcon from "../common/ServiceIcon";
import { useApp } from "../../context/AppContext";

interface CustomerScheduledModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
}

// Gentle pleasant confirmation chime using Web Audio API
function playConfirmationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Two pleasant notes: C5 (523Hz) -> G5 (784Hz)
    const notes = [
      { freq: 523.25, time: 0, duration: 0.15 },
      { freq: 783.99, time: 0.14, duration: 0.35 }
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration);
    });
  } catch (e) {
    // Audio contexts may be blocked by autoplay policies
  }
}

export default function CustomerScheduledModal({
  isOpen,
  onClose,
  booking
}: CustomerScheduledModalProps) {
  const nav = useNavigate();
  const { translateService, t } = useApp();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      playConfirmationSound();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate([60, 40, 80]);
        } catch (e) {}
      }
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const serviceName =
    booking.serviceId?.name || booking.serviceName || "Home Service";
  const bookingId = booking.id || booking._id || "";
  const address =
    booking.location?.address || "Selected Service Location";
  const fare = booking.fare || booking.serviceId?.startingPrice || 299;
  const scheduledDate = booking.scheduledDate || "Tomorrow";
  const scheduledTime = booking.scheduledTime || "10:00 AM - 12:00 PM";

  const workerUser = booking.workerId?.userId;
  const workerName = workerUser?.name || booking.workerName || null;
  const workerRating = booking.workerId?.rating || 4.9;

  const handleCopyId = () => {
    if (!bookingId) return;
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToBookings = () => {
    onClose();
    nav("/customer/bookings?tab=scheduled");
  };

  const handleViewDetails = () => {
    onClose();
    nav(`/booking/${bookingId}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 360, damping: 26 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-purple-400/60 bg-white p-6 shadow-2xl ring-4 ring-purple-500/10 sm:p-7 max-h-[92vh] overflow-y-auto"
        >
          {/* Top subtle decorative gradient banner */}
          <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-purple-500/15 blur-2xl pointer-events-none" />
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            title="Close popup"
          >
            <X size={18} />
          </button>

          {/* Header section */}
          <div className="flex items-center gap-3.5 pr-8">
            <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-purple-100 text-purple-700 shadow-sm border border-purple-200">
              <CalendarDays size={28} className="animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-purple-600 text-[9px] font-black text-white items-center justify-center">
                  ✓
                </span>
              </span>
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/80">
                <Sparkles size={12} /> Appointment Confirmed
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Booking Scheduled!
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Your reservation is locked in with our cooperative network.
              </p>
            </div>
          </div>

          {/* Scheduled Slot Highlight Card */}
          <div className="mt-5 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50/50 to-purple-50/30 p-4 border border-purple-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-white shadow-xs border border-purple-100">
                  <ServiceIcon nameOrId={serviceName} size={26} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {translateService(serviceName)}
                  </h4>
                  <p className="text-[11px] font-semibold text-purple-800">
                    Cooperative Professional Service
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Fare</span>
                <p className="text-lg font-black text-purple-700">₹{fare}</p>
              </div>
            </div>

            {/* Date & Time Slot Badge */}
            <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-purple-200/60 shadow-xs">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-purple-600" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Date Slot</p>
                  <p className="text-xs font-black text-slate-800">{scheduledDate}</p>
                </div>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-purple-600" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Time Window</p>
                  <p className="text-xs font-black text-slate-800">{scheduledTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Technician or Cooperative Partner Guarantee */}
          <div className="mt-3.5 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Assigned Specialist
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70 text-[10px]">
                <ShieldCheck size={12} className="text-emerald-600" /> Verified Partner
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-purple-600 text-white font-black text-xs">
                  {workerName ? workerName.slice(0, 1).toUpperCase() : "K"}
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    {workerName || "Assigned Certified Technician"}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500">
                    {workerName ? `⭐ ${workerRating} Rating • Cooperative Partner` : "Guaranteed on-time arrival"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  <PhoneCall size={12} className="text-purple-600" /> Masked Call Bridge
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 border-t border-slate-200/60 pt-2 text-slate-600">
              <MapPin size={14} className="shrink-0 text-purple-600 mt-0.5" />
              <span className="truncate font-medium">{address}</span>
            </div>

            {/* Reference ID */}
            {bookingId && (
              <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px]">
                <span className="text-slate-400">Booking Reference</span>
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-1 font-mono font-bold text-slate-700 hover:text-purple-700 transition"
                  title="Copy reference ID"
                >
                  <span>{bookingId.slice(-8).toUpperCase()}</span>
                  {copied ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : (
                    <Copy size={12} className="text-slate-400" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-col gap-2.5">
            <button
              onClick={handleGoToBookings}
              className="btn-primary flex items-center justify-center gap-2 bg-purple-600 py-3 text-xs font-black text-white hover:bg-purple-700 shadow-lg shadow-purple-600/25 transition active:scale-98"
            >
              <CalendarDays size={16} />
              View in My Bookings
              <ArrowRight size={14} />
            </button>

            <button
              onClick={handleViewDetails}
              className="btn-secondary flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition active:scale-98"
            >
              View Appointment Details
            </button>

            <button
              onClick={onClose}
              className="text-center text-[11px] font-bold text-slate-400 hover:text-slate-600 py-1 transition"
            >
              Close & Return to Home
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
