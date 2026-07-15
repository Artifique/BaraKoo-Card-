/**
 * Service : Organisations
 * Toute la logique métier d'accès à la base de données pour les organisations.
 */
import prisma from "@/lib/prisma"
import type { Organization } from "@/models"

// ─────────────────────────────────────────────────────────────────────────────
// Mapper Prisma → Modèle Frontend
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Lecture
// ─────────────────────────────────────────────────────────────────────────────

/** Récupère toutes les organisations avec le nombre de titulaires rattachés. */
export async function getAllOrganizations(): Promise<Organization[]> {
  const liste = await prisma.organization.findMany({
    orderBy: { nom: "asc" },
    include: {
      // Inclure les titulaires pour pouvoir compter et afficher les collaborateurs
      titulaires: {
        select: {
          id: true,
          nom: true,
          fonction: true,
          avatarUrl: true,
          disponible: true
        }
      },
      // Inclure les services
      services: {
        orderBy: { nom: "asc" }
      }
    }
  })
  return liste.map((o: any) => ({
    ...mapperOrganisation(o),
    // Champ enrichi : liste simplifiée des collaborateurs
    membres: o.titulaires?.map((t: any) => ({
      id: t.id,
      nom: t.nom,
      fonction: t.fonction,
      avatarUrl: t.avatarUrl ?? ""
    })) ?? [],
    // Champ enrichi : liste des services
    services: o.services?.map((s: any) => ({
      id: s.id,
      nom: s.nom,
      description: s.description ?? ""
    })) ?? []
  })) as any
}

/** Récupère une organisation par son identifiant. */
export async function getOrganizationById(id: string): Promise<Organization | null> {
  const org = await prisma.organization.findUnique({ where: { id } })
  if (!org) return null
  return mapperOrganisation(org)
}

// ─────────────────────────────────────────────────────────────────────────────
// Création
// ─────────────────────────────────────────────────────────────────────────────

/** Crée une nouvelle organisation cliente. */
export async function createOrganization(data: Omit<Organization, "id"> & { id?: string }): Promise<Organization> {
  const nouvelle = await prisma.organization.create({
    data: {
      id: data.id,
      nom: data.name,
      logoUrl: data.logoUrl || null,
      secteur: data.sector || null,
      description: data.description || null,
      adresse: data.address || null,
      siteWeb: data.website || null,
      telephone: data.phone || null,
      email: data.email || null,
    }
  })
  return mapperOrganisation(nouvelle)
}

// ─────────────────────────────────────────────────────────────────────────────
// Modification
// ─────────────────────────────────────────────────────────────────────────────

/** Met à jour les informations d'une organisation existante. */
export async function updateOrganization(id: string, data: Partial<Omit<Organization, "id">>): Promise<Organization | null> {
  try {
    const mise_a_jour = await prisma.organization.update({
      where: { id },
      data: {
        nom: data.name,
        logoUrl: data.logoUrl,
        secteur: data.sector,
        description: data.description,
        adresse: data.address,
        siteWeb: data.website,
        telephone: data.phone,
        email: data.email,
      }
    })
    return mapperOrganisation(mise_a_jour)
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Suppression
// ─────────────────────────────────────────────────────────────────────────────

/** 
 * Supprime une organisation si elle ne possède plus de titulaires rattachés.
 * Retourne true si la suppression a réussi, false sinon.
 */
export async function deleteOrganization(id: string): Promise<{ success: boolean; message: string }> {
  // Vérifier s'il reste des titulaires liés
  const nbTitulaires = await prisma.cardHolder.count({ where: { organizationId: id } })
  if (nbTitulaires > 0) {
    return {
      success: false,
      message: `Impossible de supprimer : ${nbTitulaires} titulaire(s) sont encore rattaché(s) à cette organisation.`
    }
  }

  await prisma.organization.delete({ where: { id } })
  return { success: true, message: "Organisation supprimée avec succès." }
}
