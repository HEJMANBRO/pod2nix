import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ClassValue } from "clsx";

/**
 * Utility function to merge and conditionally apply CSS classes.
 * Combines clsx for conditional classes with tailwind-merge for proper Tailwind CSS class merging.
 *
 * @param inputs - Variable number of class values (strings, arrays, objects, etc.)
 * @returns Merged and deduplicated class string
 */
export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}
