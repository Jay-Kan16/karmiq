import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  CreditCard,
  FileCheck2,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  MessageSquareWarning,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  X
} from "lucide-react";
import { NavLink } from "react-router-dom";
import Logo from "../common/Logo";
import { useApp } from "../../context/AppContext";
import type { TranslationKey } from "../../data/translations";

interface NavItem {
  labelKey?: TranslationKey;
  rawLabel?: string;
  path: string;
  icon: any;
}

const customerNav: NavItem[] = [
  { labelKey: "navHome", path: "/customer", icon: LayoutDashboard },
  { labelKey: "navServices", path: "/customer/services", icon: BriefcaseBusiness },
  { labelKey: "navBookings", path: "/customer/bookings", icon: ClipboardList },
  { labelKey: "navPayments", path: "/customer/payments", icon: CreditCard },
  { labelKey: "profile", path: "/customer/profile", icon: UserRound },
  { labelKey: "notifications", path: "/customer/notifications", icon: MessageSquareWarning }
];

const workerNav: NavItem[] = [
  { rawLabel: "Dashboard", path: "/worker", icon: LayoutDashboard },
  { rawLabel: "Jobs", path: "/worker/jobs", icon: BriefcaseBusiness },
  { rawLabel: "Earnings", path: "/worker/earnings", icon: Wallet },
  { rawLabel: "Welfare", path: "/worker/welfare", icon: HeartPulse },
  { labelKey: "profile", path: "/worker/profile", icon: UserRound }
];

const adminNav: NavItem[] = [
  { rawLabel: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { rawLabel: "App Earnings", path: "/admin/earnings", icon: Wallet },
  { rawLabel: "Workers", path: "/admin/workers", icon: Users },
  { rawLabel: "Verification", path: "/admin/verification", icon: FileCheck2 },
  { rawLabel: "Bookings", path: "/admin/bookings", icon: ClipboardList },
  { rawLabel: "Customers", path: "/admin/customers", icon: Users },
  { rawLabel: "Complaints", path: "/admin/complaints", icon: MessageSquareWarning },
  { rawLabel: "Payments", path: "/admin/payments", icon: CreditCard },
  { rawLabel: "Welfare", path: "/admin/welfare", icon: ShieldCheck },
  { rawLabel: "Demand Forecast", path: "/admin/forecast", icon: TrendingUp },
  { rawLabel: "Workforce", path: "/admin/workforce", icon: BarChart3 }
];

export default function Sidebar({
  role,
  open,
  onClose
}: {
  role: "customer" | "worker" | "admin";
  open?: boolean;
  onClose?: () => void;
}) {
  const { logout, t } = useApp();
  const links = role === "customer" ? customerNav : role === "worker" ? workerNav : adminNav;
  const workspaceTitle =
    role === "customer"
      ? t("customerWorkspace")
      : role === "worker"
      ? t("workerWorkspace")
      : t("adminWorkspace");

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-100 bg-white p-4 transition-transform lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          {onClose && (
            <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden">
              <X size={18} />
            </button>
          )}
        </div>
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {workspaceTitle}
        </p>
        <nav className="space-y-1">
          {links.map(({ labelKey, rawLabel, path, icon: Icon }) => (
            <NavLink
              key={path}
              onClick={onClose}
              to={path}
              end={path === `/${role}`}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <Icon size={18} />
              {labelKey ? t(labelKey) : rawLabel}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-8 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          <LogOut size={18} /> {t("logout")}
        </button>
      </aside>
    </>
  );
}