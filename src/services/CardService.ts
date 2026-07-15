/**
 * Service : Cartes physiques NFC / QR Code
 * Toute la logique métier d'accès à la base de données pour les cartes.
 * Ces fonctions sont appelées depuis les routes API Next.js.
 */
import prisma, { mapperPrismaVersCarte } from "@/lib/prisma"
import type { Card, CardStats, CreateCardDto, UpdateCardDto } from "@/models"

/**
 * Récupère toutes les cartes avec leurs statistiques agrégées.
 */
export async function getAllCardsWithStats(): Promise<{ cards: Card[]; stats: CardStats[] }> {
  const listePrisma = await prisma.card.findMany({
    include: { scans: true, saves: true },
    orderBy: { createdAt: "desc" }
  })

  const cards = listePrisma.map(mapperPrismaVersCarte)

  const stats: CardStats[] = listePrisma.map((c: any) => {
    const qrScans = c.scans.filter((s: any) => s.methode === "QR_CODE").length
    const nfcScans = c.scans.filter((s: any) => s.methode === "NFC").length
    const lastScanAt = c.scans.length > 0
      ? new Date(Math.max(...c.scans.map((s: any) => new Date(s.createdAt).getTime()))).toISOString()
      : null

    return {
      cardId: c.id,
      scans: c.scans.length,
      saves: c.saves.length,
      qrScans,
      nfcScans,
      lastScanAt
    }
  })

  return { cards, stats }
}

/**
 * Récupère une carte par son slug unique (URL publique).
 */
export async function getCardBySlug(slug: string): Promise<Card | null> {
  const carte = await prisma.card.findUnique({ where: { slug } })
  if (!carte) return null
  return mapperPrismaVersCarte(carte)
}

/**
 * Crée une nouvelle carte physique et l'associe à un titulaire.
 */
export async function createCard(data: CreateCardDto): Promise<Card> {
  const typeMap = { qr: "QR_SEUL", nfc: "NFC_SEUL", both: "LES_DEUX" } as const

  const created = await prisma.card.create({
    data: {
      id: data.id,
      type: typeMap[data.type] ?? "LES_DEUX",
      statut: "ACTIVE",
      slug: data.slug,
      holderId: data.holderId
    }
  })
  return mapperPrismaVersCarte(created)
}

/**
 * Met à jour le statut ou la configuration d'une carte.
 */
export async function updateCard(id: string, data: UpdateCardDto): Promise<Card | null> {
  const typeMap = { qr: "QR_SEUL", nfc: "NFC_SEUL", both: "LES_DEUX" } as const
  const statutMap = { active: "ACTIVE", inactive: "INACTIVE" } as const

  const dataUpdate: Record<string, unknown> = {}
  if (data.slug !== undefined)   dataUpdate.slug = data.slug
  if (data.type !== undefined)   dataUpdate.type = typeMap[data.type]
  if (data.status !== undefined) dataUpdate.statut = statutMap[data.status as "active" | "inactive"] ?? "INACTIVE"

  try {
    const updated = await prisma.card.update({ where: { id }, data: dataUpdate })
    return mapperPrismaVersCarte(updated)
  } catch {
    return null
  }
}

/**
 * Enregistre un scan de carte (QR Code ou NFC) dans les statistiques.
 */
export async function recordScan(cardId: string, methode: "QR_CODE" | "NFC", appareil?: string): Promise<void> {
  await prisma.cardScan.create({
    data: { cardId, methode, appareil: appareil ?? "Inconnu" }
  })
}

/**
 * Enregistre un enregistrement de contact (téléchargement vCard).
 */
export async function recordSave(cardId: string): Promise<void> {
  await prisma.contactSave.create({
    data: { cardId }
  })
}
