/**
 * Service : Titulaires de cartes (CardHolder)
 * Toute la logique métier d'accès à la base de données pour les titulaires.
 * Ces fonctions sont appelées depuis les routes API Next.js.
 */
import prisma, { mapperPrismaVersHolder } from "@/lib/prisma"
import type { CardHolder, CreateCardHolderDto, UpdateCardHolderDto } from "@/models"

/**
 * Récupère tous les titulaires, triés par date de création décroissante.
 */
export async function getAllHolders(): Promise<CardHolder[]> {
  const liste = await prisma.cardHolder.findMany({
    orderBy: { createdAt: "desc" }
  })
  return liste.map(mapperPrismaVersHolder)
}

/**
 * Récupère un titulaire par son identifiant unique.
 * Retourne `null` s'il n'existe pas.
 */
export async function getHolderById(id: string): Promise<CardHolder | null> {
  const titulaire = await prisma.cardHolder.findUnique({
    where: { id }
  })
  if (!titulaire) return null
  return mapperPrismaVersHolder(titulaire)
}

/**
 * Crée une nouvelle fiche titulaire dans la base de données.
 */
export async function createHolder(data: CreateCardHolderDto): Promise<CardHolder> {
  const { id, name, title, bio, avatarUrl, status, availability,
    phone, whatsapp, email, address, googleMapsUrl,
    linkedin, facebook, instagram, twitter, website, organizationId } = data

  const created = await prisma.cardHolder.create({
    data: {
      id: id ?? `BJ-${new Date().getFullYear()}-${Date.now()}`,
      nom: name,
      fonction: title,
      bio: bio ?? "",
      avatarUrl: avatarUrl ?? "/avatars/ousmane.png",
      statut: status === "suspended" ? "SUSPENDU" : "ACTIF",
      disponible: availability !== "unavailable",
      telephone: phone ?? "",
      whatsapp: whatsapp ?? "",
      emailContact: email ?? "",
      adresse: address ?? "",
      lienMaps: googleMapsUrl ?? "",
      linkedin: linkedin ?? "",
      facebook: facebook ?? "",
      instagram: instagram ?? "",
      twitter: twitter ?? "",
      siteWeb: website ?? "",
      organizationId: organizationId ?? null
    }
  })
  return mapperPrismaVersHolder(created)
}

/**
 * Met à jour les informations d'un titulaire existant.
 * Seuls les champs fournis sont modifiés.
 */
export async function updateHolder(id: string, data: UpdateCardHolderDto): Promise<CardHolder | null> {
  const dataUpdate: Record<string, unknown> = {}

  if (data.name !== undefined)         dataUpdate.nom = data.name
  if (data.title !== undefined)        dataUpdate.fonction = data.title
  if (data.bio !== undefined)          dataUpdate.bio = data.bio
  if (data.avatarUrl !== undefined)    dataUpdate.avatarUrl = data.avatarUrl
  if (data.status !== undefined)       dataUpdate.statut = data.status === "active" ? "ACTIF" : "SUSPENDU"
  if (data.availability !== undefined) dataUpdate.disponible = data.availability === "available"
  if (data.phone !== undefined)        dataUpdate.telephone = data.phone
  if (data.whatsapp !== undefined)     dataUpdate.whatsapp = data.whatsapp
  if (data.email !== undefined)        dataUpdate.emailContact = data.email
  if (data.address !== undefined)      dataUpdate.adresse = data.address
  if (data.googleMapsUrl !== undefined) dataUpdate.lienMaps = data.googleMapsUrl
  if (data.linkedin !== undefined)     dataUpdate.linkedin = data.linkedin
  if (data.facebook !== undefined)     dataUpdate.facebook = data.facebook
  if (data.instagram !== undefined)    dataUpdate.instagram = data.instagram
  if (data.twitter !== undefined)      dataUpdate.twitter = data.twitter
  if (data.website !== undefined)      dataUpdate.siteWeb = data.website
  if (data.organizationId !== undefined) dataUpdate.organizationId = data.organizationId

  try {
    const updated = await prisma.cardHolder.update({ where: { id }, data: dataUpdate })
    return mapperPrismaVersHolder(updated)
  } catch {
    return null
  }
}
