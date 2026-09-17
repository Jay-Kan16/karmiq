import { useEffect, useState } from "react";
import { BadgeCheck, Banknote, Briefcase, Users, Wallet, ArrowRight, Percent } from "lucide-react";
import { Link } from "react-router-dom";
import KpiCard from "../../components/dashboard/KpiCard";
import { api } from "../../services/api";

export default function AdminDashboard() {
  const [a, setA] = useState<any>();

  useEffect(() => {
    api.getAdminAnalytics().then(setA).catch(() => {});
  }, []);

  if (!a) return <div className="card p-12 text-center text-slate-500 font-bold">Loading dashboard…</div>;

  const appEarnings = Math.round((a.revenue || 0) * 0.1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Cooperative command center</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Admin Dashboard</h1>
        </div>
        <Link
          to="/admin/earnings"
          className="btn-primary inline-flex items-center gap-2 bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700 shadow-sm"
        >
          <Wallet size={15} /> View App Earnings (10%) <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Total Workers" value={String(a.totalWorkers)} icon={Users} />
        <KpiCard label="Verified Workers" value={String(a.verifiedWorkers)} icon={BadgeCheck} />
        <KpiCard label="Active Workers" value={String(a.activeWorkers)} icon={Briefcase} />
        <KpiCard label="Today's Bookings" value={String(a.todaysBookings)} icon={Briefcase} />
        <KpiCard label="Total Gross Revenue" value={`₹${a.revenue}`} icon={Banknote} />
        <Link to="/admin/earnings" className="transition hover:scale-[1.01] block">
          <KpiCard
            label="App Earnings (10% Fee)"
            value={`₹${appEarnings}`}
            icon={Wallet}
            trend="10% cut"
          />
        </Link>
      </div>
    </div>
  );
}