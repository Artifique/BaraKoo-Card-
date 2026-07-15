/**
 * Modèle : Commande client (B2C ou B2B)
 * Représente une commande de cartes physiques passée par un client.
 */
export interface Order {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string   // Téléphone du client commanditaire
  quantity: number
  offerType: "simple_qr" | "nfc_qr" | "enterprise"
  paymentStatus: "pending" | "paid" | "refunded"
  status: "pending" | "processing" | "shipped" | "delivered"
  notes: string         // Notes ou remarques internes sur la commande
  createdAt: string     // Horodatage ISO 8601
}

/**
 * DTO pour créer une commande.
 */
export type CreateOrderDto = {
  clientName: string
  clientEmail?: string
  clientPhone?: string
  quantity: number
  offerType: "simple_qr" | "nfc_qr" | "enterprise"
  paymentStatus?: "pending" | "paid" | "refunded"
  notes?: string
}

/**
 * DTO pour mettre à jour le statut d'une commande.
 */
export type UpdateOrderDto = Partial<Pick<Order, "paymentStatus" | "status" | "quantity" | "offerType" | "notes">>
