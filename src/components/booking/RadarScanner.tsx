import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, MapPin, Radio, Sparkles, Star, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import type { Worker } from "../../types";

interface RadarScannerProps {
  service: string;
  candidates: Worker[];
  locationName?: string;
  onComplete?: () => void;
}

export default function RadarScanner({ service, candidates, locationName, onComplete }: RadarScannerProps) {
  const { t, translateService } = useApp();
  const [detectedCount, setDetectedCount] = useState(0);
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    t("stageSearching") || "Searching nearby workers",
    t("stageDistance") || "Pinging cooperative GPS radius",
    t("stageSkill") || "Verifying availability & skills",
    t("stageRatings") || "Ranking nearest verified workers"
  ];

  // Reveal detected workers sequentially as radar sweeps
  useEffect(() => {
    const total = Math.min(candidates.length, 6);
    if (total === 0) return;

    const interval = window.setInterval(() => {
      setDetectedCount(prev => {
        if (prev < total) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [candidates.length]);

  // Advance stage status text
  useEffect(() => {
    const stageInterval = window.setInterval(() => {
      setActiveStage(prev => Math.min(stages.length - 1, prev + 1));
    }, 750);
    return () => clearInterval(stageInterval);
  }, [stages.length]);

  // Map candidates to radar polar coordinates
  const blipPositions = candidates.slice(0, 6).map((worker, i) => {
    // Normalise distance: 1km -> closer to center, 4.5km -> closer to edge
    const clampedDist = Math.max(1, Math.min(4.8, worker.distance));
    const normalizedRadius = 0.22 + (clampedDist / 5) * 0.62; // 0.22 to 0.84 radius ratio

    // Distribute angles around radar (with offsets to look natural)
    const angles = [35, 145, 230, 310, 80, 195];
    const angleDeg = angles[i % angles.length];
    const angleRad = (angleDeg * Math.PI) / 180;

    const x = 50 + normalizedRadius * 46 * Math.cos(angleRad);
    const y = 50 + normalizedRadius * 46 * Math.sin(angleRad);

    return { worker, x, y, delay: (i + 1) * 0.55 };
  });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-2xl">
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />

      {/* Top Header */}
      <div className="relative z-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-400 backdrop-blur-md">
          <Radio size={14} className="animate-pulse text-emerald-400" />
          <span>{t("radarScanning") || "RADAR SCAN ACTIVE • 5 KM RANGE"}</span>
        </div>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
          {t("findingBestWorker")}
        </h2>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          {t("radarSub") || "Scanning cooperative network around"} <span className="font-semibold text-emerald-400">{locationName || "Ajmer"}</span>
        </p>
      </div>

      {/* Main Circular Radar Screen */}
      <div className="relative mx-auto my-7 flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
        {/* Outer Ring & Compass Markings */}
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 bg-slate-900/80 shadow-[inset_0_0_40px_rgba(16,185,129,0.15)] backdrop-blur-sm" />
        
        {/* Compass Cardinal Points */}
        <span className="absolute top-1.5 text-[10px] font-bold text-emerald-500/50">N</span>
        <span className="absolute bottom-1.5 text-[10px] font-bold text-emerald-500/50">S</span>
        <span className="absolute left-2 text-[10px] font-bold text-emerald-500/50">W</span>
        <span className="absolute right-2 text-[10px] font-bold text-emerald-500/50">E</span>

        {/* Concentric Range Rings */}
        <div className="absolute h-5/6 w-5/6 rounded-full border border-emerald-500/20" />
        <span className="absolute top-6 right-10 text-[9px] font-medium text-emerald-500/40">4km</span>

        <div className="absolute h-3/5 w-3/5 rounded-full border border-emerald-500/25" />
        <span className="absolute top-14 right-16 text-[9px] font-medium text-emerald-500/40">2.5km</span>

        <div className="absolute h-2/6 w-2/6 rounded-full border border-emerald-500/30" />
        <span className="absolute top-22 right-22 text-[9px] font-medium text-emerald-500/40">1km</span>

        {/* Crosshair Lines */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-emerald-500/20" />
        <div className="absolute bottom-0 left-1/2 top-0 w-px bg-emerald-500/20" />

        {/* Concentric Sonar Expanding Pulse */}
        <motion.div
          animate={{ scale: [0.1, 1], opacity: [0.8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-400"
        />
        <motion.div
          animate={{ scale: [0.1, 1], opacity: [0.7, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 1.2 }}
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-400"
        />

        {/* Radar Sweeping Beam */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(16, 185, 129, 0.04) 300deg, rgba(16, 185, 129, 0.45) 360deg)"
          }}
        >
          {/* Sweeper Leading Edge Line */}
          <div className="absolute right-1/2 top-0 h-1/2 w-0.5 origin-bottom bg-gradient-to-t from-emerald-400 to-emerald-200 shadow-[0_0_12px_rgba(52,211,153,1)]" />
        </motion.div>

        {/* Center Point: User Location */}
        <div className="relative z-20 flex flex-col items-center">
          <div className="relative grid h-7 w-7 place-items-center rounded-full bg-blue-500 text-white shadow-[0_0_16px_rgba(59,130,246,0.9)] ring-2 ring-white">
            <MapPin size={15} />
            <span className="absolute -inset-1 animate-ping rounded-full bg-blue-400/40" />
          </div>
          <span className="mt-1 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-bold text-blue-300 backdrop-blur-xs">
            {t("youAreHere") || "YOU"}
          </span>
        </div>

        {/* Detected Worker Blips */}
        {blipPositions.map(({ worker, x, y }, index) => {
          const isRevealed = index < detectedCount;
          return (
            <AnimatePresence key={worker.id}>
              {isRevealed && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {/* Glowing Radar Ping Beacon */}
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                      className="absolute -inset-1 rounded-full bg-emerald-400/80"
                    />
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-[11px] font-black text-slate-950 shadow-[0_0_14px_rgba(16,185,129,0.9)] ring-2 ring-emerald-200">
                      {worker.name[0]}
                    </div>
                  </div>

                  {/* Worker Tag Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-emerald-500/30 bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-emerald-300 shadow-md backdrop-blur-md"
                  >
                    <span>{worker.name.split(" ")[0]}</span>
                    <span className="ml-1 text-slate-400">• {worker.distance}km</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>

      {/* Bottom Scanning HUD Card */}
      <div className="relative z-10 mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-semibold text-slate-300">{stages[activeStage]}</span>
          </div>
          <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-800/40">
            {detectedCount} / {candidates.length} {t("workersDetected") || "found"}
          </span>
        </div>

        {/* Live Scan Progress Bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
            initial={{ width: "15%" }}
            animate={{ width: `${Math.min(100, Math.max(25, (detectedCount / Math.max(1, candidates.length)) * 100))}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Candidates pill list preview */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">
            {translateService(service)} • Ajmer Labour Cooperative
          </span>
          {onComplete && (
            <button
              onClick={onComplete}
              className="rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300 transition"
            >
              {t("skipRadar") || "View List Now"} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

