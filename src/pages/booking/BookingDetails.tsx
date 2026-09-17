import { Phone, MessageCircle, MapPin, Clock3, Home, ArrowLeft, Star, CreditCard, CalendarDays, Calendar, XCircle, CheckCircle2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";
import BookingStepper from "../../components/booking/BookingStepper";
import StatusBadge from "../../components/common/StatusBadge";
import CallModal from "../../components/chat/CallModal";
import ChatModal from "../../components/chat/ChatModal";

export default function BookingDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, t, translateService } = useApp();
  const [b, setB] = useState<any>();
  const [call, setCall] = useState(false);
  const [chat, setChat] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const load = () => {
    if (!id) return;
    api.getBooking(id).then((res) => {
      setB(res);
      setNewDate(res?.scheduledDate || new Date().toISOString().split("T")[0]);
      setNewTime(res?.scheduledTime || "10:00");
    }).catch(() => {});
  };

  useEffect(() => {
    if (!id) return;
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
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.cancelBooking(b.id || b._id || id);
      setActionMsg("Booking has been cancelled.");
      setTimeout(() => setActionMsg(""), 3000);
      load();
    } catch (e: any) {
      alert(e?.message || "Failed to cancel booking.");
    }
  };

  const handleSaveReschedule = async () => {
    if (!newDate || !newTime) {
      alert("Please select both a date and time.");
      return;
    }
    const todayStr = new Date().toISOString().split("T")[0];
    if (newDate < todayStr) {
      alert("Scheduled date cannot be in the past.");
      return;
    }

    setRescheduleLoading(true);
    try {
      await api.rescheduleBooking(b.id || b._id || id, newDate, newTime);
      setShowReschedule(false);
      setActionMsg("Booking rescheduled successfully!");
      setTimeout(() => setActionMsg(""), 3500);
      load();
    } catch (e: any) {
      alert(e?.message || "Failed to reschedule booking.");
    } finally {
      setRescheduleLoading(false);
    }
  };

  if (!b) return <div className="card p-10 text-center">Loading booking…</div>;

  const w = b.workerId;
  const bookingId = b.id || b._id || id;
  const home = user?.role === "worker" ? "/worker" : user?.role === "admin" ? "/admin" : "/customer";

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link to={home} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> {t("returnToMainPage")}
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Booking #{bookingId}</p>
          <h1 className="text-3xl font-black">{translateService(b.serviceId?.name)}</h1>
        </div>
        <StatusBadge status={b.status} />
      </div>

      {actionMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {actionMsg}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="card p-5">
          <h3 className="mb-5 font-bold">{t("bookingStatus")}</h3>
          {b.status === "SCHEDULED" ? (
            <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-5 space-y-3">
              <div className="flex items-center gap-2 text-purple-900 font-black text-sm">
                <CalendarDays size={18} className="text-purple-600" />
                Scheduled Appointment Confirmed
              </div>
              <p className="text-xs text-purple-800 leading-relaxed">
                This service appointment is confirmed for <b>{b.scheduledDate}</b> at <b>{b.scheduledTime || "Flexible Slot"}</b>.
                Your cooperative verified technician will be assigned and dispatched prior to your scheduled arrival window.
              </p>
              <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-xs text-purple-900 font-semibold">
                <span>Arrival Window:</span>
                <span className="font-bold">{b.scheduledTime || "10:00 AM"}</span>
              </div>
            </div>
          ) : (
            <BookingStepper status={b.status} />
          )}

          {w && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs text-slate-400">Assigned Partner</p>
              <b className="text-base text-slate-900">{w.userId?.name}</b>
              <p className="text-sm text-slate-500">{w.userId?.phone}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCall(true)}
                  className="btn-secondary flex items-center gap-1.5 px-3 py-2 text-xs font-bold"
                >
                  <Phone size={15} /> Call
                </button>
                <button
                  type="button"
                  onClick={() => setChat(true)}
                  className="btn-secondary flex items-center gap-1.5 px-3 py-2 text-xs font-bold"
                >
                  <MessageCircle size={15} /> Message
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold">{t("serviceDetails")}</h3>
            <p className="mt-4 flex gap-3 text-sm text-slate-600">
              <MapPin size={17} className="text-brand-600 shrink-0" />
              {b.location?.address}
            </p>
            <p className="mt-3 flex gap-3 text-sm text-slate-600">
              <Clock3 size={17} className="text-brand-600 shrink-0" />
              {b.scheduledDate ? `${b.scheduledDate} • ${b.scheduledTime || "Flexible Slot"}` : "Today • ASAP"}
            </p>
            <div className="mt-5 flex justify-between border-t border-slate-100 pt-4">
              <span className="text-sm font-semibold text-slate-500">Total Fare</span>
              <b className="text-xl font-black text-slate-900">₹{b.fare}</b>
            </div>
          </div>

          {b.status === "SCHEDULED" ? (
            <div className="space-y-2">
              <button
                onClick={() => setShowReschedule(true)}
                className="btn-primary w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 text-sm shadow-md shadow-purple-600/20"
              >
                <Calendar size={16} />
                Reschedule Appointment
              </button>
              <button
                onClick={handleCancel}
                className="btn-secondary w-full flex items-center justify-center gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-2.5 text-xs"
              >
                <XCircle size={15} />
                Cancel Booking
              </button>
              <Link to="/customer/bookings?tab=scheduled" className="btn-secondary w-full text-center text-xs font-bold block py-2">
                View All Scheduled Bookings
              </Link>
            </div>
          ) : b.status !== "COMPLETED" && (
            <Link to={`/booking/${bookingId}/tracking`} className="btn-primary w-full">
              Track worker
            </Link>
          )}

          {b.status === "COMPLETED" && b.paymentStatus !== "PAID" && (
            <button
              onClick={() => nav(`/booking/${bookingId}/payment`)}
              className="btn-primary flex w-full items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 font-bold"
            >
              <CreditCard size={18} />
              Continue to Payment (₹{b.fare})
            </button>
          )}

          {b.status === "COMPLETED" && b.paymentStatus === "PAID" && (
            <button
              onClick={() => nav(`/booking/${bookingId}/rating`)}
              className="btn-primary flex w-full items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 font-bold"
            >
              <Star size={18} className="fill-white" />
              Rate & Review Worker ⭐
            </button>
          )}

          <Link to={home} className="btn-secondary w-full">
            <Home size={17} /> Home
          </Link>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="card w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-purple-900 font-extrabold text-sm">
                <CalendarDays size={18} className="text-purple-600" />
                Reschedule Booking #{String(bookingId).slice(-6)}
              </div>
              <button
                onClick={() => setShowReschedule(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="input text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
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
                      onClick={() => setNewTime(tSlot)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                        newTime === tSlot
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

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowReschedule(false)}
                disabled={rescheduleLoading}
                className="btn-secondary px-3 py-2 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReschedule}
                disabled={rescheduleLoading || !newDate || !newTime}
                className="btn-primary bg-purple-600 hover:bg-purple-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/20"
              >
                {rescheduleLoading ? "Saving..." : "Save New Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {call && (
        <CallModal
          bookingId={String(bookingId)}
          phone={w?.userId?.phone}
          name={w?.userId?.name || "Worker"}
          onClose={() => setCall(false)}
        />
      )}

      {chat && (
        <ChatModal
          bookingId={bookingId}
          workerName={w?.userId?.name || "Worker"}
          onClose={() => setChat(false)}
        />
      )}
    </div>
  );
}
