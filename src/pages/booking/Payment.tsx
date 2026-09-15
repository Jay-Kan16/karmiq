import {
  CheckCircle2,
  Smartphone,
  Banknote,
  CreditCard,
  ArrowLeft,
  Star,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from "lucide-react";
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
  const [method, setMethod] = useState<"UPI" | "Cash" | "Card">("UPI");
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>("PhonePe");
  const [showQr, setShowQr] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (id) {
      api.getBooking(id).then(setB).catch(console.error);
    }
  }, [id]);

  if (!b) return <div className="card p-10 text-center">Loading payment…</div>;

  const bookingId = b.id || b._id || id;
  const workerName = b.workerId?.userId?.name || "Service Partner";
  const fare = b.fare || 0;
  const upiId = "karmiq.coop@okhdfcbank";
  const payeeName = "KarmiK Cooperative";
  const note = `KarmiK Booking ${String(bookingId).slice(-6)}`;

  // Standard NPCI compliant UPI Intent URI
  const standardUpiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${fare}&cu=INR&tn=${encodeURIComponent(note)}&tr=${bookingId}`;

  // App-specific intent schemes
  const upiApps = [
    {
      id: "phonepe",
      name: "PhonePe",
      iconBg: "bg-[#5f259f]",
      textLogo: "पे",
      badge: "Popular in India",
      uri: `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
        payeeName
      )}&am=${fare}&cu=INR&tn=${encodeURIComponent(note)}&tr=${bookingId}`
    },
    {
      id: "gpay",
      name: "Google Pay",
      iconBg: "bg-white border border-slate-200",
      customIcon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
      ),
      badge: "Instant 1-Tap",
      uri: `tez://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
        payeeName
      )}&am=${fare}&cu=INR&tn=${encodeURIComponent(note)}&tr=${bookingId}`
    },
    {
      id: "paytm",
      name: "Paytm",
      iconBg: "bg-[#002970]",
      textLogo: "Paytm",
      badge: "UPI & Wallet",
      uri: `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
        payeeName
      )}&am=${fare}&cu=INR&tn=${encodeURIComponent(note)}&tr=${bookingId}`
    },
    {
      id: "upi_any",
      name: "Any UPI App",
      iconBg: "bg-emerald-600 text-white",
      textLogo: "UPI",
      badge: "BHIM / Cred / Other",
      uri: standardUpiUri
    }
  ];

  const handleLaunchUpi = (appItem: typeof upiApps[0]) => {
    setSelectedUpiApp(appItem.name);
    setAwaitingConfirmation(true);

    // Try app-specific scheme; fallback to generic UPI intent
    try {
      window.location.href = appItem.uri;
    } catch {
      window.location.href = standardUpiUri;
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const pay = async (customMethod?: string) => {
    setProcessing(true);
    try {
      const finalMethod = customMethod || (method === "UPI" ? `UPI (${selectedUpiApp})` : method);
      await api.processPayment(bookingId, finalMethod);
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
    ["UPI", Smartphone, "PhonePe, Google Pay, Paytm, BHIM"],
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
                onClick={() => {
                  setMethod(m as any);
                  setAwaitingConfirmation(false);
                }}
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

          {/* UPI APPS SELECTOR & DIRECT OPEN BUTTONS */}
          {method === "UPI" && (
            <div className="mt-4 rounded-2xl border-2 border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 via-white to-brand-50/30 p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                    Pay with UPI App
                  </h4>
                  <p className="text-xs text-slate-500">Click your app to open and pay ₹{fare}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQr(!showQr)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 bg-white border border-brand-200 rounded-lg px-2 py-1 shadow-2xs"
                >
                  <QrCode size={13} /> {showQr ? "Hide QR" : "Show QR"}
                </button>
              </div>

              {/* UPI APP BUTTONS */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {upiApps.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => handleLaunchUpi(app)}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-emerald-500 hover:bg-emerald-50/50 hover:shadow-sm active:scale-[0.98]"
                  >
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-black text-xs ${app.iconBg}`}
                    >
                      {app.customIcon ? (
                        app.customIcon
                      ) : app.textLogo === "पे" ? (
                        <span className="text-white text-base">पे</span>
                      ) : app.textLogo === "Paytm" ? (
                        <span className="text-white text-[10px] font-black">
                          Pay<span className="text-[#00baf2]">tm</span>
                        </span>
                      ) : (
                        app.textLogo
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">{app.name}</p>
                      <p className="text-[10px] font-medium text-slate-400 truncate">{app.badge}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300" />
                  </button>
                ))}
              </div>

              {/* DYNAMIC QR CODE DISPLAY */}
              {showQr && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center space-y-2.5 animate-in fade-in">
                  <p className="text-xs font-black text-slate-800">
                    Scan to Pay ₹{fare} with PhonePe, GPay, or Paytm
                  </p>
                  <div className="mx-auto grid h-48 w-48 place-items-center rounded-2xl border bg-slate-50 p-2 shadow-inner">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        standardUpiUri
                      )}`}
                      alt="UPI Payment QR Code"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <span>UPI ID: <b className="text-slate-800">{upiId}</b></span>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                    >
                      {copiedUpi ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      {copiedUpi ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              )}

              {/* AWAITING CONFIRMATION BANNER */}
              {awaitingConfirmation && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-100/70 p-3 text-xs text-emerald-950 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-black">
                    <span className="h-2.5 w-2.5 animate-ping rounded-full bg-emerald-600" />
                    Opening {selectedUpiApp}…
                  </div>
                  <p className="text-[11px] text-emerald-900 leading-relaxed">
                    Please approve the ₹{fare} payment in {selectedUpiApp}. Once completed, click the button below to confirm.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ACTION BUTTON */}
          {method === "UPI" ? (
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleLaunchUpi(upiApps[0])}
                className="btn-primary flex w-full items-center justify-center gap-2 bg-gradient-to-r from-[#5f259f] to-emerald-600 py-3.5 text-base font-black text-white shadow-lg shadow-emerald-600/20 hover:opacity-95 active:scale-[0.99]"
              >
                <Smartphone size={18} />
                Open UPI App & Pay ₹{fare}
              </button>

              <button
                onClick={() => pay(`UPI (${selectedUpiApp})`)}
                disabled={processing}
                className="btn-secondary flex w-full items-center justify-center gap-2 border-emerald-300 bg-emerald-50/60 py-3 text-xs font-black text-emerald-800 hover:bg-emerald-100 transition"
              >
                <CheckCircle2 size={16} className="text-emerald-600" />
                {processing ? "Confirming…" : `I Have Paid ₹${fare} (Confirm)`}
              </button>
            </div>
          ) : (
            <button
              onClick={() => pay()}
              disabled={processing}
              className="btn-primary mt-4 flex w-full items-center justify-center gap-2 bg-emerald-600 py-3.5 text-base font-black text-white hover:bg-emerald-700"
            >
              <CreditCard size={18} />
              {processing ? "Processing…" : `Pay ₹${fare}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
