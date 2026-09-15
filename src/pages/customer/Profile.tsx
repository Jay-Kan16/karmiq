import { Check, ChevronRight, Home, Languages, LogOut, MapPin, Shield, Wallet, X, Phone, CreditCard } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "../../context/AppContext";
import type { LanguageCode } from "../../data/translations";

export default function Profile() {
  const { user, logout, language, setLanguage, currentLocation, t } = useApp();
  const [activeModal, setActiveModal] = useState<"address" | "language" | "payment" | "support" | null>(null);

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
    </div>
  );
}