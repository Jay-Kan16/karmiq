import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, MapPin, Radio, Siren, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LocationSelector from "../../components/location/LocationSelector";
import ServiceIcon from "../../components/common/ServiceIcon";
import WorkerRadarScanner, { type NearbyWorker } from "../../components/booking/WorkerRadarScanner";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";
import type { Service, Booking } from "../../types";

export default function NewBooking() {
  const nav = useNavigate();
  const qs = new URLSearchParams(useLocation().search);
  const serviceParam = qs.get("service");
  const emergency = qs.get("emergency") === "true";
  const {
    selectedService,
    setSelectedService,
    currentLocation,
    setCurrentLocation,
    t,
    translateService,
    setBooking,
    setMatchedWorker
  } = useApp();

  const [services, setServices] = useState<Service[]>([]);
  const [step, setStep] = useState(serviceParam ? 2 : 1);
  const [location, setLocation] = useState(currentLocation.address);
  const [coords, setCoords] = useState({ lat: currentLocation.lat, lng: currentLocation.lng });
  const [when, setWhen] = useState<"now" | "schedule">("now");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [nearbyWorkers, setNearbyWorkers] = useState<NearbyWorker[]>([]);
  const [radarLoading, setRadarLoading] = useState(false);

  useEffect(() => {
    api.getServices().then((list) => {
      setServices(list);
      if (serviceParam) {
        const found = list.find(
          (s) => s.id === serviceParam || s.name.toLowerCase() === serviceParam.toLowerCase()
        );
        if (found) {
          setSelectedService(found);
          setStep(2);
          return;
        }
      }
      if (!selectedService) {
        setSelectedService(list.find((s) => !emergency || s.emergency) || list[0] || null);
      }
    });
  }, [serviceParam]);

  const service = selectedService || services.find((s) => !emergency || s.emergency);

  if (!service) {
    return <div className="card p-8 text-center">Loading services…</div>;
  }

  const startRadarScan = async () => {
    if (!coords.lat || !coords.lng) {
      setError("Please select your location first.");
      return;
    }
    setError("");
    setStep(4);
    setRadarLoading(true);
    try {
      const list = await api.getNearbyWorkers(service.name, coords.lat, coords.lng);
      setNearbyWorkers((list || []).filter((w: any) => w.availability === "online"));
    } catch (e) {
      console.error("Failed to load nearby workers", e);
      setNearbyWorkers([]);
    } finally {
      setRadarLoading(false);
    }
  };

  const submit = async (workerId?: string) => {
    if (!coords.lat || !coords.lng) {
      return setError("Please select your location.");
    }
    setLoading(true);
    setError("");
    try {
      const b = await api.createBooking({
        serviceId: service.id,
        location: { lat: coords.lat, lng: coords.lng, address: location },
        scheduledDate: when === "schedule" ? date : undefined,
        scheduledTime: when === "schedule" ? time : undefined,
        emergency,
        description,
        workerId: workerId || undefined
      });
      setBooking(b);
      if (b.workerId) {
        setMatchedWorker(b.workerId as any);
      } else {
        setMatchedWorker(null);
      }
      setCurrentLocation({ address: location, lat: coords.lat, lng: coords.lng });
      nav(`/booking/${b.id}/tracking`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => {
          if (step === 2 && serviceParam) {
            nav(-1);
          } else if (step > 1) {
            setStep(step - 1);
          } else {
            nav(-1);
          }
        }}
        className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} />
        {t("back")}
      </button>

      {step < 4 && (
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
              {emergency ? t("emergencyHelp") : t("quickBooking")}
            </p>
            <h1 className="mt-1 text-3xl font-black">
              {t("bookA")} {translateService(service.name)}
            </h1>
          </div>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-600 shadow-xs hover:border-brand-300 hover:bg-brand-50 transition"
            >
              Change Service
            </button>
          )}
        </div>
      )}

      {/* Step 1: Service Selection */}
      {step === 1 && (
        <div className="card p-5">
          {emergency && (
            <div className="mb-5 rounded-2xl bg-red-50 p-4 text-red-800">
              <Siren className="mr-2 inline" />
              Priority emergency matching
            </div>
          )}
          <h2 className="text-xl font-bold">Choose service</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {services
              .filter((s) => !emergency || s.emergency)
              .map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedService(s);
                    setStep(2);
                  }}
                  className={`rounded-2xl border p-4 text-left transition hover:border-brand-400 hover:shadow-xs ${
                    service.id === s.id ? "border-brand-500 bg-brand-50" : "border-slate-200"
                  }`}
                >
                  <ServiceIcon nameOrId={s.name || s.id} size={30} />
                  <p className="mt-2 font-bold">{translateService(s.name)}</p>
                  <p className="text-xs text-slate-500">From ₹{s.startingPrice}</p>
                </button>
              ))}
          </div>
          <button onClick={() => setStep(2)} className="btn-primary mt-6 w-full">
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Location Selection */}
      {step === 2 && (
        <div className="space-y-4">
          <LocationSelector
            value={location}
            onChange={(v, c) => {
              setLocation(v);
              if (c) setCoords(c);
            }}
          />
          <button onClick={() => setStep(3)} className="btn-primary w-full">
            Continue <MapPin size={17} />
          </button>
        </div>
      )}

      {/* Step 3: Time & Details */}
      {step === 3 && (
        <div className="card p-5">
          <h2 className="text-xl font-bold">When do you need it?</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setWhen("now")}
              className={`rounded-2xl border p-5 text-left transition ${
                when === "now" ? "border-brand-500 bg-brand-50" : "border-slate-200"
              }`}
            >
              <Zap className="text-brand-600" />
              <p className="mt-3 font-bold">Now</p>
              <p className="text-sm text-slate-500">Get a nearby worker as soon as possible</p>
            </button>
            <button
              onClick={() => setWhen("schedule")}
              className={`rounded-2xl border p-5 text-left transition ${
                when === "schedule" ? "border-brand-500 bg-brand-50" : "border-slate-200"
              }`}
            >
              <CalendarDays className="text-brand-600" />
              <p className="mt-3 font-bold">Schedule</p>
              <p className="text-sm text-slate-500">Choose a specific date and time</p>
            </button>
          </div>

          {when === "schedule" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                type="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <input
                type="time"
                className="input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          )}

          <textarea
            className="input mt-4 min-h-24"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the work needed (optional)"
          />

          {error && <p className="mt-3 text-sm font-semibold text-red-700">{error}</p>}

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={startRadarScan}
              disabled={loading}
              className="btn-primary flex w-full items-center justify-center gap-2 bg-emerald-600 py-3.5 text-base font-black text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-[0.99]"
            >
              <Radio size={20} className="animate-pulse text-emerald-200" />
              Find Nearby Workers (Radar Scan) ⚡
            </button>

            <button
              onClick={() => submit()}
              disabled={loading}
              className="btn-secondary flex w-full items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              <Sparkles size={14} />
              Or Instant Auto-Match Without Selection
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Live Radar Scanner & Worker Selection */}
      {step === 4 && (
        <WorkerRadarScanner
          serviceName={translateService(service.name)}
          serviceIcon={service.name.slice(0, 2)}
          userAddress={location}
          workers={nearbyWorkers}
          loading={radarLoading || loading}
          onSelectWorker={async (worker) => {
            if (worker.availability !== "online") {
              setError("Selected worker is currently offline.");
              return;
            }
            await submit(worker.id);
          }}
          onAutoAssign={async () => {
            await submit();
          }}
          onCancel={() => setStep(3)}
        />
      )}
    </div>
  );
}
