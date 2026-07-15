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
}

// --------------------------------------------------------------------------
// Données locales figées pour les organisations et commandes
// (seront remplacées par des appels API Prisma une fois la DB connectée)
// --------------------------------------------------------------------------

const ORGANISATIONS_DEFAUT: Organization[] = [
  {
    id: "org-1",
    name: "Baarako Jobcard",
    logoUrl: "/avatars/ousmane.png",
    sector: "Recrutement & Technologies",
    description: "La plateforme de contact et de recrutement intelligente en Afrique.",
    address: "Bamako, Mali",
    website: "https://jobcard.africa",
    phone: "+223 70 00 00 00",
    email: "contact@jobcard.africa",
  },
]

const COMMANDES_DEFAUT: Order[] = [
  {
    id: "ORD-2026-001",
    clientName: "Sékou Keïta",
    clientEmail: "sekou.keita@gmail.com",
    quantity: 5,
    offerType: "enterprise",
    paymentStatus: "paid",
    status: "delivered",
    createdAt: "2026-07-10T14:30:00Z",
  },
  {
    id: "ORD-2026-002",
    clientName: "Ousmane Diarra",
    clientEmail: "ousmane.diarra@baarako.com",
    quantity: 1,
    offerType: "nfc_qr",
    paymentStatus: "paid",
    status: "delivered",
    createdAt: "2026-07-12T09:15:00Z",
  },
  {
    id: "ORD-2026-003",
    clientName: "Fatoumata Diallo",
    clientEmail: "fatoumata.diallo@outlook.com",
    quantity: 2,
    offerType: "simple_qr",
    paymentStatus: "pending",
    status: "processing",
    createdAt: "2026-07-14T16:45:00Z",
  },
]

// --------------------------------------------------------------------------
// Hook principal
// --------------------------------------------------------------------------

export function useAdminData(): AdminData {
  const [holders, setHolders] = useState<CardHolder[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [stats, setStats] = useState<CardStats[]>([])
  const [loading, setLoading] = useState(true)

  // Données statiques (à migrer vers API si besoin)
  const organizations = ORGANISATIONS_DEFAUT
  const orders = COMMANDES_DEFAUT

  // Récupération des données depuis les routes API Next.js
  const refetch = useCallback(async () => {
    try {
      setLoading(true)

      // Récupérer les titulaires
      const reponseHolders = await fetch("/api/holders")
      const donneesHolders: CardHolder[] = await reponseHolders.json()
      setHolders(donneesHolders)

      // Récupérer les cartes et statistiques associées
      const reponseCartes = await fetch("/api/cards")
      const donneesCartes: { cards: Card[]; stats: CardStats[] } = await reponseCartes.json()
      setCards(donneesCartes.cards)
      setStats(donneesCartes.stats)
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

  // Mise à jour optimiste d'un titulaire (sans attendre le serveur)
  const mettreAJourHolder = useCallback((id: string, updates: Partial<CardHolder>) => {
    setHolders(prev => prev.map(h => (h.id === id ? { ...h, ...updates } : h)))
  }, [])

  // Mise à jour optimiste d'une carte
  const mettreAJourCarte = useCallback((id: string, updates: Partial<Card>) => {
    setCards(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)))
  }, [])

  // Ajout d'un nouveau titulaire dans la liste locale
  const ajouterHolder = useCallback((holder: CardHolder) => {
    setHolders(prev => [...prev, holder])
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
  }
}
