import { Check, MapPin, Navigation, Pencil, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";

interface LocationSelectorProps {
  value?: string;
  onChange?: (value: string, coords?: { lat: number; lng: number }) => void;
}

export default function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const { currentLocation, setCurrentLocation, t } = useApp();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value || currentLocation?.address || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value && value !== text && !editing) {
      setText(value);
    }
  }, [value]);

  const save = () => {
    setEditing(false);
    onChange?.(text);
    setCurrentLocation({
      address: text,
      lat: currentLocation?.lat ?? 0,
      lng: currentLocation?.lng ?? 0,
    });
  };

  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let formattedAddress = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: { "Accept-Language": "en" },
              signal: controller.signal,
            }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const place =
              addr.suburb ||
              addr.neighbourhood ||
              addr.residential ||
              addr.road ||
              addr.village ||
              "";
            const city =
              addr.city ||
              addr.town ||
              addr.state_district ||
              addr.county ||
              "";
            const state = addr.state || "";

            const parts = [place, city, state].filter(Boolean);
            if (parts.length > 0) {
              formattedAddress = parts.join(", ");
            } else if (data.display_name) {
              formattedAddress = data.display_name.split(",").slice(0, 3).join(", ");
            }
          }
        } catch {
          // If reverse geocoding is blocked or offline, use coordinates label
        }

        setText(formattedAddress);
        setEditing(false);
        setCurrentLocation({
          address: formattedAddress,
          lat: latitude,
          lng: longitude,
        });
        onChange?.(formattedAddress, { lat: latitude, lng: longitude });
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location access was denied. Please allow location permissions in your browser address bar.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information is unavailable. Please enter your location manually.");
            break;
          case err.TIMEOUT:
            setError("Location request timed out. Please try again or enter manually.");
            break;
          default:
            setError("Could not retrieve your location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <MapPin size={21} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t("currentLocation")}</p>
          {editing ? (
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
              }}
              className="input mt-1 py-2 text-sm"
              placeholder="Enter your location"
            />
          ) : (
            <p className="truncate font-bold text-slate-900">{text}</p>
          )}
        </div>
        <button
          onClick={() => (editing ? save() : setEditing(true))}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label={editing ? "Save location" : "Change location"}
        >
          {editing ? <Check size={18} /> : <Pencil size={17} />}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={loading}
          className="flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin text-brand-600" />
              <span>{t("requestingLocation")}</span>
            </>
          ) : (
            <>
              <Navigation size={15} />
              <span>{t("useCurrentLocation")}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-red-50 p-2.5 text-xs font-medium text-red-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}