// Bouton de bascule entre le mode clair et le mode sombre
"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/providers/ThemeProvider"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  /** Afficher le libellé textuel à côté de l'icône */
  showLabel?: boolean
  className?: string
}

export function ThemeToggle({ showLabel = false, className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const estSombre = theme === "sombre"

  return (
    <button
      onClick={toggleTheme}
      title={estSombre ? "Passer en mode clair" : "Passer en mode sombre"}
      className={cn(
        // Style de base : bouton arrondi avec transition douce
        "flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-medium transition-all duration-300 cursor-pointer",
        // Mode sombre actif : fond translucide
        estSombre
          ? "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
          : "bg-black/5 text-gray-600 hover:bg-black/10 hover:text-gray-900 border border-black/10",
        className
      )}
    >
      {/* Icône avec transition */}
      {estSombre ? (
        <Sun className="w-4 h-4 text-brand-orange" />
      ) : (
        <Moon className="w-4 h-4 text-brand-navy" />
      )}
      {/* Libellé optionnel */}
      {showLabel && (
        <span>{estSombre ? "Mode clair" : "Mode sombre"}</span>
      )}
    </button>
  )
}
