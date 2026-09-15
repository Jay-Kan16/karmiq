import ServiceGrid from "../../components/service/ServiceGrid";
import { useApp } from "../../context/AppContext";

export default function Services() {
  const { t } = useApp();
  return (
    <div>
      <h1 className="section-title">{t("servicesTitle")}</h1>
      <p className="muted mt-2">{t("servicesSub")}</p>
      <div className="mt-7">
        <ServiceGrid />
      </div>
    </div>
  );
}