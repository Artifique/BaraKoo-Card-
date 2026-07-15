/**
 * Modèle : Commande client (B2C ou B2B)
 * Représente une commande de cartes physiques passée par un client.
 */
export interface Order {
  id: string
  clientName: string
  clientEmail: string
  quantity: number
  offerType: "simple_qr" | "nfc_qr" | "enterprise"
  paymentStatus: "pending" | "paid" | "refunded"
  status: "pending" | "processing" | "shipped" | "delivered"
  createdAt: string   // Horodatage ISO 8601
}

/**
 * DTO pour créer une commande.
 */
export type CreateOrderDto = Omit<Order, "id" | "createdAt"> & { id?: string }

/**
 * DTO pour mettre à jour le statut d'une commande.
 */
export type UpdateOrderDto = Partial<Pick<Order, "paymentStatus" | "status">>
