import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  FileCheck2,
  Star,
  ShieldCheck,
  Receipt,
  PlusCircle,
  IndianRupee,
  Clock,
  MapPin,
  CheckCircle2
} from "lucide-react";
import { api } from "../../services/api";
import AddExtraChargesModal from "../../components/worker/AddExtraChargesModal";

export default function WorkerProfile() {
  const [w, setW] = useState<any>();
  const [verifying, setVerifying] = useState(false);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [selectedBookingForExtra, setSelectedBookingForExtra] = useState<any | null>(null);

  const loadProfileAndJobs = async () => {
    try {
      const [workerData, jobsData] = await Promise.all([
        api.getWorkerMe(),
        api.getWorkerJobs().catch(() => [])
      ]);
      setW(workerData);
      setActiveJobs(jobsData || []);
    } catch (e) {
      console.error("Failed to load worker profile or jobs", e);
    }
  };

  useEffect(() => {
    loadProfileAndJobs();
  }, []);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const updated = await api.verifySelf();
      setW(updated);
    } catch (e) {
      alert("Failed to verify profile");
    } finally {
      setVerifying(false);
    }
  };

  if (!w) return <div className="card p-10 text-center">Loading profile…</div>;
  const u = w.userId;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="section-title">Worker Profile</h1>

      {/* Profile Header */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-brand-100 text-2xl font-black text-brand-700">
            {u?.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black">{u?.name}</h2>
              <BadgeCheck className="text-brand-600" />
            </div>
            <p className="text-slate-500">
              {w.skills?.join(", ")} • {w.experience} years
            </p>
            <p className="mt-2 text-sm font-bold">
              <Star className="mr-1 inline text-amber-400" size={15} />
              {w.rating?.toFixed?.(1) || "0"} •{" "}
              <Briefcase className="mr-1 inline" size={15} />
              {w.totalJobs} jobs
            </p>
          </div>
        </div>
      </div>

      {/* ACTIVE JOBS & EXTRA CHARGES MANAGEMENT */}
      <div className="card border-2 border-brand-200/80 bg-gradient-to-br from-white via-brand-50/20 to-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/20">
              <Receipt size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Active Jobs & Extra Charges</h3>
              <p className="text-xs text-slate-500">
                Add extra costs for materials, spare parts, or extra labor directly to the customer's bill.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">
            {activeJobs.length} Active {activeJobs.length === 1 ? "Job" : "Jobs"}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {activeJobs.length > 0 ? (
            activeJobs.map((b) => {
              const bookingId = b.id || b._id;
              const customerName = b.customerId?.name || "Customer";
              const serviceName = b.serviceId?.name || "Service";
              const extra = b.extraCharges || 0;
              const fare = b.fare || 0;

              return (
                <div
                  key={bookingId}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-400 sm:flex sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">{serviceName}</span>
                      <span className="text-xs text-slate-400">#{String(bookingId).slice(-6)}</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        {b.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Customer: <b>{customerName}</b> • {b.location?.address || "On site"}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      <span className="font-black text-slate-900">Total Bill: ₹{fare}</span>
                      {extra > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 font-bold text-amber-900">
                          Includes ₹{extra} extra ({b.extraChargesReason || "materials"})
                        </span>
                      ) : (
                        <span className="text-slate-400">No extra charges yet</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-0">
                    <button
                      onClick={() => setSelectedBookingForExtra(b)}
                      className="btn-primary flex w-full items-center justify-center gap-1.5 bg-brand-600 px-4 py-2 text-xs font-black text-white hover:bg-brand-700 shadow-sm sm:w-auto"
                    >
                      <PlusCircle size={15} />
                      {extra > 0 ? "Add More Charges" : "Add Extra Charges"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
              <IndianRupee className="mx-auto text-slate-400 mb-1" size={24} />
              <p className="text-sm font-bold text-slate-700">No assigned active jobs right now</p>
              <p className="text-xs text-slate-500 mt-0.5 max-w-md mx-auto">
                When you accept an assigned job, you can add custom extra charges for spare parts, components, or extended work right here, which will instantly reflect in the user's profile and bill.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Skills & Verification Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-bold">Skills</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {w.skills?.map((s: string) => (
              <span key={s} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold">Verification</h3>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-50 p-4">
            <div className="flex items-center gap-3">
              <FileCheck2 className="text-brand-600" />
              <span className="text-sm font-bold">{w.verificationStatus}</span>
            </div>
            {w.verificationStatus !== "VERIFIED" && (
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="btn-primary flex items-center gap-1 px-3 py-1.5 text-xs"
              >
                <ShieldCheck size={14} />
                {verifying ? "Verifying…" : "Verify Account"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Extra Charges Modal */}
      {selectedBookingForExtra && (
        <AddExtraChargesModal
          bookingId={selectedBookingForExtra.id || selectedBookingForExtra._id}
          customerName={selectedBookingForExtra.customerId?.name}
          serviceName={selectedBookingForExtra.serviceId?.name}
          currentFare={selectedBookingForExtra.fare || 0}
          currentExtra={selectedBookingForExtra.extraCharges || 0}
          onClose={() => setSelectedBookingForExtra(null)}
          onSuccess={(updated) => {
            setActiveJobs((prev) =>
              prev.map((item) =>
                (item.id || item._id) === (updated.id || updated._id) ? updated : item
              )
            );
          }}
        />
      )}
    </div>
  );
}