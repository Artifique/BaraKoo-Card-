/**
 * Service : Commandes clients (Orders)
 * Toute la logique métier d'accès à la base de données pour les commandes B2C/B2B.
 */
import prisma from "@/lib/prisma"
import type { Order } from "@/models"

// ─────────────────────────────────────────────────────────────────────────────
// Mapper Prisma → Modèle Frontend
// ─────────────────────────────────────────────────────────────────────────────

function mapperCommande(o: any): Order {
  const offerTypeMap: Record<string, Order["offerType"]> = {
    CARTE_SIMPLE_QR: "simple_qr",
    CARTE_NFC_QR: "nfc_qr",
    PACK_ENTREPRISE: "enterprise"
  }
  const paymentMap: Record<string, Order["paymentStatus"]> = {
    EN_ATTENTE: "pending",
    PAYE: "paid",
    REMBOURSE: "refunded"
  }
  const statusMap: Record<string, Order["status"]> = {
    EN_ATTENTE: "pending",
    EN_COURS: "processing",
    EXPEDIEE: "shipped",
    LIVREE: "delivered"
  }

  return {
    id: o.id,
    clientName: o.client?.nom ?? "Inconnu",
    clientEmail: o.client?.email ?? "",
    clientPhone: o.client?.telephone ?? "",
    quantity: o.quantite,
    offerType: offerTypeMap[o.typeOffre] ?? "simple_qr",
    paymentStatus: paymentMap[o.statutPaiement] ?? "pending",
    status: statusMap[o.statutLivraison] ?? "pending",
    notes: o.notes ?? "",
    createdAt: o.createdAt.toISOString()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Lecture
// ─────────────────────────────────────────────────────────────────────────────

/** Récupère toutes les commandes avec les informations client associées. */
export async function getAllOrders(): Promise<Order[]> {
  const liste = await prisma.order.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" }
  })
  return liste.map(mapperCommande)
}

/** Récupère une commande par son identifiant. */
export async function getOrderById(id: string): Promise<Order | null> {
  const commande = await prisma.order.findUnique({
    where: { id },
    include: { client: true }
  })
  if (!commande) return null
  return mapperCommande(commande)
}

// ─────────────────────────────────────────────────────────────────────────────
// Création
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crée une nouvelle commande.
 * Si le client n'existe pas encore (pas d'ID fourni), il est créé automatiquement.
 */
export async function createOrder(data: {
  clientName: string
  clientEmail?: string
  clientPhone?: string
  quantity: number
  offerType: "simple_qr" | "nfc_qr" | "enterprise"
  paymentStatus?: "pending" | "paid" | "refunded"
  notes?: string
}): Promise<Order> {
  const offerTypeMapInverse: Record<string, string> = {
    simple_qr: "CARTE_SIMPLE_QR",
    nfc_qr: "CARTE_NFC_QR",
    enterprise: "PACK_ENTREPRISE"
  }
  const paymentMapInverse: Record<string, string> = {
    pending: "EN_ATTENTE",
    paid: "PAYE",
    refunded: "REMBOURSE"
  }

  // Chercher si un client avec cet e-mail existe déjà, sinon en créer un
  let client = data.clientEmail
    ? await prisma.client.findFirst({ where: { email: data.clientEmail } })
    : null

  if (!client) {
    client = await prisma.client.create({
      data: {
        nom: data.clientName,
        email: data.clientEmail || null,
        telephone: data.clientPhone || null,
      }
    })
  }

  const nouvelleCommande = await prisma.order.create({
    data: {
      quantite: data.quantity,
      typeOffre: offerTypeMapInverse[data.offerType] as any,
      statutPaiement: paymentMapInverse[data.paymentStatus ?? "pending"] as any,
      statutLivraison: "EN_ATTENTE" as any,
      notes: data.notes || null,
      clientId: client.id,
    },
    include: { client: true }
  })

  return mapperCommande(nouvelleCommande)
}

// ─────────────────────────────────────────────────────────────────────────────
// Modification
// ─────────────────────────────────────────────────────────────────────────────

/** Met à jour les statuts ou informations d'une commande existante. */
export async function updateOrder(id: string, data: {
  paymentStatus?: "pending" | "paid" | "refunded"
  status?: "pending" | "processing" | "shipped" | "delivered"
  quantity?: number
  offerType?: "simple_qr" | "nfc_qr" | "enterprise"
  notes?: string
}): Promise<Order | null> {
  const paymentMapInverse: Record<string, string> = {
    pending: "EN_ATTENTE",
    paid: "PAYE",
    refunded: "REMBOURSE"
  }
  const statusMapInverse: Record<string, string> = {
    pending: "EN_ATTENTE",
    processing: "EN_COURS",
    shipped: "EXPEDIEE",
    delivered: "LIVREE"
  }
  const offerTypeMapInverse: Record<string, string> = {
    simple_qr: "CARTE_SIMPLE_QR",
    nfc_qr: "CARTE_NFC_QR",
    enterprise: "PACK_ENTREPRISE"
  }

  try {
    const mise_a_jour = await prisma.order.update({
      where: { id },
      data: {
        ...(data.paymentStatus && { statutPaiement: paymentMapInverse[data.paymentStatus] as any }),
        ...(data.status && { statutLivraison: statusMapInverse[data.status] as any }),
        ...(data.quantity && { quantite: data.quantity }),
        ...(data.offerType && { typeOffre: offerTypeMapInverse[data.offerType] as any }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: { client: true }
    })
    return mapperCommande(mise_a_jour)
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Suppression
// ─────────────────────────────────────────────────────────────────────────────

/** Supprime une commande par son identifiant. */
export async function deleteOrder(id: string): Promise<boolean> {
  try {
    await prisma.order.delete({ where: { id } })
    return true
  } catch {
    return false
  }
}
