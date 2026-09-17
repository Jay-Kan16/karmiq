import { useEffect, useState } from "react";
import {
  TrendingUp,
  Flame,
  Clock3,
  Users,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  ShieldAlert,
  BarChart3
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

export default function Forecast() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    api
      .getAdminForecast()
      .then(setData)
      .catch((err) => console.error("Failed to load forecast data:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 6000);
    return () => clearInterval(timer);
  }, []);

  const forecastList = data?.forecastList || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
            Predictive Intelligence
          </p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900">Demand Forecast</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Live Predictions
            </span>
          </div>
          <p className="muted mt-1 text-sm">
            AI-weighted demand projections by service category, historical velocity, and peak hours.
          </p>
        </div>

        <button
          onClick={loadData}
          className="btn-secondary flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-brand-600" : ""} />
          Recalculate Projections
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Top Growth Category"
          value={data?.topGrowthService || "Electrician"}
          icon={Flame}
          trend="+35% demand"
        />
        <KpiCard
          label="Projected 7-Day Bookings"
          value={String(data?.totalPredictedDemand || 0)}
          icon={TrendingUp}
          trend={`+${data?.overallProjectedGrowth || 28}%`}
        />
        <KpiCard
          label="Peak Service Window"
          value="4 PM - 8 PM"
          icon={Clock3}
        />
        <KpiCard
          label="High Pressure Trades"
          value={String(data?.highDemandCount || 0)}
          icon={AlertTriangle}
          trend="Surge alert"
        />
      </div>

      {/* Predictive Comparison Chart */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Current Velocity vs. 7-Day Projected Demand</h2>
            <p className="text-xs text-slate-500">Comparing active demand volume with projected upcoming requests.</p>
          </div>
          <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-xl">
            Auto-adjusted for emergency spikes
          </span>
        </div>

        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecastList} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="service"
                tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${value} requests`,
                  name === "current" ? "Current Bookings" : "Predicted Demand"
                ]}
                contentStyle={{ backgroundColor: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0" }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12, fontWeight: 600 }}
              />
              <Bar dataKey="current" name="Current Bookings" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="predicted" name="Projected 7-Day Demand" fill="#16a85b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Demand Pressure Breakdown Matrix */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Trade Demand Pressure & Capacity Matrix</h2>
            <p className="text-xs text-slate-500">Real-time demand heat classification and technician staffing recommendations.</p>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {forecastList.length} Categories Monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-xs font-black uppercase text-slate-400">
                <th className="p-4">Service Category</th>
                <th className="text-center">Current Demand</th>
                <th className="text-center">7-Day Projected</th>
                <th className="text-center">Growth Velocity</th>
                <th className="text-center">Pressure Level</th>
                <th>Peak Windows</th>
                <th className="text-right p-4">Required On-Duty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forecastList.length > 0 ? (
                forecastList.map((item: any) => (
                  <tr key={item.service} className="hover:bg-slate-50/60 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 shrink-0">
                          <ServiceIcon nameOrId={item.service} size={20} />
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{item.service}</p>
                          <p className="text-xs text-slate-400">{item.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center font-bold text-slate-700">
                      {item.current} jobs
                    </td>
                    <td className="text-center font-black text-slate-900">
                      {item.predicted} jobs
                    </td>
                    <td className="text-center">
                      <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <ArrowUpRight size={12} />
                        +{item.growthPercent}%
                      </span>
                    </td>
                    <td className="text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wide ${
                          item.level === "HIGH"
                            ? "bg-rose-100 text-rose-800 border border-rose-300"
                            : item.level === "MEDIUM"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.level === "HIGH" && <Flame size={12} />}
                        {item.level}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500 font-medium">
                      {item.peakHours}
                    </td>
                    <td className="text-right p-4 font-black text-slate-900">
                      {item.recommendedTechnicians} Technicians
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    No forecast data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operational Action Plan Banner */}
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-emerald-950">
              Operational Staffing Recommendations
            </h3>
            <p className="mt-1 text-xs text-emerald-800 leading-relaxed max-w-4xl">
              Demand for <b>Electrician</b> and <b>Plumber</b> services is trending at peak volume
              due to seasonal weather patterns. We recommend keeping verified electricians and plumbers
              online during the 4:00 PM – 8:00 PM peak slot to preserve under 15-minute dispatch SLAs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}