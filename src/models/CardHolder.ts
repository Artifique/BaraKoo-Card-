/**
 * Modèle : Titulaire de carte de contact (CardHolder)
 * Représente un profil professionnel lié à une carte NFC/QR physique.
 */
export interface CardHolder {
  id: string              // Format : BJ-2024-000001
  name: string            // Nom complet du titulaire
  title: string           // Poste / Fonction
  bio: string             // Biographie courte
  avatarUrl: string       // URL de la photo de profil
  status: "active" | "suspended"
  availability: "available" | "unavailable"

  // Coordonnées de contact
  phone: string
  whatsapp: string
  email: string
  address: string
  googleMapsUrl: string

  // Réseaux sociaux
  linkedin: string
  facebook: string
  instagram: string
  twitter: string
  website: string

  // Relation organisation (optionnelle)
  organizationId: string | null

  // Relation service (optionnelle)
  serviceId?: string | null
  service?: {
    id: string
    nom: string
    description?: string | null
  } | null

  // Documents
  cvUrl?: string | null
  lettreMotivationUrl?: string | null
}

/**
 * Données minimales pour créer un nouveau titulaire via le formulaire admin.
 */
export type CreateCardHolderDto = Omit<CardHolder, "id"> & { id?: string }

/**
 * Données partielles pour mettre à jour un titulaire existant.
 */
export type UpdateCardHolderDto = Partial<Omit<CardHolder, "id">>
