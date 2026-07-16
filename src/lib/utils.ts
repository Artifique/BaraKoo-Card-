import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Standard cn class merging helper
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convertit une chaîne de caractères en slug propre et standard (sans accents, sans caractères spéciaux)
 */
export function slugify(str: string): string {
  if (!str) return ""
  return str
    .normalize("NFD")                  // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, "")   // Supprime les diacritiques
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")      // Enlève les caractères spéciaux
    .replace(/\s+/g, "-")              // Remplace les espaces par des tirets
    .replace(/-+/g, "-")               // Nettoie les tirets consécutifs
    .replace(/^-+|-+$/g, "");          // Nettoie les tirets en début/fin
}
