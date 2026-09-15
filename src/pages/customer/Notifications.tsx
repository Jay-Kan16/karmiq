import NotificationPanel from "../../components/navbar/NotificationPanel";
import { useApp } from "../../context/AppContext";

export default function Notifications() {
  const { t } = useApp();
  return (
    <div className="max-w-2xl">
      <h1 className="section-title">{t("notifications")}</h1>
      <p className="muted mt-2">{t("notificationsSub")}</p>
      <div className="mt-6">
        <NotificationPanel onClose={() => undefined} />
      </div>
    </div>
  );
}