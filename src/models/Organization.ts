/**
 * Modèle : Organisation (Entreprise ou structure partenaire)
 * Une organisation peut regrouper plusieurs titulaires de cartes.
 */
export interface Organization {
  id: string
  name: string        // Dénomination sociale
  logoUrl: string     // Logo de l'organisation
  sector: string      // Secteur d'activité
  description: string // Description courte
  address: string     // Adresse physique
  website: string     // Site web officiel
  phone: string       // Téléphone de contact
  email: string       // Email de contact
}

/**
 * DTO pour créer une organisation.
 */
export type CreateOrganizationDto = Omit<Organization, "id"> & { id?: string }

/**
 * DTO pour mettre à jour une organisation.
 */
export type UpdateOrganizationDto = Partial<Omit<Organization, "id">>
