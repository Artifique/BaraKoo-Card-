// Page d'administration principale du tableau de bord (shell de rendu)
"use client"

import * as React from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"

/**
 * Routeur d'affichage client pour le back-office Baarako Cards.
 * La logique de chargement de données et d'onglets est déportée 
 * dans le composant AdminLayout pour favoriser la maintenance.
 */
export default function AdminDashboardPage() {
  return <AdminLayout />
}
