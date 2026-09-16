import { Link } from "react-router-dom";

export interface LogoProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "brand" | "emblem" | "full";
}

export default function Logo({
  showTagline = true,
  size = "md",
  className = "",
  variant = "brand"
}: LogoProps) {
  const imgDimension =
    size === "sm"
      ? "h-8 w-8"
      : size === "lg"
      ? "h-12 w-12"
      : size === "xl"
      ? "h-16 w-16"
      : "h-10 w-10";

  if (variant === "full") {
    return (
      <Link to="/" className={`inline-flex flex-col items-center gap-1.5 ${className}`}>
        <img
          src="/karmik-logo.png"
          alt="KarmiK Logo"
          className="h-20 w-auto object-contain drop-shadow-sm transition hover:scale-105"
        />
      </Link>
    );
  }

  return (
    <Link to="/" className={`flex items-center gap-2.5 transition hover:opacity-95 ${className}`}>
      <div
        className={`overflow-hidden rounded-xl bg-white shadow-2xs shrink-0 ${imgDimension} flex items-center justify-center p-0.5 border border-slate-200/80`}
      >
        <img
          src="/karmik-logo.png"
          alt="KarmiK"
          className="h-full w-full object-contain"
        />
      </div>
      <div>
        <span className="block text-lg font-black leading-none text-slate-900 tracking-tight">
          Karmi<span className="text-brand-600">K</span>
        </span>
        {showTagline && (
          <span className="hidden text-[10px] font-bold text-slate-400 sm:block leading-tight mt-0.5">
            Skilled People. Stronger Communities.
          </span>
        )}
      </div>
    </Link>
  );
}

export function LogoFull({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <img
        src="/karmik-logo.png"
        alt="KarmiK - A Cooperative Gig Services Platform"
        className="max-w-[220px] w-full h-auto object-contain drop-shadow-sm"
      />
    </div>
  );
}