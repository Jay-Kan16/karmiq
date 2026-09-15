import { useApp } from "../../context/AppContext";

interface PaymentSummaryProps {
  fare: number;
  serviceName?: string;
  baseFare?: number;
  extraCharges?: number;
  extraChargesReason?: string;
}

export default function PaymentSummary({
  fare,
  serviceName,
  baseFare,
  extraCharges = 0,
  extraChargesReason
}: PaymentSummaryProps) {
  const { t, translateService } = useApp();
  const welfare = Math.round(fare * 0.06);
  const cooperative = Math.round(fare * 0.04);
  const displayService = serviceName ? translateService(serviceName) : t("service");
  const calculatedBase = baseFare || (extraCharges > 0 ? fare - extraCharges : fare);

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-100 p-5">
        <h3 className="font-bold">{t("paymentSummary")}</h3>
      </div>
      <div className="space-y-3 p-5 text-sm">
        <Row label={displayService} value={calculatedBase} />
        {extraCharges > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-amber-50 p-2.5 text-xs font-bold text-amber-900 border border-amber-200">
            <span>Extra Charges ({extraChargesReason || "Materials & parts"})</span>
            <span>+₹{extraCharges}</span>
          </div>
        )}
        <Row label={t("workerEarnings")} value={fare - welfare - cooperative} />
        <Row label={t("welfareContribution")} value={welfare} />
        <Row label={t("cooperativeFee")} value={cooperative} />
        <div className="my-2 border-t border-dashed border-slate-200" />
        <div className="flex items-center justify-between text-base font-extrabold">
          <span>{t("total")}</span>
          <span className="text-brand-600">₹{fare}</span>
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