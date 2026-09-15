import { useState } from "react";
import { X, PlusCircle, Receipt, IndianRupee, Sparkles, CheckCircle2 } from "lucide-react";
import { api } from "../../services/api";

interface AddExtraChargesModalProps {
  bookingId: string;
  customerName?: string;
  serviceName?: string;
  currentFare: number;
  currentExtra?: number;
  onClose: () => void;
  onSuccess: (updated: any) => void;
}

const PRESET_AMOUNTS = [50, 100, 150, 200, 300, 500];

const PRESET_REASONS = [
  "Spare parts & materials",
  "Extended work hours",
  "Additional pipe / wiring",
  "Heavy machinery cleaning",
  "Emergency urgent supply"
];

export default function AddExtraChargesModal({
  bookingId,
  customerName,
  serviceName,
  currentFare,
  currentExtra = 0,
  onClose,
  onSuccess
}: AddExtraChargesModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const numAmount = Number(amount) || 0;
  const newTotal = currentFare + numAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid extra charge amount greater than ₹0");
      return;
    }
    if (!reason.trim()) {
      setError("Please provide a brief reason for the extra charges");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const updated = await api.addExtraCharges(bookingId, numAmount, reason.trim());
      setSuccess(true);
      setTimeout(() => {
        onSuccess(updated);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Failed to add extra charges");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-brand-50 to-emerald-50/50 p-5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/30">
              <Receipt size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Add Extra Charges</h3>
              <p className="text-xs font-semibold text-slate-500">
                Booking #{String(bookingId).slice(-6)} {customerName ? `• ${customerName}` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-700 shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          {/* Current vs New Total preview */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Current Fare</span>
              <span className="font-bold text-slate-800">₹{currentFare}</span>
            </div>
            {currentExtra > 0 && (
              <div className="mt-1 flex items-center justify-between text-xs text-amber-700 font-semibold">
                <span>Existing Extra Charges</span>
                <span>+₹{currentExtra}</span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between text-xs text-emerald-700 font-semibold">
              <span>Adding Now</span>
              <span>+₹{numAmount}</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between border-t border-slate-200 pt-2 font-black text-slate-900">
              <span className="text-sm">New Total Customer Bill</span>
              <span className="text-lg text-brand-600">₹{newTotal}</span>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Extra Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                min="1"
                placeholder="e.g. 150"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="input pl-8 font-black text-lg text-slate-900 w-full"
                autoFocus
              />
            </div>

            {/* Presets */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRESET_AMOUNTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(String(p))}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    amount === String(p)
                      ? "bg-brand-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  +₹{p}
                </button>
              ))}
            </div>
          </div>

          {/* Reason input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Reason / Item Description
            </label>
            <input
              type="text"
              placeholder="e.g. Copper pipe replacement, 2m extra cable"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="input text-sm w-full"
            />

            {/* Quick Reason tags */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRESET_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                    reason === r
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Note: This extra charge will immediately appear in the customer's profile, active tracking screen, and final checkout bill.
          </p>

          {/* Action buttons */}
          <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary px-4 py-2 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !numAmount || !reason.trim()}
              className="btn-primary flex items-center justify-center gap-1.5 bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/25 disabled:opacity-50"
            >
              {success ? (
                <>
                  <CheckCircle2 size={15} /> Added Successfully!
                </>
              ) : loading ? (
                "Adding Charges…"
              ) : (
                <>
                  <PlusCircle size={15} /> Add ₹{numAmount || 0} to Customer Bill
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
