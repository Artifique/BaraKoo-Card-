import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Standard cn class merging helper
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
