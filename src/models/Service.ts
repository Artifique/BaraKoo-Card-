/**
 * Modèle : Service d'une Organisation (ex: RH, Comptabilité, etc.)
 */
export interface Service {
  id: string
  nom: string
  description?: string | null
  organizationId: string
  createdAt?: Date
  updatedAt?: Date
}

/**
 * DTO pour créer un service.
 */
export type CreateServiceDto = Omit<Service, "id" | "createdAt" | "updatedAt"> & { id?: string }

/**
 * DTO pour mettre à jour un service.
 */
export type UpdateServiceDto = Partial<Omit<Service, "id" | "createdAt" | "updatedAt">>
