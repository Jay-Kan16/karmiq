import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, X, Sparkles } from "lucide-react";
import Navbar from "../components/navbar/Navbar";
import BottomNavigation from "../components/bottom-navigation/BottomNavigation";
import Sidebar from "../components/sidebar/Sidebar";
import CustomerScheduledModal from "../components/booking/CustomerScheduledModal";
import { api } from "../services/api";

export default function CustomerLayout() {
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const [upcomingScheduled, setUpcomingScheduled] = useState<any | null>(null);
  const [selectedModalBooking, setSelectedModalBooking] = useState<any | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    let active = true;

    const checkScheduled = async () => {
      try {
        const bookings = await api.getBookings();
        if (!active || !Array.isArray(bookings)) return;

        // Find any active scheduled booking
        const scheduled = bookings.find((b: any) => b.status === "SCHEDULED");
        if (scheduled) {
          setUpcomingScheduled(scheduled);
        } else {
          setUpcomingScheduled(null);
        }
      } catch (_) {}
    };

    checkScheduled();
    const interval = setInterval(checkScheduled, 8000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar role="customer" open={menu} onClose={() => setMenu(false)} />
      <div className="min-w-0 flex-1 flex flex-col">
        <Navbar onMenu={() => setMenu(true)} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 md:px-6 lg:py-8">
          {/* Upcoming Scheduled Booking Banner */}
          {upcomingScheduled && !bannerDismissed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-200/90 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50/30 p-3.5 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-600 text-white shadow-xs">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-purple-700">
                      <Sparkles size={10} /> Confirmed Reservation
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {upcomingScheduled.serviceId?.name || "Home Service"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-bold text-purple-900">
                    Slot: {upcomingScheduled.scheduledDate} • {upcomingScheduled.scheduledTime || "Scheduled Window"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedModalBooking(upcomingScheduled)}
                  className="rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-black text-white hover:bg-purple-700 shadow-sm transition active:scale-95"
                >
                  View Reservation
                </button>
                <button
                  onClick={() => setBannerDismissed(true)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-100/50 hover:text-slate-600 transition"
                  title="Dismiss reminder"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Popup Modal for Scheduled Booking */}
          {selectedModalBooking && (
            <CustomerScheduledModal
              isOpen={Boolean(selectedModalBooking)}
              onClose={() => setSelectedModalBooking(null)}
              booking={selectedModalBooking}
            />
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.995 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
}