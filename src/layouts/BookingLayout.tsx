import { Outlet, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, Home } from "lucide-react";
import Logo from "../components/common/Logo";
import { useApp } from "../context/AppContext";

export default function BookingLayout() {
  const location = useLocation();
  const { language, setLanguage, user, t } = useApp();
  const homePath = user?.role === "worker" ? "/worker" : user?.role === "admin" ? "/admin" : "/customer";

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:scale-95"
              title="Toggle language / भाषा बदलें"
            >
              <Globe size={14} className="text-brand-600" />
              <span>{language === "hi" ? "English" : "हिन्दी"}</span>
            </button>
            <Link
              to={homePath}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-brand-600 active:scale-95"
              title={t("returnToMainPage")}
            >
              <Home size={15} />
              <span className="hidden sm:inline">{t("navHome")}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

