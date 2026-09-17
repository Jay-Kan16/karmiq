import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  RefreshCw,
  XCircle,
  Calendar,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import StatusBadge from "../../components/common/StatusBadge";
import ServiceIcon from "../../components/common/ServiceIcon";
import CustomerScheduledModal from "../../components/booking/CustomerScheduledModal";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";

type TabType = "all" | "active" | "scheduled" | "completed";

export default function Bookings() {
  const { t, translateService } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabType) || "all";
  const [currentTab, setCurrentTab] = useState<TabType>(initialTab);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reschedule Modal State
  const [rescheduleBooking, setRescheduleBooking] = useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [viewScheduledBooking, setViewScheduledBooking] = useState<any | null>(null);

  const load = () => {
    api
      .getBookings()
      .then((res) => {
        setData(Array.isArray(res) ? res : []);
      })
      .catch((err) => console.error("Failed to load bookings:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    load();
    const timer = setInterval(load, 3000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    setSearchParams(tab === "all" ? {} : { tab });
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.cancelBooking(bookingId);
      setSuccessToast("Booking cancelled successfully.");
      setTimeout(() => setSuccessToast(""), 3000);
      load();
    } catch (err: any) {
      alert(err?.message || "Failed to cancel booking.");
    }
  };

  const handleOpenReschedule = (b: any) => {
    setRescheduleBooking(b);
    setRescheduleDate(b.scheduledDate || new Date().toISOString().split("T")[0]);
    setRescheduleTime(b.scheduledTime || "10:00");
    setRescheduleError("");
  };

  const handleSubmitReschedule = async () => {
    if (!rescheduleBooking) return;
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError("Please select both a date and time.");
      return;
    }
    const todayStr = new Date().toISOString().split("T")[0];
    if (rescheduleDate < todayStr) {
      setRescheduleError("Scheduled date cannot be in the past.");
      return;
    }

    setRescheduleSubmitting(true);
    setRescheduleError("");
    try {
      await api.rescheduleBooking(
        rescheduleBooking._id || rescheduleBooking.id,
        rescheduleDate,
        rescheduleTime
      );
      setRescheduleBooking(null);
      setSuccessToast("Booking rescheduled successfully!");
      setTimeout(() => setSuccessToast(""), 3500);
      load();
    } catch (err: any) {
      setRescheduleError(err?.message || "Failed to reschedule booking.");
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  // Counts for tabs
  const counts = useMemo(() => {
    const live = data.filter((b) =>
      ["MATCHING", "WORKER_ASSIGNED", "ACCEPTED", "ON_THE_WAY", "ARRIVED", "SERVICE_STARTED"].includes(b.status) &&
      b.status !== "SCHEDULED"
    ).length;

    const scheduled = data.filter(
      (b) =>
        (b.status === "SCHEDULED" || b.scheduledDate) &&
        !["COMPLETED", "CANCELLED", "REJECTED"].includes(b.status)
    ).length;

    const completed = data.filter((b) => b.status === "COMPLETED").length;

    return { all: data.length, live, scheduled, completed };
  }, [data]);

  // Filtered list
  const filteredData = useMemo(() => {
    if (currentTab === "active") {
      return data.filter((b) =>
        ["MATCHING", "WORKER_ASSIGNED", "ACCEPTED", "ON_THE_WAY", "ARRIVED", "SERVICE_STARTED"].includes(b.status) &&
        b.status !== "SCHEDULED"
      );
    }
    if (currentTab === "scheduled") {
      return data.filter(
        (b) =>
          (b.status === "SCHEDULED" || b.scheduledDate) &&
          !["COMPLETED", "CANCELLED", "REJECTED"].includes(b.status)
      );
    }
    if (currentTab === "completed") {
      return data.filter((b) => b.status === "COMPLETED");
    }
    return data;
  }, [data, currentTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="section-title text-2xl font-black">{t("myBookings")}</h1>
          <p className="muted mt-1 text-sm">{t("myBookingsSub")}</p>
        </div>

        <Link
          to="/customer/services"
          className="btn-primary self-start sm:self-auto flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold"
        >
          <Sparkles size={14} />
          Book New Service
        </Link>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {successToast}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {[
          { key: "all", label: "All Bookings", count: counts.all },
          { key: "scheduled", label: "📅 Scheduled", count: counts.scheduled },
          { key: "active", label: "Live & Active", count: counts.live },
          { key: "completed", label: "Completed", count: counts.completed }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key as TabType)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition ${
              currentTab === tab.key
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-black ${
                  currentTab === tab.key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="card p-12 text-center text-slate-400">
            <RefreshCw size={24} className="mx-auto animate-spin text-brand-600" />
            <p className="mt-3 text-sm font-bold">Loading your bookings…</p>
          </div>
        ) : filteredData.length ? (
          filteredData.map((b) => {
            const bookingId = b._id || b.id;
            const isScheduled = b.status === "SCHEDULED" || !!b.scheduledDate;
            const isCancelled = b.status === "CANCELLED";
            const isCompleted = b.status === "COMPLETED";

            return (
              <div
                key={bookingId}
                className={`card relative flex flex-col justify-between gap-4 p-5 transition hover:shadow-md sm:flex-row sm:items-center ${
                  b.status === "REJECTED"
                    ? "border-2 border-amber-300 bg-amber-50/40"
                    : isScheduled && !isCancelled && !isCompleted
                    ? "border-2 border-purple-200/80 bg-purple-50/20"
                    : ""
                }`}
              >
                <div className="flex gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                    <ServiceIcon nameOrId={b.serviceId?.name || b.serviceName} size={28} />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">
                        {translateService(b.serviceId?.name || b.serviceName)}
                      </h3>
                      <StatusBadge status={b.status} />
                    </div>

                    {/* Schedule Date or ETA display */}
                    {isScheduled && !isCancelled && !isCompleted ? (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-extrabold text-purple-900">
                        <CalendarDays size={14} className="text-purple-600" />
                        Scheduled for: {b.scheduledDate} • {b.scheduledTime || "Flexible Slot"}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">
                        {b.status === "REJECTED"
                          ? "Worker is busy with other tasks"
                          : b.workerId?.userId?.name
                          ? `Assigned: ${b.workerId.userId.name}`
                          : "Searching for worker"}
                      </p>
                    )}

                    <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin size={12} className="shrink-0 text-slate-400" />
                      <span className="truncate max-w-xs sm:max-w-md">{b.location?.address}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Fare</span>
                    <p className="text-base font-black text-slate-900">₹{b.fare}</p>
                    {b.extraCharges && b.extraCharges > 0 ? (
                      <p className="text-[10px] font-bold text-amber-700">+₹{b.extraCharges} extra</p>
                    ) : null}
                  </div>

                  {/* Actions depending on status */}
                  <div className="flex items-center gap-2">
                    {isScheduled && !isCancelled && !isCompleted ? (
                      <>
                        <button
                          onClick={() => handleOpenReschedule(b)}
                          className="btn-secondary px-3 py-2 text-xs font-bold text-purple-800 hover:bg-purple-50"
                        >
                          <Calendar size={13} />
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancelBooking(bookingId)}
                          className="btn-secondary px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border-rose-200"
                          title="Cancel Booking"
                        >
                          <XCircle size={14} />
                        </button>
                        <button
                          onClick={() => setViewScheduledBooking(b)}
                          className="btn-primary bg-purple-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-sm"
                        >
                          Reservation Pass
                        </button>
                        <Link
                          to={`/booking/${bookingId}`}
                          className="btn-secondary px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                          title="View Details"
                        >
                          Details
                        </Link>
                      </>
                    ) : b.status === "REJECTED" ? (
                      <Link
                        to={`/booking/${bookingId}/tracking`}
                        className="btn-primary bg-amber-600 px-3.5 py-2 text-xs font-black text-white hover:bg-amber-700 shadow-sm"
                      >
                        Change Worker
                      </Link>
                    ) : isCompleted ? (
                      <Link
                        to={`/booking/${bookingId}`}
                        className="btn-secondary px-3.5 py-2 text-xs font-bold text-slate-700"
                      >
                        Receipt & Rating
                      </Link>
                    ) : isCancelled ? (
                      <span className="text-xs font-bold text-slate-400">Cancelled</span>
                    ) : (
                      <Link
                        to={`/booking/${bookingId}/tracking`}
                        className="btn-primary px-4 py-2 text-xs font-bold"
                      >
                        Track Live
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card p-12 text-center text-slate-500">
            <CalendarDays size={32} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-700">
              {currentTab === "scheduled"
                ? "No scheduled bookings found."
                : currentTab === "active"
                ? "No active dispatches right now."
                : "No bookings found in this view."}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {currentTab === "scheduled"
                ? "Book a service in advance by choosing 'Schedule' during checkout."
                : "Choose a local service to book instantly or schedule for later."}
            </p>
            <Link
              to="/customer/services"
              className="btn-primary mx-auto mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
            >
              Explore Services
            </Link>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="card w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-purple-900 font-extrabold text-sm">
                <CalendarDays size={18} className="text-purple-600" />
                Reschedule Booking #{String(rescheduleBooking._id || rescheduleBooking.id).slice(-6)}
              </div>
              <button
                onClick={() => setRescheduleBooking(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select a new date and time for your{" "}
              <b>{translateService(rescheduleBooking.serviceId?.name || rescheduleBooking.serviceName)}</b> service.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="input text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Time</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="input text-xs font-semibold"
                />
              </div>

              {/* Quick slots */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Quick Slots</label>
                <div className="flex flex-wrap gap-1.5">
                  {["09:00", "12:00", "15:00", "18:00"].map((tSlot) => (
                    <button
                      key={tSlot}
                      type="button"
                      onClick={() => setRescheduleTime(tSlot)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                        rescheduleTime === tSlot
                          ? "bg-purple-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {tSlot === "09:00"
                        ? "9 AM"
                        : tSlot === "12:00"
                        ? "12 PM"
                        : tSlot === "15:00"
                        ? "3 PM"
                        : "6 PM"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {rescheduleError && (
              <p className="text-xs font-bold text-rose-600">{rescheduleError}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRescheduleBooking(null)}
                disabled={rescheduleSubmitting}
                className="btn-secondary px-3 py-2 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReschedule}
                disabled={rescheduleSubmitting || !rescheduleDate || !rescheduleTime}
                className="btn-primary bg-purple-600 hover:bg-purple-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/20"
              >
                {rescheduleSubmitting ? "Updating..." : "Save New Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewScheduledBooking && (
        <CustomerScheduledModal
          isOpen={Boolean(viewScheduledBooking)}
          onClose={() => setViewScheduledBooking(null)}
          booking={viewScheduledBooking}
        />
      )}
    </div>
  );
}