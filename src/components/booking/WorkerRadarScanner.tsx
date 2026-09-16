import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Radio,
  Sparkles,
  Star,
  UserCheck,
  Zap
} from "lucide-react";

export interface NearbyWorker {
  _id: string;
  id: string;
  name: string;
  phone?: string;
  skills: string[];
  experience: number;
  rating: number;
  totalJobs: number;
  availability: string;
  verificationStatus: string;
  distance: number;
  eta: number;
}

interface WorkerRadarScannerProps {
  serviceName: string;
  serviceIcon?: string;
  userAddress?: string;
  workers: NearbyWorker[];
  loading: boolean;
  onSelectWorker: (worker: NearbyWorker) => void;
  onAutoAssign: () => void;
  onCancel: () => void;
}

export default function WorkerRadarScanner({
  serviceName,
  serviceIcon = "⚡",
  userAddress = "Your location",
  workers,
  loading: dataLoading,
  onSelectWorker,
  onAutoAssign,
  onCancel
}: WorkerRadarScannerProps) {
  // Only consider online workers for radar display, recommendation, and assignment
  const onlineWorkers = (workers || []).filter((w) => w.availability === "online");

  const [scanStep, setScanStep] = useState<"scanning" | "found">("scanning");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assigningWorkerId, setAssigningWorkerId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Initializing radar scan...");

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStatusMessage(`Scanning 5km radius for available ${serviceName}s...`);
    }, 600);

    const t2 = setTimeout(() => {
      setStatusMessage("Querying verified cooperative worker network...");
    }, 1400);

    const t3 = setTimeout(() => {
      setScanStep("found");
      if (onlineWorkers.length > 0) {
        setSelectedId(onlineWorkers[0].id);
      }
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [serviceName, onlineWorkers.length]);

  const handleSelect = (w: NearbyWorker) => {
    if (w.availability !== "online") return;
    setAssigningWorkerId(w.id);
    onSelectWorker(w);
  };

  const handleAuto = () => {
    if (onlineWorkers.length > 0) {
      setAssigningWorkerId(onlineWorkers[0].id);
      onSelectWorker(onlineWorkers[0]);
    } else {
      onAutoAssign();
    }
  };

  // Fixed angular layout for worker blips on the circular radar
  const getBlipPos = (index: number, total: number, distance: number) => {
    const angleOffset = 35 + index * (360 / Math.max(total, 3));
    const rad = (angleOffset * Math.PI) / 180;
    // Map distance (0.5km - 3km) to radar radius (25% - 42%)
    const clampedDist = Math.max(0.4, Math.min(3, distance || 1.2));
    const radiusPercent = 22 + (clampedDist / 3) * 22;
    const x = 50 + radiusPercent * Math.cos(rad);
    const y = 50 + radiusPercent * Math.sin(rad);
    return { x, y };
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <Radio size={14} className="animate-pulse text-emerald-600" />
            Live Worker Radar
          </span>
          <h2 className="mt-1 text-2xl font-black text-slate-900">
            Find Nearby {serviceName}
          </h2>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={13} className="text-emerald-600" />
            {userAddress}
          </p>
        </div>
        <button
          onClick={onCancel}
          disabled={Boolean(assigningWorkerId)}
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          Change Details
        </button>
      </div>

      {/* RADAR SCREEN */}
      <div className="relative mx-auto flex h-72 w-72 items-center justify-center overflow-hidden rounded-full border-4 border-slate-900 bg-slate-950 shadow-2xl shadow-emerald-950/40 sm:h-80 sm:w-80">
        {/* Radar grid background rings */}
        <div className="absolute h-16 w-16 rounded-full border border-emerald-500/20" />
        <div className="absolute h-32 w-32 rounded-full border border-emerald-500/25" />
        <div className="absolute h-48 w-48 rounded-full border border-emerald-500/30" />
        <div className="absolute h-64 w-64 rounded-full border border-emerald-500/35" />

        {/* Crosshairs */}
        <div className="absolute h-full w-[1px] bg-emerald-500/20" />
        <div className="absolute h-[1px] w-full bg-emerald-500/20" />

        {/* Sonar Expanding Waves */}
        <motion.div
          animate={{ scale: [0.1, 1.8], opacity: [0.8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          className="absolute h-44 w-44 rounded-full border border-emerald-400/40 bg-emerald-500/5"
        />
        <motion.div
          animate={{ scale: [0.1, 1.8], opacity: [0.8, 0] }}
          transition={{ duration: 2.4, delay: 0.8, repeat: Infinity, ease: "easeOut" }}
          className="absolute h-44 w-44 rounded-full border border-emerald-400/40 bg-emerald-500/5"
        />

        {/* Sweeping Radar Beam */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute inset-0 origin-center"
        >
          <div className="h-1/2 w-1/2 origin-bottom-right bg-gradient-to-br from-emerald-400/30 via-emerald-500/10 to-transparent" />
        </motion.div>

        {/* Center: User Marker ("You") */}
        <div className="relative z-20 flex flex-col items-center">
          <span className="relative flex h-5 w-5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600 shadow-md" />
          </span>
          <span className="mt-1 rounded bg-slate-900/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
            YOU
          </span>
        </div>

        {/* Discovered Worker Blips on Radar */}
        {scanStep === "found" &&
          onlineWorkers.map((w, idx) => {
            const pos = getBlipPos(idx, onlineWorkers.length, w.distance);
            const isSelected = selectedId === w.id;
            return (
              <motion.button
                key={w.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18, delay: idx * 0.15 }}
                onClick={() => setSelectedId(w.id)}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="group absolute z-30 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                title={`${w.name} • ${w.distance}km away`}
              >
                {/* Ping ring around worker dot */}
                <span className="absolute -inset-1.5 animate-ping rounded-full bg-emerald-400 opacity-50" />
                <div
                  className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                    isSelected
                      ? "scale-125 border-white bg-emerald-500 text-white shadow-lg shadow-emerald-500/80"
                      : "border-emerald-300 bg-slate-900 text-emerald-400 hover:scale-110"
                  }`}
                >
                  <span className="text-[11px] font-black">{serviceIcon}</span>
                </div>
                {/* Floating tooltip badge */}
                <span
                  className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-black transition-all ${
                    isSelected
                      ? "bg-emerald-500 text-white shadow"
                      : "bg-slate-900/90 text-emerald-300 opacity-80 group-hover:opacity-100"
                  }`}
                >
                  {w.name.split(" ")[0]} ({w.distance}km)
                </span>
              </motion.button>
            );
          })}
      </div>

      {/* Radar Status Bar */}
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-center text-xs font-bold text-white shadow-inner">
        {scanStep === "scanning" || dataLoading ? (
          <>
            <Loader2 size={15} className="animate-spin text-emerald-400" />
            <span className="text-emerald-300">{statusMessage}</span>
          </>
        ) : (
          <>
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>
              <b className="text-emerald-300">{onlineWorkers.length} verified online {onlineWorkers.length === 1 ? "worker" : "workers"}</b> found nearby! Select a worker below to assign your job.
            </span>
          </>
        )}
      </div>

      {/* WORKER LIST */}
      <AnimatePresence>
        {scanStep === "found" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Quick Auto-Assign Banner */}
            {onlineWorkers.length > 0 && (
              <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 sm:p-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
                    <Zap size={16} />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-800">
                      Recommended Match
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      Auto-assign {onlineWorkers[0].name} ({onlineWorkers[0].distance} km away)
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAuto}
                  disabled={Boolean(assigningWorkerId)}
                  className="btn-primary flex items-center gap-1 px-3.5 py-2 text-xs"
                >
                  {assigningWorkerId === onlineWorkers[0].id ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Assigning…
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Auto-Assign
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Individual Worker Cards */}
            <div className="space-y-2.5">
              {onlineWorkers.map((w) => {
                const isSelected = selectedId === w.id;
                const isAssigning = assigningWorkerId === w.id;
                return (
                  <motion.div
                    key={w.id}
                    layout
                    onClick={() => setSelectedId(w.id)}
                    className={`card cursor-pointer p-4 transition-all hover:shadow-md ${
                      isSelected
                        ? "border-2 border-emerald-500 bg-emerald-50/30 shadow-md ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      {/* Worker info */}
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-base font-black text-emerald-800">
                            {w.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-black text-slate-900">{w.name}</h3>
                            <BadgeCheck size={16} className="text-emerald-600" />
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="flex items-center font-bold text-amber-500">
                              <Star size={12} className="mr-0.5 fill-amber-400" />
                              {w.rating.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span>{w.totalJobs} jobs</span>
                            <span>•</span>
                            <span>{w.experience} yrs exp</span>
                          </div>
                        </div>
                      </div>

                      {/* Distance & Action */}
                      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2.5 sm:border-0 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="flex items-center gap-1 text-xs font-extrabold text-emerald-700">
                            <Clock size={13} /> {w.eta} min arrival
                          </p>
                          <p className="text-xs text-slate-500">
                            {w.distance} km away
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(w);
                          }}
                          disabled={Boolean(assigningWorkerId)}
                          className={`flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-bold transition active:scale-95 ${
                            isSelected
                              ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                              : "btn-secondary text-slate-700 hover:border-slate-400"
                          }`}
                        >
                          {isAssigning ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Assigning…
                            </>
                          ) : (
                            <>
                              <UserCheck size={14} />
                              Select & Assign
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {onlineWorkers.length === 0 && !dataLoading && (
                <div className="card p-8 text-center text-slate-500">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600">
                    <Radio size={24} className="animate-pulse" />
                  </div>
                  <p className="font-bold text-slate-800">No online workers available right now</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                    All service partners for this skill are currently offline. You can still place an open booking request and our auto-matching system will assign the first partner who comes online.
                  </p>
                  <button onClick={onAutoAssign} className="btn-primary mt-4">
                    Place Open Booking Request
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

