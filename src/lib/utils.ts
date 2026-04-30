import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Compact number formatter: 1234567 -> "1.2M" */
export function fmtCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Full number formatter: 1234567 -> "1,234,567" */
export function fmtNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/** Percent formatter: 0.0423 -> "4.2%" */
export function fmtPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

/** Currency: 4125 -> "$4,125" */
export function fmtCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

// Legacy aliases — keep both names so old imports don't break
export const formatCompact = fmtCompact;
export const formatNumber = fmtNumber;
export const formatPercent = fmtPercent;
