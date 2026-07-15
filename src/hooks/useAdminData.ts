// Hook centralisé pour la récupération et la gestion des données du tableau de bord admin
// Évite la duplication des appels fetch dans chaque composant d'onglet
"use client"

import { useState, useEffect, useCallback } from "react"
import { CardHolder, Card, Organization, CardStats, Order } from "@/lib/types"

// --------------------------------------------------------------------------
// Type de retour du hook
// --------------------------------------------------------------------------

export interface AdminData {
  holders: CardHolder[]
  cards: Card[]
  stats: CardStats[]
  organizations: Organization[]
  orders: Order[]
  loading: boolean
  /** Recharger toutes les données depuis l'API */
  refetch: () => Promise<void>
  /** Mettre à jour localement un titulaire (optimistic update) */
  mettreAJourHolder: (id: string, updates: Partial<CardHolder>) => void
  /** Mettre à jour localement une carte (optimistic update) */
  mettreAJourCarte: (id: string, updates: Partial<Card>) => void
  /** Ajouter un titulaire localement après création */
  ajouterHolder: (holder: CardHolder) => void
  // ─── Organisations ───
  ajouterOrganisation: (org: Organization) => void
  mettreAJourOrganisation: (id: string, updates: Partial<Organization>) => void
  supprimerOrganisation: (id: string) => void
  // ─── Commandes ───
  ajouterCommande: (order: Order) => void
  mettreAJourCommande: (id: string, updates: Partial<Order>) => void
  supprimerCommande: (id: string) => void
}

// --------------------------------------------------------------------------
// Hook principal
// --------------------------------------------------------------------------

export function useAdminData(): AdminData {
  const [holders, setHolders] = useState<CardHolder[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [stats, setStats] = useState<CardStats[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Récupération de toutes les données depuis les routes API Next.js
  const refetch = useCallback(async () => {
    try {
      setLoading(true)

      // Récupérer en parallèle : titulaires, cartes, organisations, commandes
      const [reponseHolders, reponseCartes, reponseOrgs, reponseOrders] = await Promise.all([
        fetch("/api/holders"),
        fetch("/api/cards"),
        fetch("/api/organizations"),
        fetch("/api/orders"),
      ])

      const donneesHolders: CardHolder[] = await reponseHolders.json()
      const donneesCartes: { cards: Card[]; stats: CardStats[] } = await reponseCartes.json()
      const donneesOrgs: Organization[] = await reponseOrgs.json()
      const donneesOrders: Order[] = await reponseOrders.json()

      setHolders(donneesHolders)
      setCards(donneesCartes.cards)
      setStats(donneesCartes.stats)
      setOrganizations(donneesOrgs)
      setOrders(donneesOrders)
    } catch (erreur) {
      console.error("Erreur lors du chargement des données admin :", erreur)
    } finally {
      setLoading(false)
    }
  }, [])

  // Chargement initial au montage du composant
  useEffect(() => {
    refetch()
  }, [refetch])

  // ─── Titulaires ───────────────────────────────────────────────────────────

  const mettreAJourHolder = useCallback((id: string, updates: Partial<CardHolder>) => {
    setHolders(prev => prev.map(h => (h.id === id ? { ...h, ...updates } : h)))
  }, [])

  const mettreAJourCarte = useCallback((id: string, updates: Partial<Card>) => {
    setCards(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)))
  }, [])

  const ajouterHolder = useCallback((holder: CardHolder) => {
    setHolders(prev => [...prev, holder])
  }, [])

  // ─── Organisations ────────────────────────────────────────────────────────

  const ajouterOrganisation = useCallback((org: Organization) => {
    setOrganizations(prev => [...prev, org])
  }, [])

  const mettreAJourOrganisation = useCallback((id: string, updates: Partial<Organization>) => {
    setOrganizations(prev => prev.map(o => (o.id === id ? { ...o, ...updates } : o)))
  }, [])

  const supprimerOrganisation = useCallback((id: string) => {
    setOrganizations(prev => prev.filter(o => o.id !== id))
  }, [])

  // ─── Commandes ────────────────────────────────────────────────────────────

  const ajouterCommande = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev])
  }, [])

  const mettreAJourCommande = useCallback((id: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, ...updates } : o)))
  }, [])

  const supprimerCommande = useCallback((id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id))
  }, [])

  return {
    holders,
    cards,
    stats,
    organizations,
    orders,
    loading,
    refetch,
    mettreAJourHolder,
    mettreAJourCarte,
    ajouterHolder,
    ajouterOrganisation,
    mettreAJourOrganisation,
    supprimerOrganisation,
    ajouterCommande,
    mettreAJourCommande,
    supprimerCommande,
  }
}
