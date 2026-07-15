// Barre latérale de navigation du tableau de bord administrateur
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart3, Users, CreditCard, Building2, ShoppingBag, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

/** Identifiants des onglets de navigation */
export type ActiveTab = "dashboard" | "holders" | "cards" | "orgs" | "orders" | "settings"

interface AdminSidebarProps {
  /** Onglet actuellement actif */
  activeTab: ActiveTab
  /** Callback pour changer d'onglet */
  onTabChange: (tab: ActiveTab) => void
}

// --------------------------------------------------------------------------
// Configuration des liens de navigation
// --------------------------------------------------------------------------

const liens = [
  { id: "dashboard" as ActiveTab, label: "Tableau de bord",     icone: BarChart3   },
  { id: "holders"   as ActiveTab, label: "Titulaires (Profils)", icone: Users       },
  { id: "cards"     as ActiveTab, label: "Gabarits & Cartes",   icone: CreditCard  },
  { id: "orgs"      as ActiveTab, label: "Organisations",        icone: Building2   },
  { id: "orders"    as ActiveTab, label: "Commandes",            icone: ShoppingBag },
  { id: "settings"  as ActiveTab, label: "Paramètres",           icone: Settings    },
]

// --------------------------------------------------------------------------
// Composant
// --------------------------------------------------------------------------

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" })
      if (res.ok) {
        router.push("/login")
        router.refresh()
      }
    } catch (erreur) {
      console.error("Erreur déconnexion :", erreur)
    }
  }

  return (
    <aside className="
      w-full md:w-64 md:h-screen md:sticky md:top-0 shrink-0 p-5
      bg-card border-r border-border/50
      flex flex-col justify-between overflow-y-auto
    ">
      {/* ─── Partie haute : logo + navigation ─── */}
      <div className="flex flex-col space-y-8">

        {/* Logo Baarako Card */}
        <div className="flex items-center space-x-3 py-2 border-b border-border/20">
          <div className="w-9 h-9 rounded-xl bg-brand-orange flex items-center justify-center text-white font-extrabold text-lg glow-orange">
            B
          </div>
          <div>
            <span className="text-base font-bold text-foreground tracking-wider block leading-none">
              BAARAKO CARD
            </span>
            <span className="text-[10px] text-brand-green font-semibold tracking-widest">
              BACK-OFFICE
            </span>
          </div>
        </div>

        {/* Navigation par onglets */}
        <nav className="flex flex-col space-y-1.5">
          {liens.map(({ id, label, icone: Icone }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium",
                "transition-all duration-200 cursor-pointer w-full text-left",
                activeTab === id
                  ? "bg-brand-orange text-white glow-orange"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <Icone className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* ─── Partie basse : compte admin + déconnexion ─── */}
      <div className="space-y-4 pt-4 border-t border-border/20">
        
        {/* Compte administrateur connecté */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-brand-green/20 border border-brand-green/30 flex items-center justify-center text-brand-green font-bold text-sm shrink-0">
            AD
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-semibold text-foreground block truncate leading-none">
              Admin Baarako
            </span>
            <span className="text-[9px] text-muted-foreground truncate block mt-0.5">
              super_admin
            </span>
          </div>
        </div>

        {/* Bouton Déconnexion */}
        <button
          onClick={handleLogout}
          className="
            flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-2xl text-xs font-semibold
            text-brand-red bg-brand-red-muted/10 border border-brand-red/10 hover:bg-brand-red hover:text-white
            transition-all duration-300 cursor-pointer
          "
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
