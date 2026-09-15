import { CalendarDays, Home, UserRound, Wrench } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";

export default function BottomNavigation() {
  const location = useLocation();
  const { t } = useApp();

  const items = [
    { label: t("navHome"), icon: Home, path: "/customer" },
    { label: t("navServices"), icon: Wrench, path: "/customer/services" },
    { label: t("navBookings"), icon: CalendarDays, path: "/customer/bookings" },
    { label: t("profile"), icon: UserRound, path: "/customer/profile" }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 border-t border-slate-100 bg-white px-2 py-2 md:hidden">
      {items.map(({ label, icon: Icon, path }) => {
        const active = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold ${
              active ? "text-brand-600" : "text-slate-400"
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}