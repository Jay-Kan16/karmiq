import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Phone, ArrowLeft, PlusCircle, Receipt, Clock, CheckCircle2, Navigation } from "lucide-react";
import MapView from "../../components/map/MapView";
import { api } from "../../services/api";
import AddExtraChargesModal from "../../components/worker/AddExtraChargesModal";
import { openGoogleMapsRoute, getGoogleMapsDirectionsUrl } from "../../utils/maps";

export default function ActiveJob() {
  const { id } = useParams();
  const [b, setB] = useState<any>();
  const [workerCoord, setWorkerCoord] = useState<{ lat: number; lng: number } | undefined>();
  const [showExtraModal, setShowExtraModal] = useState(false);

  useEffect(() => {
    (id ? api.getBooking(id) : api.getActiveWorkerJob()).then(setB).catch(() => {});
  }, [id]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setWorkerCoord({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        api.setWorkerLocation(pos.coords.latitude, pos.coords.longitude).catch(() => {});
      });
    }
  }, []);

  if (!b) return <div className="card p-8 text-center font-bold">Loading active job…</div>;

  const next: any = ({
    WORKER_ASSIGNED: "ACCEPTED",
    ACCEPTED: "ON_THE_WAY",
    ON_THE_WAY: "ARRIVED",
    ARRIVED: "SERVICE_STARTED",
    SERVICE_STARTED: "COMPLETED"
  } as any)[b.status];

  const update = async () => {
    if (next) {
      let mapsWindow: Window | null = null;
      if (next === "ON_THE_WAY") {
        mapsWindow = openGoogleMapsRoute(b, workerCoord);
      }
      try {
        const updated = await api.updateBookingStatus(b._id || b.id, next);
        setB(updated);
      } catch (err) {
        if (mapsWindow) mapsWindow.close();
        alert(err instanceof Error ? err.message : "Failed to update status");
      }
    }
  };

  const c = {
    lat: b.location?.coordinates?.[1] ?? b.location?.lat,
    lng: b.location?.coordinates?.[0] ?? b.location?.lng,
    address: b.location?.address
  };

  const extra = b.extraCharges || 0;
  const fare = b.fare || 0;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link
        to="/worker/jobs"
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} /> Back to jobs
      </Link>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_.8fr]">
        <div className="card relative overflow-hidden">
          <div className="h-[55vh] min-h-[420px]">
            <MapView customerMarker={c} workerMarker={workerCoord} />
          </div>
          {/* Floating Google Maps navigation shortcut */}
          <div className="absolute top-3 right-3 z-[1000]">
            <button
              type="button"
              onClick={() => openGoogleMapsRoute(b, workerCoord)}
              className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white/95 px-3 py-2 text-xs font-black text-blue-700 shadow-md backdrop-blur transition hover:bg-blue-50 active:scale-95"
            >
              <Navigation size={14} className="text-blue-600" />
              Route in Google Maps ↗
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h1 className="text-2xl font-black">{b.serviceId?.name || "Active Service"}</h1>
            <p className="mt-2 text-sm text-slate-500">
              <MapPin className="mr-1 inline" size={14} />
              {b.location?.address}
            </p>
            <p className="mt-4 font-bold text-slate-900">Customer: {b.customerId?.name}</p>

            <div className="mt-3 space-y-2">
              {b.customerId?.phone && (
                <a
                  className="btn-secondary flex items-center justify-center gap-2 w-full text-xs font-bold"
                  href={`tel:${b.customerId.phone}`}
                >
                  <Phone size={15} /> Call customer
                </a>
              )}

              <button
                type="button"
                onClick={() => openGoogleMapsRoute(b, workerCoord)}
                className="btn-primary flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-xs font-black text-white shadow-sm py-2.5"
              >
                <Navigation size={15} /> Open Route in Google Maps ↗
              </button>
            </div>

            {/* Bill & Extra Charges Box */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Current Total Fare</span>
                  <p className="text-xl font-black text-slate-900">₹{fare}</p>
                </div>
                {extra > 0 && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-900">
                    +₹{extra} extra
                  </span>
                )}
              </div>
              {extra > 0 && b.extraChargesReason && (
                <p className="mt-1 text-xs text-amber-800">
                  Reason: <b>{b.extraChargesReason}</b>
                </p>
              )}
              <button
                type="button"
                onClick={() => setShowExtraModal(true)}
                className="btn-secondary mt-3 flex w-full items-center justify-center gap-1.5 border-brand-300 bg-white text-xs font-black text-brand-700 hover:bg-brand-50"
              >
                <PlusCircle size={15} />
                {extra > 0 ? "Add More Extra Charges" : "+ Add Extra Charges"}
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-slate-100 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
              <p className="mt-1 font-black text-slate-900">{b.status?.replace(/_/g, " ")}</p>
            </div>

            {next && (
              <button onClick={update} className="btn-primary mt-4 w-full py-3 font-black">
                {next === "ON_THE_WAY"
                  ? "Start Journey (On The Way) & Open Maps"
                  : next.replaceAll("_", " ")}
              </button>
            )}
          </div>
        </div>
      </div>

      {showExtraModal && (
        <AddExtraChargesModal
          bookingId={b._id || b.id}
          customerName={b.customerId?.name}
          serviceName={b.serviceId?.name}
          currentFare={fare}
          currentExtra={extra}
          onClose={() => setShowExtraModal(false)}
          onSuccess={(updated) => setB(updated)}
        />
      )}
    </div>
  );
}
