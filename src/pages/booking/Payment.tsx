import { CheckCircle2, Smartphone, Banknote, CreditCard, ArrowLeft, Star, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PaymentSummary from "../../components/payment/PaymentSummary";
import { api } from "../../services/api";
import { useApp } from "../../context/AppContext";

export default function Payment() {
  const { id } = useParams();
  const nav = useNavigate();
  const { t, translateService } = useApp();
  const [b, setB] = useState<any>();
  const [method, setMethod] = useState("UPI");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (id) {
      api.getBooking(id).then(setB).catch(console.error);
    }
  }, [id]);

  if (!b) return <div className="card p-10 text-center">Loading payment…</div>;

  const bookingId = b.id || b._id || id;
  const workerName = b.workerId?.userId?.name || "Service Partner";

  const pay = async () => {
    setProcessing(true);
    try {
      await api.processPayment(bookingId, method);
      setDone(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="card border-2 border-emerald-500/40 p-8 shadow-xl">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={36} />
          </span>
          <span className="mt-4 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            Payment Successful
          </span>
          <h1 className="mt-2 text-3xl font-black text-slate-900">₹{b.fare} Paid</h1>
          <p className="mt-2 text-sm text-slate-500">
            Payment has been successfully credited for {translateService(b.serviceId?.name || "Service")}.
          </p>

          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left text-xs text-slate-600">
            <p className="font-bold text-slate-800">Cooperative Fair Pay Guarantee</p>
            <p className="mt-1">
              90% of your payment is directly routed to <b>{workerName}</b>, empowering fair local labor without predatory platform cuts.
            </p>
          </div>

          <button
            onClick={() => nav(`/booking/${bookingId}/rating`)}
            className="btn-primary mt-6 flex w-full items-center justify-center gap-2 bg-amber-500 py-3.5 text-base font-black text-white hover:bg-amber-600"
          >
            <Star size={18} className="fill-white" />
            Rate & Review {workerName} ⭐
          </button>
        </div>
      </div>
    );
  }

  const methods = [
    ["UPI", Smartphone, "Google Pay, PhonePe, Paytm, BHIM"],
    ["Cash", Banknote, "Pay in cash directly to the worker"],
    ["Card", CreditCard, "Debit / Credit card or NetBanking"]
  ] as const;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        to={`/booking/${bookingId}/tracking`}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} /> Back to tracking
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Checkout</span>
          <h1 className="section-title text-2xl font-black">{t("payment")}</h1>
        </div>
        <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
          <ShieldCheck size={16} className="text-emerald-600" /> Secure Payment
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <PaymentSummary
          fare={b.fare}
          serviceName={b.serviceId?.name || ""}
          baseFare={b.baseFare}
          extraCharges={b.extraCharges}
          extraChargesReason={b.extraChargesReason}
        />

        <div className="card space-y-4 p-5">
          <h3 className="font-bold text-slate-900">Choose payment method</h3>
          <div className="space-y-2.5">
            {methods.map(([m, Icon, desc]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                  method === m
                    ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                    method === m ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon size={18} />
                </span>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{m}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={pay}
            disabled={processing}
            className="btn-primary mt-4 flex w-full items-center justify-center gap-2 bg-emerald-600 py-3.5 text-base font-black text-white hover:bg-emerald-700"
          >
            <CreditCard size={18} />
            {processing ? "Processing…" : `Pay ₹${b.fare}`}
          </button>
        </div>
      </div>
    </div>
  );
}
