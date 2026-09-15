import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

export function BookingChart({ data }: { data: { day: string; bookings: number; revenue: number }[] }) {
  return <div className="card p-5"><div className="mb-4"><h3 className="font-bold">Booking Trend</h3><p className="text-xs text-slate-500">Last 7 days</p></div><div className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="day"/><YAxis/><Tooltip/><Line type="monotone" dataKey="bookings" stroke="#16a85b" strokeWidth={3} dot={{ r: 3 }}/></LineChart></ResponsiveContainer></div></div>;
}

export function DemandChart({ data }: { data: { name: string; value: number }[] }) {
  return <div className="card p-5"><div className="mb-4"><h3 className="font-bold">Service Demand</h3><p className="text-xs text-slate-500">Predicted demand by service</p></div><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number"/><YAxis dataKey="name" type="category" width={80}/><Tooltip/><Bar dataKey="value" fill="#16a85b" radius={[0, 7, 7, 0]}/></BarChart></ResponsiveContainer></div></div>;
}