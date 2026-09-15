import { useApp } from "../../context/AppContext";

export default function PaymentSummary({ fare, serviceName }: { fare: number; serviceName?: string }) {
  const { t, translateService } = useApp();
  const welfare = Math.round(fare * 0.06);
  const cooperative = Math.round(fare * 0.04);
  const displayService = serviceName ? translateService(serviceName) : t("service");

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-100 p-5">
        <h3 className="font-bold">{t("paymentSummary")}</h3>
      </div>
      <div className="space-y-3 p-5 text-sm">
        <Row label={displayService} value={fare} />
        <Row label={t("workerEarnings")} value={fare - welfare - cooperative} />
        <Row label={t("welfareContribution")} value={welfare} />
        <Row label={t("cooperativeFee")} value={cooperative} />
        <div className="my-2 border-t border-dashed border-slate-200" />
        <div className="flex items-center justify-between text-base font-extrabold">
          <span>{t("total")}</span>
          <span>₹{fare}</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-slate-500">
      <span>{label}</span>
      <span className="font-semibold text-slate-800">₹{value}</span>
    </div>
  );
}