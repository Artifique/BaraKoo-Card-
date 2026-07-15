/**
 * Service : Commandes clients (Orders)
 * Toute la logique métier d'accès à la base de données pour les commandes B2C/B2B.
 */
import prisma from "@/lib/prisma"
import type { Order } from "@/models"

/**
 * Mappe les valeurs Prisma vers le type frontend Order.
 */
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
    quantity: o.quantite,
    offerType: offerTypeMap[o.typeOffre] ?? "simple_qr",
    paymentStatus: paymentMap[o.statutPaiement] ?? "pending",
    status: statusMap[o.statutLivraison] ?? "pending",
    createdAt: o.createdAt.toISOString()
  }
}

/**
 * Récupère toutes les commandes avec les informations client associées.
 */
export async function getAllOrders(): Promise<Order[]> {
  const liste = await prisma.order.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" }
  })
  return liste.map(mapperCommande)
}
