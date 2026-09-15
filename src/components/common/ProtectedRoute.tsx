import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import type { Role } from "../../types";

export default function ProtectedRoute({ role }: { role?: Role }) {
  const { user, isInitializing } = useApp();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <p className="text-xs font-bold text-slate-500">Restoring session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <Outlet />;
}