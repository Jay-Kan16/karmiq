import { Check, ChevronRight, Home, Languages, LogOut, MapPin, Shield, Wallet, X, Phone, CreditCard, AlertCircle, Receipt, Navigation, Clock3, MessageSquare, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";
import BookingStepper from "../../components/booking/BookingStepper";
import StatusBadge from "../../components/common/StatusBadge";
import CallModal from "../../components/chat/CallModal";
import ChatModal from "../../components/chat/ChatModal";
import type { LanguageCode } from "../../data/translations";

export default function Profile() {
  const nav = useNavigate();
  const { user, logout, language, setLanguage, currentLocation, t, translateService } = useApp();
  const [activeModal, setActiveModal] = useState<"address" | "language" | "payment" | "support" | null>(null);
  const [busyBookings, setBusyBookings] = useState<any[]>([]);
  const [extraChargeBookings, setExtraChargeBookings] = useState<any[]>([]);
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [completedPendingPayment, setCompletedPendingPayment] = useState<any[]>([]);
  const [callModalBooking, setCallModalBooking] = useState<any | null>(null);
  const [chatModalBooking, setChatModalBooking] = useState<any | null>(null);

  useEffect(() => {
    let active = true;

    const load = () => {
      api.getBookings()
        .then((res: any) => {
          if (!active) return;
          const list = Array.isArray(res) ? res : res?.bookings || [];

          // Busy / rejected bookings
          const busy = list.filter((b: any) => b.status === "REJECTED");
          setBusyBookings(busy);

          // Extra charges added
          const extraList = list.filter((b: any) => (b.extraCharges || 0) > 0 && b.status !== "CANCELLED");
          setExtraChargeBookings(extraList);

          // Active in-progress journey bookings
          const activeList = list.filter((b: any) =>
            ["MATCHING", "WORKER_ASSIGNED", "ACCEPTED", "ON_THE_WAY", "ARRIVED", "SERVICE_STARTED"].includes(b.status)
          );
          setActiveBookings(activeList);

          // Completed bookings pending payment
          const pendingPay = list.filter((b: any) => b.status === "COMPLETED" && b.paymentStatus !== "PAID");
          setCompletedPendingPayment(pendingPay);
        })
        .catch(() => {});
    };

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

  const availableLanguages: { code: LanguageCode; name: string; native: string; description: string }[] = [
    { code: "en", name: "English", native: "English", description: "Default international language" },
    { code: "hi", name: "Hindi", native: "हिन्दी", description: "भारत की राजभाषा (राष्ट्रव्यापी उपयोग)" }
  ];

  const handleLanguageSelect = (code: LanguageCode) => {
    setLanguage(code);
    setTimeout(() => setActiveModal(null), 150);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="section-title">{t("profile")}</h1>

      <div className="card mt-6 p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-xl font-black text-brand-700">
            {user?.name
              ?.split(" ")
              .map(n => n[0])
              .join("") || "U"}
          </div>
          <div>
            <h2 className="text-xl font-black">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.phone}</p>
          </div>
        </div>
      </div>

      {/* ACTIVE BOOKING JOURNEY WINDOW */}
      {activeBookings.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-3xl border-2 border-brand-500/40 bg-white p-5 shadow-lg shadow-brand-500/5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600 shadow-2xs">
                <Navigation size={18} className="animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">
                    {translateService(activeBookings[0].serviceId?.name || activeBookings[0].serviceName || "Service")} Journey
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 uppercase tracking-wide">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Booking #{String(activeBookings[0]._id || activeBookings[0].id).slice(-6)}
                  {activeBookings[0].eta ? ` • ~${activeBookings[0].eta} min away` : ""}
                </p>
              </div>
            </div>
            <StatusBadge status={activeBookings[0].status} />
          </div>

          {/* Stepper Card */}
          <div className="rounded-2xl bg-slate-50/70 p-4 mt-3.5 border border-slate-100">
            <BookingStepper status={activeBookings[0].status} />
          </div>

          {/* Contextual Status Banner */}
          <div className="mt-3 rounded-xl bg-brand-50/70 px-3.5 py-2 text-xs font-semibold text-brand-900 flex items-center justify-between">
            <span>
              {activeBookings[0].status === "WORKER_ASSIGNED"
                ? "Worker assigned! Awaiting confirmation."
                : activeBookings[0].status === "ACCEPTED"
                ? "Worker accepted your request and is preparing to head over!"
                : activeBookings[0].status === "ON_THE_WAY"
                ? "Worker is on the way to your location!"
                : activeBookings[0].status === "ARRIVED"
                ? "Worker has arrived at your address!"
                : activeBookings[0].status === "SERVICE_STARTED"
                ? "Service is currently in progress."
                : "Finding the best nearby professional..."}
            </span>
            {activeBookings[0].eta && (
              <span className="font-bold flex items-center gap-1 text-brand-700">
                <Clock3 size={13} /> ~{activeBookings[0].eta} min
              </span>
            )}
          </div>

          {/* Assigned Worker & Actions */}
          <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-3">
              <div className="text-xs">
                <span className="text-slate-400">Assigned Professional:</span>
                <p className="font-bold text-slate-900 text-sm">
                  {activeBookings[0].workerId?.userId?.name || "Matching verified worker"}
                </p>
              </div>
              {activeBookings[0].workerId?.userId?.phone && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCallModalBooking(activeBookings[0])}
                    className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition shadow-2xs"
                    title="Call Worker (Masked Bridge)"
                  >
                    <Phone size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setChatModalBooking(activeBookings[0])}
                    className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 transition shadow-2xs"
                    title="Chat with Worker"
                  >
                    <MessageSquare size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Fare</span>
                <p className="text-sm font-black text-slate-900">₹{activeBookings[0].fare}</p>
              </div>
              <button
                onClick={() => nav(`/booking/${activeBookings[0]._id || activeBookings[0].id}/tracking`)}
                className="btn-primary flex items-center justify-center gap-1.5 bg-brand-600 px-4 py-2.5 text-xs font-black text-white hover:bg-brand-700 shadow-md shadow-brand-600/20"
              >
                <Navigation size={14} />
                Open Live Tracking & Map ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED BOOKING PENDING PAYMENT */}
      {completedPendingPayment.length > 0 && (
        <div className="mt-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50/90 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-black text-emerald-950 uppercase">
                  Service Completed
                </span>
                <p className="mt-0.5 text-sm font-black text-emerald-950">
                  Booking #{String(completedPendingPayment[0]._id || completedPendingPayment[0].id).slice(-6)} has been completed!
                </p>
                <p className="text-xs text-emerald-800">
                  Total Bill: <span className="font-black text-emerald-950">₹{completedPendingPayment[0].fare}</span> • Ready for payment
                </p>
              </div>
            </div>
            <button
              onClick={() => nav(`/booking/${completedPendingPayment[0]._id || completedPendingPayment[0].id}/payment`)}
              className="btn-primary shrink-0 bg-emerald-700 px-4 py-2 text-xs font-black text-white hover:bg-emerald-800 shadow-md shadow-emerald-700/20"
            >
              Pay Now ₹{completedPendingPayment[0].fare}
            </button>
          </div>
        </div>
      )}

      {busyBookings.length > 0 && (
        <div className="mt-4 rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800">
                <AlertCircle size={20} />
              </div>
              <div>
                <span className="inline-block rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-black text-amber-900 uppercase">
                  Worker is busy
                </span>
                <p className="mt-0.5 text-sm font-black text-amber-950">
                  Worker is busy for booking #{String(busyBookings[0]._id || busyBookings[0].id).slice(-6)}
                </p>
                <p className="text-xs text-amber-800">
                  The assigned worker is unavailable. Please choose another worker to proceed.
                </p>
              </div>
            </div>
            <button
              onClick={() => nav(`/booking/${busyBookings[0]._id || busyBookings[0].id}/tracking`)}
              className="btn-primary shrink-0 bg-amber-600 px-4 py-2 text-xs font-black text-white hover:bg-amber-700 shadow-md shadow-amber-600/20"
            >
              Change Worker
            </button>
          </div>
        </div>
      )}

      {extraChargeBookings.length > 0 && (
        <div className="mt-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50/90 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <Receipt size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-black text-emerald-950 uppercase">
                    Extra Charges Added
                  </span>
                  <span className="text-xs font-semibold text-emerald-800">
                    Booking #{String(extraChargeBookings[0]._id || extraChargeBookings[0].id).slice(-6)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm font-black text-emerald-950">
                  Worker added +₹{extraChargeBookings[0].extraCharges} extra charges
                </p>
                <p className="text-xs text-emerald-800">
                  Reason: <b>{extraChargeBookings[0].extraChargesReason || "Materials & extra labor"}</b>
                  {" "}• Total Bill: <span className="font-black text-emerald-950">₹{extraChargeBookings[0].fare}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => nav(`/booking/${extraChargeBookings[0]._id || extraChargeBookings[0].id}/tracking`)}
              className="btn-primary shrink-0 bg-emerald-700 px-4 py-2 text-xs font-black text-white hover:bg-emerald-800 shadow-md shadow-emerald-700/20"
            >
              View Bill & Track
            </button>
          </div>
        </div>
      )}

      <div className="card mt-4 divide-y divide-slate-100">
        {/* Saved Addresses */}
        <button
          onClick={() => setActiveModal("address")}
          className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-slate-50 active:scale-[0.99]"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-slate-600">
            <Home size={18} />
          </span>
          <span className="flex-1">
            <b className="block text-sm">{t("savedAddresses")}</b>
            <small className="text-xs text-slate-500">{currentLocation?.address || t("savedAddressesSub")}</small>
          </span>
          <ChevronRight size={17} className="text-slate-300" />
        </button>

        {/* Language Button */}
        <button
          onClick={() => setActiveModal("language")}
          className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-slate-50 active:scale-[0.99]"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Languages size={18} />
          </span>
          <span className="flex-1">
            <b className="block text-sm">{t("language")}</b>
            <small className="text-xs font-semibold text-brand-700">
              {language === "hi" ? "हिन्दी (Hindi)" : "English • हिन्दी"}
            </small>
          </span>
          <ChevronRight size={17} className="text-slate-300" />
        </button>

        {/* Payment Methods */}
        <button
          onClick={() => setActiveModal("payment")}
          className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-slate-50 active:scale-[0.99]"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-slate-600">
            <Wallet size={18} />
          </span>
          <span className="flex-1">
            <b className="block text-sm">{t("paymentMethods")}</b>
            <small className="text-xs text-slate-500">{t("paymentMethodsSub")}</small>
          </span>
          <ChevronRight size={17} className="text-slate-300" />
        </button>

        {/* Help & Support */}
        <button
          onClick={() => setActiveModal("support")}
          className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-slate-50 active:scale-[0.99]"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-slate-600">
            <Shield size={18} />
          </span>
          <span className="flex-1">
            <b className="block text-sm">{t("helpSupport")}</b>
            <small className="text-xs text-slate-500">{t("helpSupportSub")}</small>
          </span>
          <ChevronRight size={17} className="text-slate-300" />
        </button>
      </div>

      <button
        onClick={logout}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 active:scale-[0.99]"
      >
        <LogOut size={17} /> {t("logout")}
      </button>

      {/* Animated Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          >
            {/* Language Selection Modal */}
            {activeModal === "language" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Languages size={18} />
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900">{t("selectLanguage")}</h3>
                      <p className="text-xs text-slate-400">{t("chooseLanguage")}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {availableLanguages.map((item) => {
                    const isSelected = language === item.code;
                    return (
                      <button
                        key={item.code}
                        onClick={() => handleLanguageSelect(item.code)}
                        className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? "border-brand-500 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500/20"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold">{item.native}</span>
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">
                              {item.name}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                        </div>
                        {isSelected && (
                          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-white shadow-sm">
                            <Check size={16} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="btn-primary w-full text-sm"
                  >
                    {t("saveChanges")}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Saved Addresses Modal */}
            {activeModal === "address" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <MapPin size={18} />
                    </span>
                    <h3 className="font-bold text-slate-900">{t("savedAddresses")}</h3>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                    <X size={18} />
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4">
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">{t("primary")}</span>
                    <p className="mt-2 font-bold text-slate-800">{t("homeAddress")}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{currentLocation?.address || "Civil Lines, Ajmer, Rajasthan"}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="font-bold text-slate-800">{t("workAddress")}</p>
                    <p className="mt-0.5 text-sm text-slate-500">Vaishali Nagar, Ajmer, Rajasthan</p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="btn-primary mt-6 w-full text-sm">
                  {t("close")}
                </button>
              </motion.div>
            )}

            {/* Payment Methods Modal */}
            {activeModal === "payment" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <CreditCard size={18} />
                    </span>
                    <h3 className="font-bold text-slate-900">{t("paymentMethods")}</h3>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                    <X size={18} />
                  </button>
                </div>
                <div className="mt-4 space-y-2.5">
                  {[
                    { name: t("upiAutoPay"), sub: t("upiAutoPaySub"), active: true },
                    { name: t("creditDebitCards"), sub: t("cardsSub"), active: false },
                    { name: t("cashOnDelivery"), sub: t("cashOnDeliverySub"), active: true }
                  ].map((m) => (
                    <div key={m.name} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                      <div>
                        <p className="font-bold text-slate-800">{m.name}</p>
                        <p className="text-xs text-slate-500">{m.sub}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {m.active ? t("enabled") : t("availableStatus")}
                      </span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setActiveModal(null)} className="btn-primary mt-6 w-full text-sm">
                  {t("close")}
                </button>
              </motion.div>
            )}

            {/* Help & Support Modal */}
            {activeModal === "support" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Shield size={18} />
                    </span>
                    <h3 className="font-bold text-slate-900">{t("helpSupport")}</h3>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                    <X size={18} />
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 p-4">
                    <Phone size={20} className="text-brand-600" />
                    <div>
                      <p className="text-xs text-slate-500">{t("tollFreeHelpline")}</p>
                      <p className="text-sm font-bold text-slate-800">1800-123-KAAM (5226)</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t("supportDesc")}
                  </p>
                </div>
                <button onClick={() => setActiveModal(null)} className="btn-primary mt-6 w-full text-sm">
                  {t("close")}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call Modal */}
      {callModalBooking && (
        <CallModal
          name={callModalBooking.workerId?.userId?.name || "Service Partner"}
          phone={callModalBooking.workerId?.userId?.phone}
          bookingId={callModalBooking._id || callModalBooking.id}
          onClose={() => setCallModalBooking(null)}
        />
      )}

      {/* Chat Modal */}
      {chatModalBooking && (
        <ChatModal
          bookingId={chatModalBooking._id || chatModalBooking.id}
          workerName={chatModalBooking.workerId?.userId?.name || "Service Partner"}
          onClose={() => setChatModalBooking(null)}
        />
      )}
    </div>
  );
}