import { Bell, ChevronDown, MapPin, Menu, UserCircle, Languages } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Logo from "../common/Logo";
import NotificationPanel from "./NotificationPanel";
import { useApp } from "../../context/AppContext";

export default function Navbar({ onMenu }: { onMenu?: () => void }) {
  const { user, currentLocation, t, language, setLanguage } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3">
          {onMenu && <button onClick={onMenu} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" aria-label="Open menu"><Menu size={21}/></button>}
          <Logo />
        </div>
        {user?.role === "customer" && (
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <Link to="/customer" className="hover:text-brand-600">{t("navHome")}</Link>
            <Link to="/customer/services" className="hover:text-brand-600">{t("navServices")}</Link>
            <Link to="/customer/bookings" className="hover:text-brand-600">{t("navBookings")}</Link>
            <Link to="/customer/payments" className="hover:text-brand-600">{t("navPayments")}</Link>
          </nav>
        )}
        <div className="flex items-center gap-2">
          {/* Quick Language Switcher */}
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            title={language === "en" ? "Switch to Hindi (हिन्दी)" : "Switch to English"}
          >
            <Languages size={15} className="text-brand-600" />
            <span>{language === "en" ? "हिन्दी" : "English"}</span>
          </button>

          <button className="hidden items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:flex">
            <MapPin size={16} className="text-brand-600"/> {currentLocation?.address?.split(",")[0] || "Civil Lines"} <ChevronDown size={14}/>
          </button>
          <div className="relative">
            <button onClick={() => setOpen(!open)} className="relative rounded-xl p-2.5 hover:bg-slate-100" aria-label="Notifications">
              <Bell size={20}/>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"/>
            </button>
            <AnimatePresence>
              {open && <NotificationPanel onClose={() => setOpen(false)} />}
            </AnimatePresence>
          </div>
          <Link to={user?.role === "customer" ? "/customer/profile" : `/${user?.role}/profile`} className="hidden items-center gap-2 rounded-xl p-1.5 hover:bg-slate-50 sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-brand-700"><UserCircle size={21}/></span>
            <span className="max-w-24 truncate text-sm font-bold">{user?.name}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}