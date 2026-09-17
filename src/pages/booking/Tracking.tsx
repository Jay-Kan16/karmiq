import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  Home,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
  AlertCircle,
  Radio,
  X,
  PlusCircle
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MapView from "../../components/map/MapView";
import BookingStepper from "../../components/booking/BookingStepper";
import StatusBadge from "../../components/common/StatusBadge";
import ChatModal from "../../components/chat/ChatModal";
import CallModal from "../../components/chat/CallModal";
import WorkerRadarScanner from "../../components/booking/WorkerRadarScanner";
import AddExtraChargesModal from "../../components/worker/AddExtraChargesModal";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";
import type { Booking } from "../../types";

export default function Tracking() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, t, translateService } = useApp();
  const [b, setB] = useState<Booking | null>(null);
  const [worker, setWorker] = useState<any>(null);
  const [workerCoord, setWorkerCoord] = useState<any>(null);
  const [customerCoord, setCustomerCoord] = useState<any>(null);
  const [chat, setChat] = useState(false);
  const [call, setCall] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [nearbyWorkers, setNearbyWorkers] = useState<any[]>([]);
  const [radarLoading, setRadarLoading] = useState(false);
  const [showExtraModal, setShowExtraModal] = useState(false);

  const openRadarScanner = async () => {
    setShowScanner(true);
    setRadarLoading(true);
    try {
      const loc = b?.location as any;
      const lat = customerCoord?.lat || loc?.coordinates?.[1] || loc?.lat;
      const lng = customerCoord?.lng || loc?.coordinates?.[0] || loc?.lng;
      const serviceName = (b?.serviceId as any)?.name || (b as any)?.serviceName || (typeof b?.serviceId === "string" ? b.serviceId : "Service");
      const list = await api.getNearbyWorkers(serviceName, lat, lng);
      setNearbyWorkers((list || []).filter((w: any) => w.availability === "online"));
    } catch (err) {
      console.error("Failed to load nearby workers for reassignment", err);
      setNearbyWorkers([]);
    } finally {
      setRadarLoading(false);
    }
  };

  const home =
    user?.role === "worker"
      ? "/worker"
      : user?.role === "admin"
      ? "/admin"
      : "/customer";

  useEffect(() => {
    if (!id) return;
    let active = true;

    const load = () =>
      api
        .getBooking(id)
        .then((x: any) => {
          if (!active) return;
          setB(x);
          setWorker(x.workerId);
          setCustomerCoord({
            lat: x.location?.coordinates?.[1] ?? x.location?.lat,
            lng: x.location?.coordinates?.[0] ?? x.location?.lng,
            address: x.location?.address
          });
          if (x.workerId?.currentLocation?.coordinates) {
            setWorkerCoord({
              lat: x.workerId.currentLocation.coordinates[1],
              lng: x.workerId.currentLocation.coordinates[0]
            });
          }
        })
        .catch(() => {});

    load();
    const timer = window.setInterval(load, 3000);
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

  const wc = useMemo(() => {
    if (workerCoord && (workerCoord.lat !== 0 || workerCoord.lng !== 0)) return workerCoord;
    if (worker?.currentLocation?.coordinates?.length === 2) {
      const lng = worker.currentLocation.coordinates[0];
      const lat = worker.currentLocation.coordinates[1];
      if (lat !== 0 || lng !== 0) return { lat, lng };
    }
    if (
      worker &&
      customerCoord?.lat &&
      customerCoord?.lng &&
      (customerCoord.lat !== 0 || customerCoord.lng !== 0)
    ) {
      return {
        lat: customerCoord.lat + 0.005,
        lng: customerCoord.lng - 0.006
      };
    }
    return undefined;
  }, [workerCoord, worker, customerCoord]);

  if (!b) return <div className="card p-10 text-center">Loading booking…</div>;

  const workerName = worker?.userId?.name || "Worker not assigned";
  const phone = worker?.userId?.phone;

  const advance = async (status: any) => {
    try {
      const x = await api.updateBookingStatus(b.id, status);
      setB(x as any);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Unable to update booking");
    }
  };

  const action =
    b.status === "WORKER_ASSIGNED"
      ? "ACCEPTED"
      : b.status === "ACCEPTED"
      ? "ON_THE_WAY"
      : b.status === "ON_THE_WAY"
      ? "ARRIVED"
      : b.status === "ARRIVED"
      ? "SERVICE_STARTED"
      : b.status === "SERVICE_STARTED"
      ? "COMPLETED"
      : null;

  const isCompleted = b.status === "COMPLETED";
  const isPaid = b.paymentStatus === "PAID";

  return (
    <div className="mx-auto max-w-5xl">
      {/* Top Breadcrumb & Return */}
      <div className="mb-5 flex items-center justify-between">
        <Link
          to={`/booking/${id}`}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={16} /> Booking #{id}
        </Link>
        <Link to={home} className="btn-secondary px-3 py-2 text-xs font-bold">
          <Home size={15} /> {t("returnToMainPage")}
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid gap-5 lg:grid-cols-[1.5fr_.7fr]">
        {/* Left Map View */}
        <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="h-[55vh] min-h-[420px]">
            <MapView
              customerMarker={customerCoord || undefined}
              workerMarker={wc}
              simulated={false}
            />
          </div>
        </div>

        {/* Right Info & Actions Column */}
        <div className="space-y-4">
          {/* Worker is busy alert if REJECTED */}
          {b.status === "REJECTED" && (
            <div className="card border-2 border-amber-400 bg-amber-50/90 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800">
                  <AlertCircle size={22} />
                </div>
                <div className="flex-1">
                  <span className="inline-block rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-black text-amber-900 uppercase">
                    Worker is busy
                  </span>
                  <h3 className="mt-1 text-base font-black text-amber-950">
                    Worker is currently busy
                  </h3>
                  <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                    {b.rejectedReason || "The assigned worker is busy with another job and unable to take this request."}{" "}
                    Please change worker to assign a new nearby professional.
                  </p>
                </div>
              </div>
              {user?.role === "customer" && (
                <button
                  onClick={openRadarScanner}
                  className="btn-primary mt-4 flex w-full items-center justify-center gap-2 bg-amber-600 py-3 text-sm font-black text-white hover:bg-amber-700 shadow-md shadow-amber-600/25 transition active:scale-[0.99]"
                >
                  <Radio size={16} className="animate-pulse" />
                  Change Worker
                </button>
              )}
            </div>
          )}

          {/* Worker Card */}
          <div className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Your worker</p>
                <h1 className="mt-1 text-xl font-black text-slate-900">{workerName}</h1>
                {worker && (
                  <p className="mt-0.5 text-sm font-medium text-slate-500">
                    {translateService(worker.skills?.[0] || "Worker")} • ⭐{" "}
                    {worker.rating ? worker.rating.toFixed(1) : "5.0"}
                  </p>
                )}
              </div>
              <StatusBadge status={b.status} />
            </div>

            <div className="mt-5 rounded-2xl bg-brand-50 p-4">
              <p className="font-black text-brand-900">{b.status.replace(/_/g, " ")}</p>
              {!isCompleted && (
                <p className="mt-1 flex items-center gap-2 text-sm text-brand-700">
                  <Clock3 size={15} /> ETA: {b.eta ? `${b.eta} minutes` : "—"}
                </p>
              )}
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-brand-800">
                <MapPin size={13} />
                {customerCoord?.address}
              </p>
            </div>

            {/* Contact Actions */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {phone && (
                <button onClick={() => setCall(true)} className="btn-secondary text-xs">
                  <Phone size={15} /> Call
                </button>
              )}
              <button onClick={() => setChat(true)} className="btn-secondary text-xs">
                <MessageCircle size={15} /> Message
              </button>
            </div>

            {/* Live Bill Card with Extra Charges */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Current Total Fare</span>
                  <p className="text-xl font-black text-slate-900">₹{b.fare}</p>
                </div>
                {b.extraCharges && b.extraCharges > 0 ? (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                    +₹{b.extraCharges} Extra Included
                  </span>
                ) : null}
              </div>
              {b.extraCharges && b.extraCharges > 0 && b.extraChargesReason && (
                <p className="mt-1.5 text-xs text-amber-800">
                  Worker Note: <b>{b.extraChargesReason}</b>
                </p>
              )}
            </div>
          </div>

          {/* Journey Stepper Card */}
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{t("journey")}</h3>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Live Status
              </span>
            </div>
            <BookingStepper status={b.status} />

            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs font-semibold text-slate-700">
              {b.status === "WORKER_ASSIGNED"
                ? "Worker assigned to your booking. Waiting for confirmation."
                : b.status === "ACCEPTED"
                ? "Worker accepted the booking! Preparing to start journey."
                : b.status === "ON_THE_WAY"
                ? `Worker is on the way to your address! ${b.eta ? `~${b.eta} min away.` : ""}`
                : b.status === "ARRIVED"
                ? "Worker has arrived at your location."
                : b.status === "SERVICE_STARTED"
                ? "Service is currently in progress."
                : b.status === "COMPLETED"
                ? "Service completed!"
                : "Tracking booking progress..."}
            </div>
          </div>

          {/* CUSTOMER PAYMENT & REVIEW CARD WHEN COMPLETED */}
          {user?.role === "customer" && isCompleted && (
            <div className="card relative overflow-hidden border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/70 via-white to-brand-50/50 p-5 shadow-lg">
              {!isPaid ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                        Service Completed!
                      </span>
                      <h3 className="text-base font-black text-slate-900">
                        Proceed to Payment
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-white p-3.5 shadow-sm">
                    <div>
                      <p className="text-xs text-slate-400">Total Payable</p>
                      <p className="text-2xl font-black text-slate-900">₹{b.fare}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      Payment Pending
                    </span>
                  </div>

                  <button
                    onClick={() => nav(`/booking/${id}/payment`)}
                    className="btn-primary flex w-full items-center justify-center gap-2 bg-emerald-600 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-[0.99]"
                  >
                    <CreditCard size={18} />
                    Pay Now ₹{b.fare}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
                      <Star size={22} className="fill-white" />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                        Payment Completed (₹{b.fare}) ✅
                      </span>
                      <h3 className="text-base font-black text-slate-900">
                        Rate Your Experience
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-600">
                    Payment is done! Please leave a quick review for{" "}
                    <b>{workerName}</b> to support our verified worker cooperative.
                  </p>

                  <button
                    onClick={() => nav(`/booking/${id}/rating`)}
                    className="btn-primary flex w-full items-center justify-center gap-2 bg-amber-500 py-3.5 text-sm font-black text-white shadow-lg shadow-amber-500/25 transition hover:bg-amber-600 active:scale-[0.99]"
                  >
                    <Star size={18} className="fill-white" />
                    Leave Rating & Review ⭐
                  </button>
                </div>
              )}
            </div>
          )}

          {/* WORKER COMPLETION STATUS */}
          {user?.role === "worker" && isCompleted && (
            <div className="card border-2 border-emerald-500/30 bg-emerald-50/50 p-5 text-center">
              <CheckCircle2 size={28} className="mx-auto text-emerald-600" />
              <h3 className="mt-2 font-black text-slate-900">Service Completed 🎉</h3>
              <p className="mt-1 text-xs text-slate-600">
                Fare: <b>₹{b.fare}</b> • Payment:{" "}
                <span className={isPaid ? "font-bold text-emerald-700" : "font-bold text-amber-700"}>
                  {isPaid ? "Received ✅" : "Pending Customer Payment"}
                </span>
              </p>
              <Link to="/worker/jobs" className="btn-secondary mt-4 inline-flex items-center gap-1.5 text-xs font-bold">
                Back to Jobs
              </Link>
            </div>
          )}

          {/* Worker Advance Status Button */}
          {user?.role === "worker" && action && (
            <button onClick={() => advance(action)} className="btn-primary w-full">
              {action.replace(/_/g, " ")}
            </button>
          )}

          {/* Worker Extra Charges Button */}
          {user?.role === "worker" && !isCompleted && b.status !== "CANCELLED" && (
            <button
              type="button"
              onClick={() => setShowExtraModal(true)}
              className="btn-secondary w-full flex items-center justify-center gap-1.5 border-brand-300 bg-brand-50/50 py-2.5 text-xs font-black text-brand-700 hover:bg-brand-100"
            >
              <PlusCircle size={15} /> + Add Extra Charges {b.extraCharges ? `(Current: ₹${b.extraCharges})` : ""}
            </button>
          )}

          {/* Customer Cancel Button (Only before completion) */}
          {user?.role === "customer" && !isCompleted && b.status !== "CANCELLED" && (
            <button
              onClick={async () => {
                try {
                  setB(await api.cancelBooking(b.id));
                } catch (e) {
                  alert(e instanceof Error ? e.message : "Unable to cancel");
                }
              }}
              className="btn-secondary w-full"
            >
              Cancel booking
            </button>
          )}
        </div>
      </div>

      {call && (
        <CallModal
          bookingId={b.id || (b as any)._id}
          phone={phone}
          name={workerName}
          onClose={() => setCall(false)}
        />
      )}

      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setShowScanner(false)}
              className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              <X size={18} />
            </button>
            <WorkerRadarScanner
              serviceName={(b.serviceId as any)?.name || (b as any).serviceName || (typeof b.serviceId === "string" ? b.serviceId : "Service")}
              serviceIcon="⚡"
              userAddress={customerCoord?.address || b.location?.address || "Your location"}
              workers={nearbyWorkers}
              loading={radarLoading}
              onSelectWorker={async (w) => {
                if (w.availability !== "online") {
                  alert("This worker is currently offline.");
                  return;
                }
                try {
                  const updated = await api.reassignWorker(b.id, w.id);
                  setB(updated as any);
                  setWorker(updated.workerId);
                  setShowScanner(false);
                } catch (err: any) {
                  alert(err.message || "Failed to reassign worker");
                }
              }}
              onAutoAssign={async () => {
                const online = nearbyWorkers.filter((w) => w.availability === "online");
                if (online.length > 0) {
                  try {
                    const updated = await api.reassignWorker(b.id, online[0].id);
                    setB(updated as any);
                    setWorker(updated.workerId);
                    setShowScanner(false);
                  } catch (err: any) {
                    alert(err.message || "Failed to reassign worker");
                  }
                }
              }}
              onCancel={() => setShowScanner(false)}
            />
          </div>
        </div>
      )}

      {showExtraModal && b && (
        <AddExtraChargesModal
          bookingId={b.id || (b as any)._id}
          customerName={(b as any).customerId?.name}
          serviceName={(b.serviceId as any)?.name || (b as any).serviceName}
          currentFare={b.fare}
          currentExtra={b.extraCharges || 0}
          onClose={() => setShowExtraModal(false)}
          onSuccess={(updated) => setB(updated as any)}
        />
      )}
    </div>
  );
}
