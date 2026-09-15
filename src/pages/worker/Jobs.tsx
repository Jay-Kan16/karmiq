import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  Navigation,
  Phone,
  AlertCircle,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function Jobs() {
  const nav = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadJobs = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const list = await api.getWorkerJobs();
      setData(list || []);
    } catch (e) {
      console.error("Unable to load worker jobs:", e);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const fetchJobs = async () => {
      try {
        const list = await api.getWorkerJobs();
        if (active) {
          setData(list || []);
          setLoading(false);
        }
      } catch (e) {
        console.error("Worker jobs fetch error:", e);
        if (active) setLoading(false);
      }
    };

    fetchJobs();

    // Real-time polling every 3 seconds so incoming assigned jobs appear automatically
    const timer = window.setInterval(fetchJobs, 3000);

    // Refresh immediately when window gains focus
    const onFocus = () => fetchJobs();
    window.addEventListener("focus", onFocus);

    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const advance = async (b: any, status: string) => {
    const bookingId = b.id || b._id;
    setActionLoadingId(bookingId);
    try {
      await api.updateBookingStatus(bookingId, status as any);
      setData((prev) =>
        prev.map((item) => ((item.id || item._id) === bookingId ? { ...item, status } : item))
      );
      if (status === "ACCEPTED" || status === "ON_THE_WAY") {
        nav(`/worker/jobs/${bookingId}`);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Unable to update job");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="section-title text-2xl font-black">Jobs</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Live Feed
            </span>
          </div>
          <p className="muted mt-1 text-xs">
            Directly assigned bookings and auto-matched requests near you.
          </p>
        </div>

        <button
          onClick={() => loadJobs(true)}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          title="Refresh jobs"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin text-brand-600" : ""} />
          {refreshing ? "Checking..." : "Refresh"}
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="card p-12 text-center text-slate-500">
          <RefreshCw size={24} className="mx-auto animate-spin text-brand-600" />
          <p className="mt-3 font-bold text-slate-700">Loading your assigned jobs…</p>
        </div>
      ) : data.length ? (
        <div className="grid gap-4">
          {data.map((b) => {
            const bookingId = b.id || b._id;
            const isProcessing = actionLoadingId === bookingId;
            const address = b.location?.address || "Customer Location";
            const customerName = b.customerId?.name || "Customer";
            const customerPhone = b.customerId?.phone;
            const fare = b.fare || 0;

            return (
              <div
                key={bookingId}
                className="card relative overflow-hidden border-2 border-slate-200 p-5 transition hover:border-brand-400 hover:shadow-md sm:p-6"
              >
                {b.emergency && (
                  <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-black text-red-700">
                    <AlertCircle size={13} /> Emergency Priority
                  </div>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-900">
                        {b.serviceId?.name || "Service Request"}
                      </h2>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                          b.status === "WORKER_ASSIGNED"
                            ? "bg-amber-100 text-amber-800"
                            : b.status === "ACCEPTED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {b.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <p className="mt-1.5 flex items-center text-sm font-medium text-slate-600">
                      <MapPin className="mr-1.5 inline shrink-0 text-brand-600" size={15} />
                      {address}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-400">Total Fare</p>
                    <p className="text-xl font-black text-slate-900">₹{fare}</p>
                    {b.eta && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs font-bold text-brand-600 sm:justify-end">
                        <Clock3 size={13} /> ~{b.eta} min away
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-sm">
                  <div className="text-slate-600">
                    Customer: <span className="font-bold text-slate-900">{customerName}</span>
                    {customerPhone && (
                      <span className="ml-2 text-xs text-slate-400">({customerPhone})</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">ID: #{String(bookingId).slice(-6)}</span>
                </div>

                {/* Actions */}
                <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {b.status === "WORKER_ASSIGNED" && (
                    <>
                      <button
                        onClick={() => advance(b, "ACCEPTED")}
                        disabled={isProcessing}
                        className="btn-primary flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle2 size={17} />
                        {isProcessing ? "Accepting..." : "Accept Job"}
                      </button>
                      <button
                        onClick={() => nav(`/worker/jobs/${bookingId}`)}
                        className="btn-secondary flex items-center justify-center gap-1.5 text-xs font-bold"
                      >
                        <Navigation size={15} />
                        View Map & Details
                      </button>
                    </>
                  )}

                  {b.status === "ACCEPTED" && (
                    <>
                      <button
                        onClick={() => advance(b, "ON_THE_WAY")}
                        disabled={isProcessing}
                        className="btn-primary flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700"
                      >
                        <Navigation size={17} />
                        {isProcessing ? "Updating..." : "Start Journey (On The Way)"}
                      </button>
                      <button
                        onClick={() => nav(`/worker/jobs/${bookingId}`)}
                        className="btn-secondary flex items-center justify-center gap-1.5 text-xs font-bold"
                      >
                        Open Active Job
                      </button>
                    </>
                  )}

                  {["ON_THE_WAY", "ARRIVED", "SERVICE_STARTED"].includes(b.status) && (
                    <button
                      onClick={() => nav(`/worker/jobs/${bookingId}`)}
                      className="btn-primary col-span-2 flex items-center justify-center gap-1.5"
                    >
                      <Navigation size={17} />
                      Open Active Job Screen
                      <ChevronRight size={17} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-10 text-center text-slate-500">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Clock3 size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No assigned jobs right now</h3>
          <p className="mt-1 text-sm text-slate-500">
            When a customer assigns work to you or the matching system pairs you, new jobs will
            appear here live.
          </p>
          <button
            onClick={() => loadJobs(true)}
            className="btn-secondary mt-5 inline-flex items-center gap-1.5 text-xs"
          >
            <RefreshCw size={13} /> Check Again
          </button>
        </div>
      )}
    </div>
  );
}