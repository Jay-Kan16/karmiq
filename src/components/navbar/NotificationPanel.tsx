import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, X, Bell, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";

export default function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { t, user } = useApp();
  const nav = useNavigate();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    api.getNotifications().then(setData).catch(() => {});
  }, []);

  const handleClick = (n: any) => {
    if (n.id || n._id) {
      api.readNotification(n.id || n._id).catch(() => {});
    }
    onClose();
    if (n.bookingId) {
      const bId = typeof n.bookingId === "object" ? (n.bookingId._id || n.bookingId.id) : n.bookingId;
      if (user?.role === "worker") {
        nav(`/worker/jobs/${bId}`);
      } else if (user?.role === "customer") {
        nav(`/booking/${bId}/tracking`);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute right-0 top-12 z-50 w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-4">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-brand-600" />
          <h3 className="font-bold text-slate-900">{t("notifications")}</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
        >
          <X size={17} />
        </button>
      </div>

      <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
        {data.length ? (
          data.map((n) => (
            <div
              key={n._id || n.id}
              onClick={() => handleClick(n)}
              className="group flex cursor-pointer gap-3 p-4 transition hover:bg-slate-50"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-brand-600 group-hover:bg-brand-50 group-hover:text-brand-700">
                {n.type === "payment" ? <CreditCard size={17} /> : <CheckCircle2 size={17} />}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">{n.title}</p>
                  <ExternalLink size={12} className="text-slate-300 opacity-0 group-hover:opacity-100" />
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{n.message}</p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">
            No notifications yet.
          </div>
        )}
      </div>
    </motion.div>
  );
}
