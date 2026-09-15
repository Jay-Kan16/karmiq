import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";

export default function WorkerLayout() {
  const [menu, setMenu] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar role="worker" open={menu} onClose={() => setMenu(false)} />
      <div className="min-w-0 flex-1 flex flex-col">
        <Navbar onMenu={() => setMenu(true)} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6 lg:py-8">
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
    </div>
  );
}