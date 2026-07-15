/**
 * Modèle : Carte physique NFC / QR Code
 * Représente une carte physique associée à un titulaire.
 */
export interface Card {
  id: string
  type: "qr" | "nfc" | "both"
  status: "draft" | "ready_to_produce" | "in_production" | "encoded" | "shipped" | "active" | "inactive"
  slug: string        // Identifiant URL unique : baarako.card/[slug]
  holderId: string    // Référence au titulaire propriétaire
}

/**
 * Modèle : Statistiques agrégées d'une carte
 */
export interface CardStats {
  cardId: string
  scans: number       // Nombre total de scans (QR + NFC)
  saves: number       // Nombre de contacts enregistrés (téléchargement vCard)
  qrScans: number     // Scans via QR Code
  nfcScans: number    // Scans via NFC
  lastScanAt: string | null  // Horodatage du dernier scan
}

/**
 * DTO pour créer une nouvelle carte.
 */
export type CreateCardDto = {
  id?: string
  type: Card["type"]
  slug: string
  holderId: string
}

/**
 * DTO pour mettre à jour le statut d'une carte.
 */
export type UpdateCardDto = Partial<Pick<Card, "type" | "status" | "slug">>
