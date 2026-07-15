/**
 * Service : Organisations
 * Toute la logique métier d'accès à la base de données pour les organisations.
 */
import prisma from "@/lib/prisma"
import type { Organization } from "@/models"

/**
 * Convertit un enregistrement Prisma Organization vers le type frontend.
 */
function mapperOrganisation(o: any): Organization {
  return {
    id: o.id,
    name: o.nom,
    logoUrl: o.logoUrl ?? "",
    sector: o.secteur ?? "",
    description: o.description ?? "",
    address: o.adresse ?? "",
    website: o.siteWeb ?? "",
    phone: o.telephone ?? "",
    email: o.email ?? ""
  }
}

/**
 * Récupère toutes les organisations.
 */
export async function getAllOrganizations(): Promise<Organization[]> {
  const liste = await prisma.organization.findMany({
    orderBy: { nom: "asc" }
  })
  return liste.map(mapperOrganisation)
}

/**
 * Récupère une organisation par son identifiant.
 */
export async function getOrganizationById(id: string): Promise<Organization | null> {
  const org = await prisma.organization.findUnique({ where: { id } })
  if (!org) return null
  return mapperOrganisation(org)
}
