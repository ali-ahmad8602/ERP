import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PRIORITY_CONFIG = {
  urgent: { label: "Urgent", color: "#FF4444", bg: "rgba(255,68,68,0.12)"  },
  high:   { label: "High",   color: "#F5A623", bg: "rgba(245,166,35,0.12)" },
  medium: { label: "Medium", color: "#0454FC", bg: "rgba(4,84,252,0.12)"   },
  low:    { label: "Low",    color: "#555555", bg: "rgba(85,85,85,0.12)"   },
  none:   { label: "None",   color: "#444444", bg: "transparent"           },
} as const;

export type Priority = keyof typeof PRIORITY_CONFIG;
