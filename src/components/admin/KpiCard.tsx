// Carte de statistique KPI réutilisable pour le tableau de bord admin
import * as React from "react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  /** Libellé de la métrique */
  label: string
  /** Valeur numérique ou texte à afficher */
  valeur: string | number
  /** Icône Lucide à afficher dans le badge coloré */
  icone: React.ReactNode
  /** Classe de couleur d'accent (ex: "bg-brand-green/10 border-brand-green/20 text-brand-green") */
  couleurAccent: string
  className?: string
}

/**
 * Carte compacte affichant une statistique clé avec une icône colorée.
 * Utilisée dans le tableau de bord administrateur.
 */
export function KpiCard({ label, valeur, icone, couleurAccent, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        // Fond de carte avec glassmorphism
        "rounded-3xl border border-border/60 bg-card p-5 flex items-center justify-between shadow-lg",
        className
      )}
    >
      {/* Zone texte : libellé + valeur */}
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </span>
        <h3 className="text-2xl font-extrabold text-foreground">{valeur}</h3>
      </div>

      {/* Badge icône coloré */}
      <div
        className={cn(
          "w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0",
          couleurAccent
        )}
      >
        {icone}
      </div>
    </div>
  )
}
