import { useEffect, useState, useMemo } from "react";
import {
  Wallet,
  Banknote,
  TrendingUp,
  CheckCircle2,
  Users,
  Briefcase,
  Calendar,
  ArrowUpRight,
  Download,
  Search,
  Percent,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import KpiCard from "../../components/dashboard/KpiCard";
import { api } from "../../services/api";

export default function AdminEarnings() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = () => {
    setLoading(true);
    api
      .getAdminEarnings()
      .then((res: any) => setData(res))
      .catch((err) => console.error("Failed to load admin earnings:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredList = useMemo(() => {
    if (!data?.earningsList) return [];
    if (!search.trim()) return data.earningsList;
    const s = search.toLowerCase();
    return data.earningsList.filter(
      (item: any) =>
        item.bookingId?.toLowerCase().includes(s) ||
        item.serviceName?.toLowerCase().includes(s) ||
        item.customerName?.toLowerCase().includes(s) ||
        item.workerName?.toLowerCase().includes(s)
    );
  }, [data, search]);

  // Generate chart data from earnings list grouped by date
  const chartData = useMemo(() => {
    if (!data?.earningsList?.length) {
      return [
        { date: "Day 1", earnings: 0, gmv: 0 },
        { date: "Day 2", earnings: 0, gmv: 0 },
        { date: "Day 3", earnings: 0, gmv: 0 },
        { date: "Day 4", earnings: 0, gmv: 0 },
        { date: "Today", earnings: data?.todayAppEarnings || 0, gmv: data?.todayGrossRevenue || 0 }
      ];
    }
    const grouped: Record<string, { earnings: number; gmv: number }> = {};
    [...data.earningsList].reverse().forEach((item: any) => {
      const d = new Date(item.completedAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric"
      });
      if (!grouped[d]) grouped[d] = { earnings: 0, gmv: 0 };
      grouped[d].earnings += item.appEarning || 0;
      grouped[d].gmv += item.grossFare || 0;
    });
    return Object.entries(grouped).map(([date, val]) => ({
      date,
      earnings: val.earnings,
      gmv: val.gmv
    }));
  }, [data]);

  const handleExportCSV = () => {
    if (!data?.earningsList?.length) return;
    const headers = [
      "Booking ID",
      "Service",
      "Customer",
      "Worker",
      "Gross Fare (INR)",
      "App Commission Rate (%)",
      "App Earnings (INR)",
      "Worker Payout (INR)",
      "Payment Status",
      "Completed At"
    ];
    const rows = data.earningsList.map((item: any) => [
      item.bookingId,
      `"${item.serviceName}"`,
      `"${item.customerName}"`,
      `"${item.workerName}"`,
      item.grossFare,
      "10%",
      item.appEarning,
      item.workerPayout,
      item.paymentStatus,
      `"${new Date(item.completedAt).toLocaleString("en-IN")}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `karmik-app-earnings-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
            Platform Revenue & Commission
          </p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900">App Earnings</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-black text-brand-800">
              <Percent size={13} /> 10% App Fee
            </span>
          </div>
          <p className="muted mt-1 text-sm">
            Automatic 10% commission on every completed service booking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="btn-secondary flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            title="Refresh earnings"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-brand-600" : ""} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            disabled={!data?.earningsList?.length}
            className="btn-primary flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Total App Earnings"
          value={`₹${data?.totalAppEarnings?.toLocaleString("en-IN") || 0}`}
          icon={Wallet}
          trend="10% cut"
        />
        <KpiCard
          label="Gross Platform GMV"
          value={`₹${data?.totalGrossRevenue?.toLocaleString("en-IN") || 0}`}
          icon={Banknote}
        />
        <KpiCard
          label="Worker Payouts (90%)"
          value={`₹${data?.totalWorkerPayouts?.toLocaleString("en-IN") || 0}`}
          icon={Users}
        />
        <KpiCard
          label="Today's App Revenue"
          value={`₹${data?.todayAppEarnings?.toLocaleString("en-IN") || 0}`}
          icon={ArrowUpRight}
        />
        <KpiCard
          label="This Month Revenue"
          value={`₹${data?.monthAppEarnings?.toLocaleString("en-IN") || 0}`}
          icon={TrendingUp}
        />
        <KpiCard
          label="Completed Services"
          value={String(data?.totalCompletedJobs || 0)}
          icon={CheckCircle2}
        />
      </div>

      {/* Commission Model Policy Box */}
      <div className="rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-50/80 via-white to-emerald-50/70 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/30">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">
                  Transparent 10 / 90 Cooperative Revenue Model
                </h2>
                <span className="rounded-full bg-brand-200/70 px-2.5 py-0.5 text-[10px] font-bold text-brand-900 uppercase">
                  Policy Active
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-3xl">
                On every completed booking, KarmiK retains <b>10% as the platform fee</b> to maintain
                cloud infrastructure, server hosting, telephone masking sessions, and verified matching.
                The remaining <b>90% is directly allocated to the service technician</b>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 rounded-2xl bg-white border border-brand-100 p-3 shadow-2xs">
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">App Commission</span>
              <p className="text-lg font-black text-brand-700">10%</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Worker Share</span>
              <p className="text-lg font-black text-emerald-700">90%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Earnings Revenue Trend</h2>
            <p className="text-xs text-slate-500">10% App Commission vs Total Gross Volume (GMV)</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-brand-700">
              <span className="h-3 w-3 rounded-full bg-brand-500" />
              App Commission (10%)
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="h-3 w-3 rounded-full bg-slate-300" />
              Gross Volume (GMV)
            </span>
          </div>
        </div>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a85b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#16a85b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                formatter={(value: any, name: any) => [
                  `₹${Number(value).toLocaleString("en-IN")}`,
                  name === "earnings" ? "10% App Earnings" : "Gross Volume"
                ]}
                contentStyle={{ backgroundColor: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0" }}
              />
              <Area
                type="monotone"
                dataKey="gmv"
                stroke="#94a3b8"
                fillOpacity={1}
                fill="url(#colorGmv)"
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="#16a85b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorEarnings)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Granular Breakdown Table */}
      <div className="card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900">Completed Service Earnings Breakdown</h2>
            <p className="text-xs text-slate-500">
              Each completed service yields 10% platform fee and 90% professional net payout.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer, worker, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-xs py-2 w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-xs font-black uppercase text-slate-400">
                <th className="p-4">Booking ID</th>
                <th>Service</th>
                <th>Customer</th>
                <th>Assigned Professional</th>
                <th className="text-right">Total Fare</th>
                <th className="text-right">App Earning (10%)</th>
                <th className="text-right">Worker Payout (90%)</th>
                <th>Completed At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length > 0 ? (
                filteredList.map((b: any) => (
                  <tr key={b.bookingId} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-mono text-xs font-bold text-slate-600">
                      #{String(b.bookingId).slice(-6)}
                    </td>
                    <td className="font-bold text-slate-900">{b.serviceName}</td>
                    <td className="text-xs">
                      <p className="font-bold text-slate-800">{b.customerName}</p>
                      {b.customerPhone && <p className="text-slate-400">{b.customerPhone}</p>}
                    </td>
                    <td className="text-xs">
                      <p className="font-bold text-slate-800">{b.workerName}</p>
                      {b.workerPhone && <p className="text-slate-400">{b.workerPhone}</p>}
                    </td>
                    <td className="text-right font-black text-slate-900">
                      ₹{b.grossFare}
                    </td>
                    <td className="text-right font-black text-emerald-700 bg-emerald-50/40 px-3">
                      +₹{b.appEarning}
                      <span className="block text-[10px] font-semibold text-emerald-600">10% cut</span>
                    </td>
                    <td className="text-right font-semibold text-slate-600">
                      ₹{b.workerPayout}
                      <span className="block text-[10px] text-slate-400">90% net</span>
                    </td>
                    <td className="text-xs text-slate-500">
                      {new Date(b.completedAt).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short"
                      })}
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 size={12} /> Completed
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    <Briefcase size={28} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-700">No completed service earnings found.</p>
                    <p className="text-xs mt-1">
                      Earnings will automatically populate here as technicians complete service bookings.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
