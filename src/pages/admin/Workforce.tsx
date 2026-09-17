import { useEffect, useState, useMemo } from "react";
import {
  Users,
  AlertTriangle,
  Radio,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Send,
  Sparkles,
  MapPin,
  CheckCircle2,
  BellRing
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import KpiCard from "../../components/dashboard/KpiCard";
import ServiceIcon from "../../components/common/ServiceIcon";
import { api } from "../../services/api";

export default function Workforce() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "critical" | "moderate" | "optimal">("ALL");
  const [areaFilter, setAreaFilter] = useState<string>("ALL");
  const [alertSentArea, setAlertSentArea] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    api
      .getAdminWorkforce()
      .then(setData)
      .catch((err) => console.error("Failed to load workforce data:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 6000);
    return () => clearInterval(timer);
  }, []);

  const recommendations = data?.recommendations || [];
  const skillDistribution = data?.skillDistribution || [];

  // Extract distinct areas for filter
  const areas = useMemo(() => {
    const set = new Set<string>();
    recommendations.forEach((r: any) => {
      if (r.area) set.add(r.area);
    });
    return Array.from(set);
  }, [recommendations]);

  // Filter recommendations
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((r: any) => {
      const matchesSearch =
        r.service?.toLowerCase().includes(search.toLowerCase()) ||
        r.area?.toLowerCase().includes(search.toLowerCase()) ||
        r.category?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || r.statusTone === statusFilter;
      const matchesArea = areaFilter === "ALL" || r.area === areaFilter;
      return matchesSearch && matchesStatus && matchesArea;
    });
  }, [recommendations, search, statusFilter, areaFilter]);

  // Calculate zone summary metrics
  const zoneSummaries = useMemo(() => {
    const map: Record<string, { totalReq: number; totalAvail: number; criticalCount: number }> = {};
    recommendations.forEach((r: any) => {
      if (!map[r.area]) {
        map[r.area] = { totalReq: 0, totalAvail: 0, criticalCount: 0 };
      }
      map[r.area].totalReq += r.required;
      map[r.area].totalAvail += r.available;
      if (r.statusTone === "critical") map[r.area].criticalCount += 1;
    });
    return Object.entries(map).map(([area, stats]) => {
      const fillRate = stats.totalReq > 0 ? Math.min(100, Math.round((stats.totalAvail / stats.totalReq) * 100)) : 100;
      return {
        area,
        totalReq: stats.totalReq,
        totalAvail: stats.totalAvail,
        fillRate,
        criticalCount: stats.criticalCount
      };
    });
  }, [recommendations]);

  const handleBroadcastAlert = (area: string, service: string) => {
    setAlertSentArea(`${area}-${service}`);
    setTimeout(() => {
      setAlertSentArea(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
            Capacity & Dispatch Intelligence
          </p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900">Workforce Recommendations</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Live Balancing
            </span>
          </div>
          <p className="muted mt-1 text-sm">
            Real-time technician distribution, capacity gaps, and predictive deployment across city zones.
          </p>
        </div>

        <button
          onClick={loadData}
          className="btn-secondary flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-brand-600" : ""} />
          Recalculate Balancing
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Online Technicians"
          value={`${data?.onlineWorkersCount || 0} / ${data?.totalWorkers || 0}`}
          icon={Users}
          trend={`${data?.coverageScore || 0}% active`}
        />
        <KpiCard
          label="Active Dispatches"
          value={String(data?.activeJobsCount || 0)}
          icon={Radio}
          trend="In-flight jobs"
        />
        <KpiCard
          label="Critical Capacity Gaps"
          value={String(data?.criticalGapsCount || 0)}
          icon={AlertTriangle}
          trend={data?.criticalGapsCount > 0 ? "Deficit Alert" : "Balanced"}
        />
        <KpiCard
          label="Verified Technicians"
          value={String(data?.verifiedWorkersCount || 0)}
          icon={ShieldCheck}
          trend="Coop Verified"
        />
      </div>

      {/* Visual Analytics Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Skill Availability Bar Chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Trade Availability & Online Supply</h2>
              <p className="text-xs text-slate-500">
                Registered workforce vs. currently active & on-duty technicians by trade.
              </p>
            </div>
            <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-xl">
              Live Presence
            </span>
          </div>

          <div className="mt-6 h-72 w-full">
            {skillDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="skill"
                    tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${value} technicians`,
                      name === "total" ? "Total Registered" : "Active Online"
                    ]}
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0" }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 12, fontSize: 12, fontWeight: 600 }}
                  />
                  <Bar dataKey="total" name="Total Registered" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="online" name="Active Online" fill="#16a85b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No skill distribution data available.
              </div>
            )}
          </div>
        </div>

        {/* Zone Readiness Cards */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">City Zone Fill Rates</h2>
              <p className="text-xs text-slate-500">Service SLA fulfillment rate by geographic zone.</p>
            </div>

            <div className="mt-4 space-y-4">
              {zoneSummaries.map((zone) => (
                <div key={zone.area} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin size={13} className="text-brand-600" />
                      {zone.area}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">{zone.fillRate}%</span>
                      {zone.criticalCount > 0 ? (
                        <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                          {zone.criticalCount} Deficits
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Optimal
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        zone.fillRate >= 80
                          ? "bg-emerald-500"
                          : zone.fillRate >= 50
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${zone.fillRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{zone.totalAvail} On-Duty</span>
                    <span>{zone.totalReq} Required</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-semibold">Average City Response Time:</span>
            <span className="font-black text-emerald-700">&lt; 14 Mins</span>
          </div>
        </div>
      </div>

      {/* Workforce Deployment & Dispatch Table */}
      <div className="card overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Zone Dispatch Deficits & Deployment Plan</h2>
              <p className="text-xs text-slate-500">
                Actionable supply-demand balance by territory and trade specialty.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {filteredRecommendations.length} Targets
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by trade, category, or city area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 text-xs w-full"
              />
            </div>

            {/* Area Filter */}
            <div className="flex items-center gap-1.5">
              <MapPin size={15} className="text-slate-400" />
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="input py-1.5 px-3 text-xs font-semibold text-slate-700"
              >
                <option value="ALL">All City Areas</option>
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
              {(["ALL", "critical", "moderate", "optimal"] as const).map((tone) => (
                <button
                  key={tone}
                  onClick={() => setStatusFilter(tone)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize transition ${
                    statusFilter === tone
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tone === "ALL" ? "All Levels" : tone}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-xs font-black uppercase text-slate-400">
                <th className="p-4">Trade & Category</th>
                <th>Operating Zone</th>
                <th className="text-center">Active Available</th>
                <th className="text-center">Required Target</th>
                <th className="text-center">Capacity Gap</th>
                <th>Actionable Recommendation</th>
                <th className="text-right p-4">Deployment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecommendations.length > 0 ? (
                filteredRecommendations.map((r: any) => {
                  const key = `${r.area}-${r.service}`;
                  const isSent = alertSentArea === key;

                  return (
                    <tr key={key} className="hover:bg-slate-50/60 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 shrink-0">
                            <ServiceIcon nameOrId={r.service} size={20} />
                          </span>
                          <div>
                            <p className="font-bold text-slate-900">{r.service}</p>
                            <p className="text-xs text-slate-400">{r.category || "Home Services"}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          <MapPin size={12} className="text-brand-600" />
                          {r.area}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="font-bold text-slate-800">
                          {r.available}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">on-duty</span>
                      </td>
                      <td className="text-center">
                        <span className="font-bold text-slate-800">
                          {r.required}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">target</span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wide ${
                            r.statusTone === "critical"
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : r.statusTone === "moderate"
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          }`}
                        >
                          {r.statusTone === "critical" && <AlertTriangle size={11} />}
                          {r.gap > 0 ? `-${r.gap} Deficit` : `+${Math.abs(r.gap)} Optimal`}
                        </span>
                      </td>
                      <td className="text-xs text-slate-600 font-medium max-w-xs pr-4">
                        {r.recommendation}
                      </td>
                      <td className="text-right p-4">
                        {r.gap > 0 ? (
                          <button
                            onClick={() => handleBroadcastAlert(r.area, r.service)}
                            disabled={isSent}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-xs ${
                              isSent
                                ? "bg-emerald-600 text-white cursor-default"
                                : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                            }`}
                          >
                            {isSent ? (
                              <>
                                <CheckCircle2 size={13} />
                                Broadcasted
                              </>
                            ) : (
                              <>
                                <BellRing size={13} />
                                Surge Ping
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                            <CheckCircle2 size={14} />
                            Covered
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    No workforce recommendations match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operational Dispatch Guidelines Card */}
      <div className="rounded-3xl border border-blue-200 bg-blue-50/70 p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-blue-950">
              Autonomous Cooperative Dispatch Protocols
            </h3>
            <p className="mt-1 text-xs text-blue-800 leading-relaxed max-w-4xl">
              When a zone reaches a <b>Critical Deficit</b>, the KarmiK routing engine automatically
              activates <b>Surge Shift Incentives (+15% cooperative dividend)</b> for verified off-duty
              technicians within a 7 km radius. If deficit persists over 20 minutes, jobs are dynamically
              routed with inter-zone priority to adjacent clusters with surplus availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}