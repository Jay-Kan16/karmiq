import { Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ScrollToTop from "./components/common/ScrollToTop";
import CustomerLayout from "./layouts/CustomerLayout";
import WorkerLayout from "./layouts/WorkerLayout";
import AdminLayout from "./layouts/AdminLayout";
import BookingLayout from "./layouts/BookingLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CustomerHome from "./pages/customer/Home";
import Services from "./pages/customer/Services";
import Bookings from "./pages/customer/Bookings";
import Payments from "./pages/customer/Payments";
import Profile from "./pages/customer/Profile";
import Notifications from "./pages/customer/Notifications";
import NewBooking from "./pages/booking/NewBooking";
import BookingDetails from "./pages/booking/BookingDetails";
import Tracking from "./pages/booking/Tracking";
import Payment from "./pages/booking/Payment";
import Rating from "./pages/booking/Rating";
import WorkerDashboard from "./pages/worker/Dashboard";
import WorkerJobs from "./pages/worker/Jobs";
import ActiveJob from "./pages/worker/ActiveJob";
import Earnings from "./pages/worker/Earnings";
import Welfare from "./pages/worker/Welfare";
import WorkerProfile from "./pages/worker/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminEarnings from "./pages/admin/Earnings";
import AdminWorkers from "./pages/admin/Workers";
import Verification from "./pages/admin/Verification";
import AdminBookings from "./pages/admin/Bookings";
import Customers from "./pages/admin/Customers";
import Complaints from "./pages/admin/Complaints";
import AdminPayments from "./pages/admin/Payments";
import AdminWelfare from "./pages/admin/Welfare";
import Forecast from "./pages/admin/Forecast";
import Workforce from "./pages/admin/Workforce";

import { useApp } from "./context/AppContext";

function RootRedirect() {
  const { user, isInitializing } = useApp();
  if (isInitializing) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

export default function App() {
  return (
    <AppProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Workspace */}
        <Route element={<ProtectedRoute role="customer" />}>
          <Route element={<CustomerLayout />}>
            <Route path="/customer" element={<CustomerHome />} />
            <Route path="/customer/services" element={<Services />} />
            <Route path="/customer/bookings" element={<Bookings />} />
            <Route path="/customer/payments" element={<Payments />} />
            <Route path="/customer/profile" element={<Profile />} />
            <Route path="/customer/notifications" element={<Notifications />} />
          </Route>
        </Route>

        {/* Worker Workspace */}
        <Route element={<ProtectedRoute role="worker" />}>
          <Route element={<WorkerLayout />}>
            <Route path="/worker" element={<WorkerDashboard />} />
            <Route path="/worker/jobs" element={<WorkerJobs />} />
            <Route path="/worker/jobs/active" element={<ActiveJob />} />
            <Route path="/worker/jobs/:id" element={<ActiveJob />} />
            <Route path="/worker/earnings" element={<Earnings />} />
            <Route path="/worker/welfare" element={<Welfare />} />
            <Route path="/worker/profile" element={<WorkerProfile />} />
          </Route>
        </Route>

        {/* Admin Workspace */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/earnings" element={<AdminEarnings />} />
            <Route path="/admin/workers" element={<AdminWorkers />} />
            <Route path="/admin/verification" element={<Verification />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/customers" element={<Customers />} />
            <Route path="/admin/complaints" element={<Complaints />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/welfare" element={<AdminWelfare />} />
            <Route path="/admin/forecast" element={<Forecast />} />
            <Route path="/admin/workforce" element={<Workforce />} />
          </Route>
        </Route>

        {/* Booking Workflows (Accessible to customer, assigned worker & admin) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<BookingLayout />}>
            <Route path="/booking/new" element={<NewBooking />} />
            <Route path="/booking/:id" element={<BookingDetails />} />
            <Route path="/booking/:id/tracking" element={<Tracking />} />
            <Route path="/booking/:id/payment" element={<Payment />} />
            <Route path="/booking/:id/rating" element={<Rating />} />
          </Route>
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </AppProvider>
  );
}