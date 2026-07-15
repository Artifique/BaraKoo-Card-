// Barre supérieure d'en-tête dynamique du tableau de bord admin
"use client"

import React from "react"
import Link from "next/link"
import { Globe, ShieldCheck } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ActiveTab } from "./AdminSidebar"

interface AdminTopbarProps {
  /** Onglet actif du tableau de bord */
  activeTab: ActiveTab
}

export function AdminTopbar({ activeTab }: AdminTopbarProps) {
  return (
    <div className="
      flex flex-col md:flex-row justify-between items-start md:items-center gap-4
      border-b border-border/20 pb-4 mb-6
    ">
      {/* ─── Titres dynamiques ─── */}
      <div>
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
          {activeTab === "dashboard" && "Statistiques de Scan & Visites"}
          {activeTab === "holders" && "Gestion des Titulaires"}
          {activeTab === "cards" && "Visualisation des Gabarits NFC / QR"}
          {activeTab === "orgs" && "Organisations & Secteurs"}
          {activeTab === "orders" && "Commandes & Abonnements"}
          {activeTab === "settings" && "Configuration du Système"}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configuration en temps réel du produit Baarako Card.
        </p>
      </div>
      
      {/* ─── Actions de l'en-tête (Site Public, Theme Toggle, Statut) ─── */}
      <div className="flex items-center gap-3">
        {/* Lien vers le site public */}
        <Link
          href="/"
          target="_blank"
          className="
            text-xs font-semibold text-muted-foreground hover:text-foreground
            bg-secondary/80 border border-border/30 px-3.5 py-2 rounded-2xl
            flex items-center gap-1.5 transition-all duration-300
          "
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Voir le Site Public</span>
        </Link>

        {/* Bouton de bascule du mode clair / sombre (ThemeToggle) */}
        <ThemeToggle className="rounded-2xl" />

        {/* Indicateur de statut connecté */}
        <span className="
          text-xs text-brand-green bg-brand-green-muted/20 px-3 py-2 rounded-2xl
          border border-brand-green/20 font-bold flex items-center gap-1.5
        ">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
          </span>
          <span className="hidden sm:inline">Système Connecté</span>
        </span>
      </div>
    </div>
  )
}
