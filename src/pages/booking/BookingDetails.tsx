import { Phone, MessageCircle, MapPin, Clock3, Home, ArrowLeft, Star, CreditCard } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";
import BookingStepper from "../../components/booking/BookingStepper";
import StatusBadge from "../../components/common/StatusBadge";

export default function BookingDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, t, translateService } = useApp();
  const [b, setB] = useState<any>();

  useEffect(() => {
    if (id) api.getBooking(id).then(setB);
  }, [id]);

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

      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="card p-5">
          <h3 className="mb-5 font-bold">{t("bookingStatus")}</h3>
          <BookingStepper status={b.status} />
          {w && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs text-slate-400">Assigned Partner</p>
              <b className="text-base text-slate-900">{w.userId?.name}</b>
              <p className="text-sm text-slate-500">{w.userId?.phone}</p>
              <div className="mt-3 flex gap-2">
                {w.userId?.phone && (
                  <a className="btn-secondary px-3 py-2 text-xs font-bold" href={`tel:${w.userId?.phone}`}>
                    <Phone size={15} /> Call
                  </a>
                )}
                <button className="btn-secondary px-3 py-2 text-xs font-bold">
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
              {b.scheduledDate || "Now"} • {b.scheduledTime || "ASAP"}
            </p>
            <div className="mt-5 flex justify-between border-t border-slate-100 pt-4">
              <span className="text-sm font-semibold text-slate-500">Total Fare</span>
              <b className="text-xl font-black text-slate-900">₹{b.fare}</b>
            </div>
          </div>

          {b.status !== "COMPLETED" && (
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
    </div>
  );
}
