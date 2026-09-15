import type { BookingStatus } from "../../types";
import { useApp } from "../../context/AppContext";
import type { TranslationKey } from "../../data/translations";

const statusKeyMap: Partial<Record<BookingStatus, TranslationKey>> = {
  SEARCHING: "statusSearching",
  WORKER_ASSIGNED: "statusWorkerAssigned",
  ACCEPTED: "statusAccepted",
  ON_THE_WAY: "statusOnTheWay",
  ARRIVED: "statusArrived",
  SERVICE_STARTED: "statusServiceStarted",
  COMPLETED: "statusCompleted",
  PAYMENT: "statusPayment",
  RATING: "statusRating",
  CANCELLED: "statusCancelled"
};

export default function StatusBadge({ status }: { status: BookingStatus }) {
  const { t } = useApp();
  const tone = status === "COMPLETED" ? "bg-brand-50 text-brand-700" :
    status === "CANCELLED" ? "bg-red-50 text-red-700" :
    status === "SEARCHING" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{t(statusKeyMap[status] || "statusSearching")}</span>;
}