/**
 * Service : Services d'une Organisation (ex: RH, Comptabilité, etc.)
 */
import prisma from "@/lib/prisma"
import type { Service, CreateServiceDto, UpdateServiceDto } from "@/models/Service"

function mapperService(s: any): Service {
  return {
    id: s.id,
    nom: s.nom,
    description: s.description ?? "",
    organizationId: s.organizationId
  }
}

/** Récupère les services d'une organisation donnée */
export async function getServicesByOrganization(organizationId: string): Promise<Service[]> {
  const services = await prisma.service.findMany({
    where: { organizationId },
    orderBy: { nom: "asc" }
  })
  return services.map(mapperService)
}

/** Crée un nouveau service dans une organisation */
export async function createService(data: CreateServiceDto): Promise<Service> {
  const service = await prisma.service.create({
    data: {
      nom: data.nom,
      description: data.description || null,
      organizationId: data.organizationId
    }
  })
  return mapperService(service)
}

/** Met à jour un service existant */
export async function updateService(id: string, data: UpdateServiceDto): Promise<Service | null> {
  try {
    const service = await prisma.service.update({
      where: { id },
      data: {
        nom: data.nom,
        description: data.description,
        organizationId: data.organizationId
      }
    })
    return mapperService(service)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du service:", error)
    return null
  }
}

/** Supprime un service */
export async function deleteService(id: string): Promise<boolean> {
  try {
    await prisma.service.delete({
      where: { id }
    })
    return true
  } catch (error) {
    console.error("Erreur lors de la suppression du service:", error)
    return false
  }
}
