// Mise en page globale (Shell) du tableau de bord administration
"use client"

import * as React from "react"
import { useState } from "react"
import { AdminSidebar, ActiveTab } from "./AdminSidebar"
import { AdminTopbar } from "./AdminTopbar"
import { DashboardTab } from "./tabs/DashboardTab"
import { HoldersTab } from "./tabs/HoldersTab"
import { CardsTab } from "./tabs/CardsTab"
import { OrgsTab } from "./tabs/OrgsTab"
import { OrdersTab } from "./tabs/OrdersTab"
import { SettingsTab } from "./tabs/SettingsTab"
import { useAdminData } from "@/hooks/useAdminData"
import { CardHolder, Card as CardType, Organization, Order } from "@/lib/types"
import { useNotification } from "@/providers/NotificationProvider"

export function AdminLayout() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard")
  const { showDialog, showToast } = useNotification()
  
  // Utilisation du hook centralisé pour charger les données
  const {
    holders,
    cards,
    stats,
    organizations,
    orders,
    loading,
    mettreAJourHolder,
    mettreAJourCarte,
    ajouterHolder,
    // CRUD Organisations
    ajouterOrganisation,
    mettreAJourOrganisation,
    supprimerOrganisation,
    // CRUD Commandes
    ajouterCommande,
    mettreAJourCommande,
    supprimerCommande
  } = useAdminData()

  // Actions de modification en direct
  const handleToggleAvailability = async (holder: CardHolder) => {
    const nouvelleDispo = holder.availability === "available" ? "unavailable" : "available"
    mettreAJourHolder(holder.id, { availability: nouvelleDispo }) // Mise à jour optimiste locale

    try {
      const res = await fetch("/api/holders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: holder.id, availability: nouvelleDispo })
      })
      if (!res.ok) {
        // Revenir en arrière en cas d'erreur de requête
        mettreAJourHolder(holder.id, { availability: holder.availability })
        showDialog("Erreur", "Impossible de mettre à jour la disponibilité du titulaire.", "error")
      } else {
        showToast(
          `Statut de disponibilité mis à jour : ${holder.name} est maintenant ${nouvelleDispo === "available" ? "disponible" : "indisponible"}.`,
          "success"
        )
      }
    } catch (erreur) {
      console.error("Erreur disponibilité :", erreur)
      mettreAJourHolder(holder.id, { availability: holder.availability })
      showDialog("Erreur réseau", "Impossible de contacter le serveur pour mettre à jour la disponibilité.", "error")
    }
  }

  const handleToggleCardStatus = async (card: CardType) => {
    const nouveauStatut = card.status === "active" ? "inactive" : "active"
    mettreAJourCarte(card.id, { status: nouveauStatut }) // Mise à jour optimiste locale

    try {
      const res = await fetch("/api/cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: card.id, status: nouveauStatut })
      })
      if (!res.ok) {
        mettreAJourCarte(card.id, { status: card.status })
        showDialog("Erreur de carte", "Impossible de modifier le statut de la carte physique.", "error")
      } else {
        showToast(
          `La carte associée au slug "${card.slug}" a été ${nouveauStatut === "active" ? "activée" : "désactivée"} avec succès.`,
          "success"
        )
      }
    } catch (erreur) {
      console.error("Erreur statut carte :", erreur)
      mettreAJourCarte(card.id, { status: card.status })
      showDialog("Erreur réseau", "Impossible de contacter le serveur pour mettre à jour la carte.", "error")
    }
  }

  const handleCreateHolder = async (newHolderData: Partial<CardHolder>) => {
    try {
      // 1. Création du profil titulaire
      const resHolder = await fetch("/api/holders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHolderData)
      })
      
      const createdHolder = await resHolder.json()

      if (resHolder.ok && createdHolder) {
        // 2. Création et association de la carte NFC/QR physique correspondante
        const newSlug = createdHolder.name.toLowerCase().trim().replace(/\s+/g, "-")
        const newCardId = `card-${Date.now()}`
        
        const resCard = await fetch("/api/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: newCardId,
            type: "both",
            status: "active",
            slug: newSlug,
            holderId: createdHolder.id
          })
        })

        if (resCard.ok) {
          // Mettre à jour la liste des titulaires localement
          ajouterHolder(createdHolder)
          
          showDialog(
            "Création réussie !",
            `Le titulaire ${createdHolder.name} a été créé avec succès et sa carte associée a été activée.`,
            "success",
            () => {
              // Recharger la page pour mettre à jour les statistiques et l'affichage global
              window.location.reload()
            }
          )
        } else {
          showDialog("Partiel", `Le profil de ${createdHolder.name} a été créé, mais la carte NFC/QR n'a pas pu être liée automatiquement.`, "info")
        }
      } else {
        showDialog("Erreur de création", createdHolder.message || "Une erreur est survenue lors de la création du titulaire.", "error")
      }
    } catch (erreur) {
      console.error("Erreur lors de la création du titulaire :", erreur)
      showDialog("Erreur", "Une erreur technique a empêché la création du profil.", "error")
    }
  }

  const handleEditHolder = async (updatedHolder: CardHolder) => {
    const originalHolder = holders.find(h => h.id === updatedHolder.id)
    mettreAJourHolder(updatedHolder.id, updatedHolder) // Mise à jour optimiste locale
    
    try {
      const res = await fetch("/api/holders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedHolder)
      })
      if (!res.ok) {
        if (originalHolder) mettreAJourHolder(originalHolder.id, originalHolder)
        showDialog("Erreur de modification", "Impossible de mettre à jour le profil du titulaire.", "error")
      } else {
        showToast(`Le profil de ${updatedHolder.name} a été mis à jour avec succès.`, "success")
      }
    } catch (erreur) {
      console.error("Erreur d'édition :", erreur)
      if (originalHolder) mettreAJourHolder(originalHolder.id, originalHolder)
      showDialog("Erreur réseau", "Impossible de contacter le serveur pour enregistrer les modifications.", "error")
    }
  }

  // ─── ACTIONS ORGANISATIONS ───
  const handleAddOrg = (org: any) => {
    ajouterOrganisation(org)
    showToast(`Organisation "${org.name}" créée avec succès.`, "success")
  }

  const handleEditOrg = async (id: string, updates: Partial<Organization>) => {
    const originalOrg = organizations.find(o => o.id === id)
    mettreAJourOrganisation(id, updates)

    try {
      const res = await fetch("/api/organizations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates })
      })
      if (!res.ok) {
        if (originalOrg) mettreAJourOrganisation(id, originalOrg)
        showDialog("Erreur", "Impossible de modifier l'organisation.", "error")
      } else {
        showToast("Organisation mise à jour avec succès.", "success")
      }
    } catch (erreur) {
      console.error(erreur)
      if (originalOrg) mettreAJourOrganisation(id, originalOrg)
      showDialog("Erreur réseau", "Impossible de contacter le serveur.", "error")
    }
  }

  const handleDeleteOrg = async (id: string) => {
    const org = organizations.find(o => o.id === id)
    if (!org) return

    const confirmation = window.confirm(`Voulez-vous vraiment supprimer définitivement "${org.name}" ? Cette action est irréversible.`)
    if (!confirmation) return

    try {
      const res = await fetch(`/api/organizations?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        showDialog("Impossible de supprimer", data.error || "Une erreur est survenue.", "error")
      } else {
        supprimerOrganisation(id)
        showToast("Organisation supprimée avec succès.", "success")
      }
    } catch (erreur) {
      console.error(erreur)
      showDialog("Erreur réseau", "Impossible de contacter le serveur.", "error")
    }
  }

  // ─── ACTIONS COMMANDES ───
  const handleAddOrder = (order: any) => {
    ajouterCommande(order)
    showToast("Commande enregistrée avec succès.", "success")
  }

  const handleUpdateOrderStatus = async (
    id: string,
    updates: { paymentStatus?: Order["paymentStatus"]; status?: Order["status"] }
  ) => {
    const originalOrder = orders.find(o => o.id === id)
    mettreAJourCommande(id, updates)

    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates })
      })
      if (!res.ok) {
        if (originalOrder) mettreAJourCommande(id, originalOrder)
        showDialog("Erreur", "Impossible de modifier les statuts de la commande.", "error")
      } else {
        showToast("Statuts mis à jour avec succès.", "success")
      }
    } catch (erreur) {
      console.error(erreur)
      if (originalOrder) mettreAJourCommande(id, originalOrder)
      showDialog("Erreur réseau", "Impossible de contacter le serveur.", "error")
    }
  }

  const handleDeleteOrder = async (id: string) => {
    const confirmation = window.confirm("Voulez-vous vraiment supprimer définitivement cette commande ?")
    if (!confirmation) return

    try {
      const res = await fetch(`/api/orders?id=${id}`, { method: "DELETE" })
      if (!res.ok) {
        showDialog("Erreur", "Impossible de supprimer la commande.", "error")
      } else {
        supprimerCommande(id)
        showToast("Commande supprimée avec succès.", "success")
      }
    } catch (erreur) {
      console.error(erreur)
      showDialog("Erreur réseau", "Impossible de contacter le serveur.", "error")
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      
      {/* Barre latérale de navigation fixe */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Zone de contenu principale défilante de façon indépendante */}
      <main className="flex-1 p-6 md:p-8 flex flex-col h-screen overflow-y-auto">
        
        {/* Barre supérieure unifiée (Topbar) avec le ThemeToggle */}
        <AdminTopbar activeTab={activeTab} />

        {/* Zone de rendu conditionnelle (chargement ou onglet actif) */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-muted-foreground animate-pulse">
              Chargement des données du tableau de bord...
            </span>
          </div>
        ) : (
          <div className="flex-1">
            {activeTab === "dashboard" && (
              <DashboardTab holders={holders} cards={cards} stats={stats} />
            )}
            
            {activeTab === "holders" && (
              <HoldersTab
                holders={holders}
                cards={cards}
                loading={loading}
                organizations={organizations}
                onToggleAvailability={handleToggleAvailability}
                onCreateHolder={handleCreateHolder}
                onEditHolder={handleEditHolder}
              />
            )}
            
            {activeTab === "cards" && (
              <CardsTab
                holders={holders}
                cards={cards}
                onToggleCardStatus={handleToggleCardStatus}
              />
            )}
            
            {activeTab === "orgs" && (
              <OrgsTab
                holders={holders}
                organizations={organizations}
                onAddOrg={handleAddOrg}
                onEditOrg={handleEditOrg}
                onDeleteOrg={handleDeleteOrg}
              />
            )}
            
            {activeTab === "orders" && (
              <OrdersTab
                orders={orders}
                organizations={organizations}
                onAddOrder={handleAddOrder}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onDeleteOrder={handleDeleteOrder}
              />
            )}

            {activeTab === "settings" && (
              <SettingsTab />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

