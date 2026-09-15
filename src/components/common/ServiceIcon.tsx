interface ServiceIconProps {
  nameOrId?: string;
  name?: string;
  className?: string;
  size?: number;
}

const idMap: Record<string, string> = {
  "6aa82a42af3a572a4c67ee48": "caregiver",
  "6aa82a42af3a572a4c67ee46": "carpenter",
  "6aa82a42af3a572a4c67ee45": "cleaner",
  "6aa82a42af3a572a4c67ee43": "electrician",
  "6aa82a42af3a572a4c67ee49": "gardener",
  "6aa82a42af3a572a4c67ee47": "painter",
  "6aa82a42af3a572a4c67ee44": "plumber",
  "6aa82a42af3a572a4c67ee4a": "technician"
};

export default function ServiceIcon({ nameOrId = "", name = "", className = "w-7 h-7", size = 28 }: ServiceIconProps) {
  let key = (name || nameOrId).toLowerCase().trim();
  if (idMap[key]) {
    key = idMap[key];
  }

  // Electrician
  if (key.includes("electr")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="elec-bolt" x1="12" y1="4" x2="36" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>
          <linearGradient id="elec-plug" x1="16" y1="18" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <filter id="elec-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#EAB308" floodOpacity="0.4" />
          </filter>
        </defs>
        {/* Glow halo */}
        <circle cx="24" cy="24" r="20" fill="#FEF9C3" fillOpacity="0.5" />
        {/* Lightning Flash */}
        <path
          d="M26 4L11 26H23L20 44L37 20H25L26 4Z"
          fill="url(#elec-bolt)"
          stroke="#A16207"
          strokeWidth="1.5"
          strokeLinejoin="round"
          filter="url(#elec-glow)"
        />
        {/* Highlight sheen */}
        <path
          d="M24 8L16 24H23L21 34L30 22H24L24 8Z"
          fill="#FFFFFF"
          fillOpacity="0.45"
        />
      </svg>
    );
  }

  // Plumber
  if (key.includes("plumb")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="wrench-metal" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="40%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="water-drop" x1="28" y1="20" x2="42" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="60%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
          <filter id="wrench-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#334155" floodOpacity="0.3" />
          </filter>
        </defs>
        {/* Wrench body */}
        <path
          d="M14.5 9.5C12 12 11.5 15.8 13 18.8L6.2 25.6C5.4 26.4 5.4 27.6 6.2 28.4L11.8 34C12.6 34.8 13.8 34.8 14.6 34L21.4 27.2C24.4 28.7 28.2 28.2 30.7 25.7C33.4 23 33.7 18.9 31.8 15.9L24.5 23.2L20.8 19.5L28.1 12.2C25.1 10.3 21 10.6 18.3 13.3"
          transform="rotate(-15 20 22)"
          fill="url(#wrench-metal)"
          stroke="#334155"
          strokeWidth="1.5"
          strokeLinejoin="round"
          filter="url(#wrench-shadow)"
        />
        {/* Chrome sheen */}
        <path
          d="M10 33L15 28L18 31L13 36Z"
          fill="#FFFFFF"
          fillOpacity="0.3"
        />
        {/* Realistic Water Droplet */}
        <path
          d="M36 18C36 18 42 26 42 30C42 33.3 39.3 36 36 36C32.7 36 30 33.3 30 30C30 26 36 18 36 18Z"
          fill="url(#water-drop)"
          stroke="#0284C7"
          strokeWidth="1.2"
        />
        <circle cx="34" cy="28" r="1.5" fill="#FFFFFF" fillOpacity="0.7" />
      </svg>
    );
  }

  // Carpenter
  if (key.includes("carpent")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="saw-blade" x1="12" y1="12" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
          <linearGradient id="wood-handle" x1="8" y1="28" x2="20" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="50%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>
        {/* Saw blade with realistic serrated teeth */}
        <path
          d="M18 16L39 7C40 8 40.5 9 39.5 10.5L18 35V16Z"
          fill="url(#saw-blade)"
          stroke="#475569"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Saw teeth edge */}
        <path
          d="M39 11L36 13L35 15L32 17L31 19L28 21L27 23L24 25L23 27L20 29L19 31L18 35"
          stroke="#334155"
          strokeWidth="1.5"
        />
        {/* Wooden Handle */}
        <path
          d="M18 20C18 20 14 18 10 21C6 24 6 29 8 33C10 37 15 39 19 36C22 34 20 30 19 28"
          fill="url(#wood-handle)"
          stroke="#451A03"
          strokeWidth="1.5"
        />
        {/* Handle grip hole */}
        <ellipse cx="12.5" cy="28.5" rx="2.5" ry="4.5" transform="rotate(-25 12.5 28.5)" fill="#F8FAFC" />
        {/* Brass Screws */}
        <circle cx="16" cy="23" r="1.2" fill="#FBBF24" stroke="#78350F" strokeWidth="0.6" />
        <circle cx="17" cy="31" r="1.2" fill="#FBBF24" stroke="#78350F" strokeWidth="0.6" />
      </svg>
    );
  }

  // Painter
  if (key.includes("paint")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="paint-roll" x1="12" y1="8" x2="36" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
          <linearGradient id="paint-frame" x1="20" y1="18" x2="30" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="paint-handle" x1="20" y1="30" x2="26" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
        </defs>
        {/* Fresh paint swatch background */}
        <path
          d="M8 12C14 10 24 14 32 11C38 8 41 12 40 15C39 18 31 16 23 18C15 20 8 16 8 12Z"
          fill="#EEF2FF"
        />
        {/* Roller Cylinder */}
        <rect
          x="11"
          y="8"
          width="26"
          height="12"
          rx="3"
          fill="url(#paint-roll)"
          stroke="#3730A3"
          strokeWidth="1.5"
        />
        {/* Roller Texture lines */}
        <line x1="18" y1="9" x2="18" y2="19" stroke="#A5B4FC" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="26" y1="9" x2="26" y2="19" stroke="#A5B4FC" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="33" y1="9" x2="33" y2="19" stroke="#A5B4FC" strokeWidth="1" strokeDasharray="2 2" />

        {/* Metal Arm Frame */}
        <path
          d="M37 14H40C41.1 14 42 14.9 42 16V22C42 23.1 41.1 24 40 24H24V32"
          fill="none"
          stroke="url(#paint-frame)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Handle */}
        <rect
          x="21"
          y="32"
          width="6"
          height="13"
          rx="2"
          fill="url(#paint-handle)"
          stroke="#7C2D12"
          strokeWidth="1.2"
        />
        {/* Paint Drip */}
        <path
          d="M15 20C15 22 17 24 17 25C17 25.6 16.6 26 16 26C15.4 26 15 25.6 15 25C15 23.5 13.5 21 13.5 20H15Z"
          fill="#6366F1"
        />
      </svg>
    );
  }

  // Cleaner
  if (key.includes("clean")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="clean-bottle" x1="16" y1="14" x2="32" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="50%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#115E59" />
          </linearGradient>
          <linearGradient id="clean-spray" x1="20" y1="6" x2="34" y2="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
        </defs>
        {/* Spray Bottle Body */}
        <path
          d="M20 18C18 20 15 24 15 30C15 37 18 42 24 42C30 42 33 37 33 30C33 24 30 20 28 18V14H20V18Z"
          fill="url(#clean-bottle)"
          stroke="#0F766E"
          strokeWidth="1.5"
        />
        {/* Liquid level wave & sheen */}
        <path
          d="M16 30C19 28 22 32 26 30C29 28 31 31 32 30V35C32 39 30 41 24 41C18 41 16 39 16 35V30Z"
          fill="#14B8A6"
          fillOpacity="0.5"
        />
        <path
          d="M18 22C17 25 17 33 17 37"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
        {/* Spray Nozzle / Trigger Head */}
        <path
          d="M19 14H29L32 10H28V6H20V10L14 9L13 12L19 13V14Z"
          fill="url(#clean-spray)"
          stroke="#475569"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Trigger Lever */}
        <path
          d="M17 14L15 21C16 22 18 22 19 20L20 14"
          fill="#334155"
        />
        {/* Sparkling Shine Stars */}
        <path
          d="M38 12L39.5 16L43.5 17.5L39.5 19L38 23L36.5 19L32.5 17.5L36.5 16L38 12Z"
          fill="#FDE047"
          stroke="#CA8A04"
          strokeWidth="0.8"
        />
        <circle cx="34" cy="8" r="1.5" fill="#38BDF8" />
        <circle cx="41" cy="27" r="1.5" fill="#38BDF8" />
      </svg>
    );
  }

  // Driver
  if (key.includes("driv")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="wheel-rim" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="wheel-spoke" x1="16" y1="16" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="50%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="car-body" x1="10" y1="20" x2="38" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        {/* Modern Steering Wheel Outer Rim */}
        <circle
          cx="24"
          cy="24"
          r="17"
          fill="none"
          stroke="url(#wheel-rim)"
          strokeWidth="5"
        />
        {/* Leather Grip textures */}
        <circle
          cx="24"
          cy="24"
          r="17"
          fill="none"
          stroke="#475569"
          strokeWidth="0.8"
          strokeDasharray="2 3"
        />
        {/* Center Hub */}
        <circle
          cx="24"
          cy="24"
          r="6.5"
          fill="url(#wheel-rim)"
          stroke="#64748B"
          strokeWidth="1.5"
        />
        <circle cx="24" cy="24" r="3" fill="#3B82F6" />
        {/* Spokes (Left, Right, Down) */}
        <path
          d="M8.5 24H17.5M30.5 24H39.5M24 30.5V39.5"
          stroke="url(#wheel-spoke)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Headlight glare */}
        <path
          d="M13 13C16 10 20 8.5 24 8.5"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
      </svg>
    );
  }

  // Caregiver
  if (key.includes("care") || key.includes("nurse")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="heart-glow" x1="12" y1="8" x2="36" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="50%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#BE123C" />
          </linearGradient>
          <linearGradient id="care-hands" x1="8" y1="28" x2="40" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <filter id="heart-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#F43F5E" floodOpacity="0.4" />
          </filter>
        </defs>
        {/* Ambient warm circle */}
        <circle cx="24" cy="24" r="20" fill="#FFF1F2" />
        {/* Realistic 3D Heart */}
        <path
          d="M24 35.5C24 35.5 10 27.5 10 17.5C10 13 13.5 9.5 18 9.5C20.8 9.5 23.3 11 24 12.5C24.7 11 27.2 9.5 30 9.5C34.5 9.5 38 13 38 17.5C38 27.5 24 35.5 24 35.5Z"
          fill="url(#heart-glow)"
          stroke="#9F1239"
          strokeWidth="1.2"
          filter="url(#heart-shadow)"
        />
        {/* Heart gloss reflection */}
        <path
          d="M14 16C14 13.5 16 12 18 12C19.5 12 20.5 12.8 21 13.8C20 14.5 18.5 15.5 17 18C15.8 20 15 22 14.8 24C14.3 22 14 18 14 16Z"
          fill="#FFFFFF"
          fillOpacity="0.4"
        />
        {/* Medical Cross in center */}
        <path
          d="M22 19H26V29H22V19ZM19 22H29V26H19V22Z"
          fill="#FFFFFF"
          fillOpacity="0.95"
        />
      </svg>
    );
  }

  // Gardener
  if (key.includes("garden")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="leaf-grad" x1="14" y1="8" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="50%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
          <linearGradient id="pot-grad" x1="14" y1="28" x2="34" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="60%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#9A3412" />
          </linearGradient>
        </defs>
        {/* Terracotta Plant Pot */}
        <path
          d="M13 30H35L32 43C32 44.1 31.1 45 30 45H18C16.9 45 16 44.1 16 43L13 30Z"
          fill="url(#pot-grad)"
          stroke="#7C2D12"
          strokeWidth="1.5"
        />
        {/* Pot Rim */}
        <rect
          x="11"
          y="27"
          width="26"
          height="5"
          rx="1.5"
          fill="#F97316"
          stroke="#7C2D12"
          strokeWidth="1.5"
        />
        {/* Soil mound */}
        <ellipse cx="24" cy="28" rx="11" ry="2.5" fill="#451A03" />

        {/* Stem */}
        <path
          d="M24 28V15"
          stroke="#166534"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Left Leaf */}
        <path
          d="M24 20C17 20 11 15 11 11C16 11 22 14 24 20Z"
          fill="url(#leaf-grad)"
          stroke="#14532D"
          strokeWidth="1.2"
        />
        {/* Right Leaf */}
        <path
          d="M24 16C31 16 37 10 37 6C32 6 26 10 24 16Z"
          fill="url(#leaf-grad)"
          stroke="#14532D"
          strokeWidth="1.2"
        />
        {/* Dew drop */}
        <circle cx="32" cy="9" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
      </svg>
    );
  }

  // Technician
  if (key.includes("tech")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="tech-gear" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="50%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="tech-driver" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
        </defs>
        {/* Precision Screwdriver (crossed) */}
        <path
          d="M12 36L22 26M22 26L26 22M22 26L18 22M26 22L36 12M36 12L39 9L36 6L33 9L36 12Z"
          stroke="#0284C7"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Handle */}
        <rect
          x="7"
          y="31"
          width="10"
          height="6"
          rx="1.5"
          transform="rotate(45 7 31)"
          fill="url(#tech-driver)"
          stroke="#075985"
          strokeWidth="1.2"
        />
        {/* Cog/Gear */}
        <path
          d="M24 16C19.6 16 16 19.6 16 24C16 28.4 19.6 32 24 32C28.4 32 32 28.4 32 24C32 19.6 28.4 16 24 16ZM24 21C25.7 21 27 22.3 27 24C27 25.7 25.7 27 24 27C22.3 27 21 25.7 21 24C21 22.3 22.3 21 24 21Z"
          fill="url(#tech-gear)"
          stroke="#1E293B"
          strokeWidth="1.2"
        />
        {/* Cog teeth */}
        <rect x="22.5" y="13" width="3" height="3" rx="0.5" fill="#64748B" />
        <rect x="22.5" y="32" width="3" height="3" rx="0.5" fill="#64748B" />
        <rect x="13" y="22.5" width="3" height="3" rx="0.5" fill="#64748B" />
        <rect x="32" y="22.5" width="3" height="3" rx="0.5" fill="#64748B" />
      </svg>
    );
  }

  // Fallback / default
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="24" cy="24" r="18" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
      <path
        d="M17 24H31M24 17V31"
        stroke="#16A85B"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

