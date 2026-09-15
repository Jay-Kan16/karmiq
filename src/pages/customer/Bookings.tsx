import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../../components/common/StatusBadge";
import ServiceIcon from "../../components/common/ServiceIcon";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";

export default function Bookings() {
  const { t, translateService } = useApp();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    api.getBookings().then(setData).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="section-title">{t("myBookings")}</h1>
      <p className="muted mt-2">{t("myBookingsSub")}</p>
      <div className="mt-5 grid gap-4">
        {data.length ? (
          data.map((b) => (
            <div
              className={`card flex flex-col justify-between gap-4 p-5 sm:flex-row ${
                b.status === "REJECTED" ? "border-2 border-amber-300 bg-amber-50/40" : ""
              }`}
              key={b._id || b.id}
            >
              <div className="flex gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-50">
                  <ServiceIcon nameOrId={b.serviceId?.name || b.serviceName} size={30} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{translateService(b.serviceId?.name || b.serviceName)}</h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {b.status === "REJECTED"
                      ? "Worker is busy with other tasks"
                      : b.workerId?.userId?.name || "Searching for worker"}{" "}
                    • {b.scheduledDate || "Now"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">{b.location?.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <b>₹{b.fare}</b>
                {b.status === "REJECTED" ? (
                  <Link
                    to={`/booking/${b._id || b.id}/tracking`}
                    className="btn-primary bg-amber-600 px-3.5 py-2 text-xs font-black text-white hover:bg-amber-700 shadow-sm"
                  >
                    Change Worker
                  </Link>
                ) : (
                  <Link to={`/booking/${b._id || b.id}/tracking`} className="btn-primary px-3 py-2 text-sm">
                    Track
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="card p-10 text-center">No bookings yet.</div>
        )}
      </div>
    </div>
  );
}