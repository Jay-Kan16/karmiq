import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Booking, BookingStatus, Service, User, Worker } from "../types";
import {
  translations,
  getTranslatedService,
  type LanguageCode,
  type TranslationKey
} from "../data/translations";
import { api, login as apiLogin } from "../services/api";

export interface UserLocation {
  address: string;
  lat: number;
  lng: number;
}

interface Ctx {
  user: User | null;
  isInitializing: boolean;
  loginReal: (phone: string, password: string) => Promise<User>;
  logout: () => void;
  selectedService: Service | null;
  setSelectedService: (s: Service | null) => void;
  booking: Booking | null;
  setBooking: React.Dispatch<React.SetStateAction<Booking | null>>;
  updateBooking: (p: Partial<Booking>) => void;
  setBookingStatus: (s: BookingStatus) => void;
  matchedWorker: Worker | null;
  setMatchedWorker: React.Dispatch<React.SetStateAction<Worker | null>>;
  workerOnline: boolean;
  setWorkerOnline: (v: boolean) => void;
  currentLocation: UserLocation;
  setCurrentLocation: (l: UserLocation) => void;
  language: LanguageCode;
  setLanguage: (l: LanguageCode) => void;
  t: (k: TranslationKey) => string;
  translateService: (n: string) => string;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const r = localStorage.getItem("kaamsaathi_user");
      return r ? JSON.parse(r) : null;
    } catch {
      return null;
    }
  });

  const [isInitializing, setIsInitializing] = useState<boolean>(() => {
    // If token exists, we stay in initializing state until verified
    return Boolean(localStorage.getItem("kaamsaathi_token"));
  });

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [matchedWorker, setMatchedWorker] = useState<Worker | null>(null);
  const [workerOnline, setWorkerOnline] = useState(true);

  const [currentLocation, setCurrentLocationState] = useState<UserLocation>(() => {
    try {
      const r = localStorage.getItem("kaamsaathi_location");
      return r ? JSON.parse(r) : { address: "", lat: 0, lng: 0 };
    } catch {
      return { address: "", lat: 0, lng: 0 };
    }
  });

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return localStorage.getItem("kaamsaathi_language") === "hi" ? "hi" : "en";
  });

  // Verify and restore session on boot or refresh
  useEffect(() => {
    const token = localStorage.getItem("kaamsaathi_token");
    if (token) {
      api
        .getMe()
        .then((u) => {
          setUser(u);
          localStorage.setItem("kaamsaathi_user", JSON.stringify(u));
        })
        .catch((err) => {
          console.warn("Session refresh warning:", err);
        })
        .finally(() => {
          setIsInitializing(false);
        });
    } else {
      setIsInitializing(false);
    }
  }, []);

  // Listen for explicit logout events
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setBooking(null);
    };
    window.addEventListener("kaamsaathi:logout", handleLogout);
    return () => window.removeEventListener("kaamsaathi:logout", handleLogout);
  }, []);

  const loginReal = async (phone: string, password: string) => {
    const r = await apiLogin(phone, password);
    localStorage.setItem("kaamsaathi_token", r.token);
    localStorage.setItem("kaamsaathi_user", JSON.stringify(r.user));
    setUser(r.user);
    setIsInitializing(false);
    return r.user;
  };

  const logout = async () => {
    const token = localStorage.getItem("kaamsaathi_token");
    localStorage.removeItem("kaamsaathi_token");
    localStorage.removeItem("kaamsaathi_user");
    setUser(null);
    setBooking(null);
    try {
      const apiBase = (import.meta.env.VITE_API_URL || "https://karmiq.onrender.com").replace(/\/+$/, "").replace(/\/api$/, "");
      await fetch(`${apiBase}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token || ""}` }
      });
    } catch {}
  };

  const setCurrentLocation = (l: UserLocation) => {
    setCurrentLocationState(l);
    localStorage.setItem("kaamsaathi_location", JSON.stringify(l));
  };

  const updateBooking = (p: Partial<Booking>) => setBooking((x) => (x ? { ...x, ...p } : x));
  const setBookingStatus = (s: BookingStatus) => setBooking((x) => (x ? { ...x, status: s } : x));

  const setLanguage = (l: LanguageCode) => {
    setLanguageState(l);
    localStorage.setItem("kaamsaathi_language", l);
  };

  const t = (k: TranslationKey) => translations[language]?.[k] ?? translations.en[k] ?? k;
  const translateService = (n: string) => getTranslatedService(n, language);

  const value = useMemo(
    () => ({
      user,
      isInitializing,
      loginReal,
      logout,
      selectedService,
      setSelectedService,
      booking,
      setBooking,
      updateBooking,
      setBookingStatus,
      matchedWorker,
      setMatchedWorker,
      workerOnline,
      setWorkerOnline,
      currentLocation,
      setCurrentLocation,
      language,
      setLanguage,
      t,
      translateService
    }),
    [
      user,
      isInitializing,
      selectedService,
      booking,
      matchedWorker,
      workerOnline,
      currentLocation,
      language
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const v = useContext(AppContext);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}
