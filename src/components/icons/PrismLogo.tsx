import { cn } from "@/lib/utils";

export function PrismLogo({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="prism-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      {/* Triangular prism splitting light into a spectrum */}
      <path
        d="M16 3.5 L29.5 27 H2.5 Z"
        stroke="url(#prism-grad)"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="url(#prism-grad)"
        fillOpacity="0.12"
      />
      <path d="M16 3.5 L16 27" stroke="url(#prism-grad)" strokeWidth="1.25" strokeLinecap="round" opacity="0.5" />
      <path d="M11 27 L21 27" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" />
      <path d="M9.5 24 L22.5 24" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
