// Singleton du client Prisma — évite de créer plusieurs connexions en développement
// (Next.js recharge les modules à chaque modification, ce pattern est recommandé)

import { PrismaClient, CardHolder as PrismaHolder, Card as PrismaCard } from "@prisma/client"
import { CardHolder, Card } from "./types"

// --------------------------------------------------------------------------
// Déclaration globale pour préserver l'instance entre les rechargements HMR
// --------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// --------------------------------------------------------------------------
// Création ou réutilisation de l'instance Prisma
// --------------------------------------------------------------------------

const prisma: PrismaClient =
  global.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"] // Journaliser les requêtes SQL en développement
        : ["error"],                  // Seulement les erreurs en production
  })

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

export default prisma

// --------------------------------------------------------------------------
// Fonctions de conversion (Mappers) : Prisma <=> Frontend Types
// --------------------------------------------------------------------------

/**
 * Convertit un enregistrement CardHolder de la base de données (Prisma)
 * vers l'interface CardHolder attendue par le frontend Next.js.
 */
export function mapperPrismaVersHolder(p: any): CardHolder {
  return {
    id: p.id,
    name: p.nom,
    title: p.fonction,
    bio: p.bio ?? "",
    avatarUrl: p.avatarUrl ?? "/avatars/ousmane.png",
    status: p.statut === "ACTIF" ? "active" : "suspended",
    availability: p.disponible ? "available" : "unavailable",
    phone: p.telephone ?? "",
    whatsapp: p.whatsapp ?? "",
    email: p.emailContact ?? "",
    address: p.adresse ?? "",
    googleMapsUrl: p.lienMaps ?? "",
    linkedin: p.linkedin ?? "",
    facebook: p.facebook ?? "",
    instagram: p.instagram ?? "",
    twitter: p.twitter ?? "",
    website: p.siteWeb ?? "",
    organizationId: p.organizationId,
    serviceId: p.serviceId,
    service: p.service ? {
      id: p.service.id,
      nom: p.service.nom,
      description: p.service.description
    } : null
  }
}

/**
 * Convertit un enregistrement Card de la base de données (Prisma)
 * vers l'interface Card attendue par le frontend Next.js.
 */
export function mapperPrismaVersCarte(c: PrismaCard): Card {
  // Traduction du statut de la carte
  let statusFrontend: Card["status"] = "inactive"
  if (c.statut === "ACTIVE") statusFrontend = "active"
  else if (c.statut === "BROUILLON") statusFrontend = "draft"
  else if (c.statut === "PRET_A_PRODUIRE") statusFrontend = "ready_to_produce"
  else if (c.statut === "EN_PRODUCTION") statusFrontend = "in_production"
  else if (c.statut === "ENCODEE") statusFrontend = "encoded"
  else if (c.statut === "EXPEDIEE") statusFrontend = "shipped"

  // Traduction du type de carte
  let typeFrontend: Card["type"] = "both"
  if (c.type === "QR_SEUL") typeFrontend = "qr"
  else if (c.type === "NFC_SEUL") typeFrontend = "nfc"

  return {
    id: c.id,
    type: typeFrontend,
    status: statusFrontend,
    slug: c.slug,
    holderId: c.holderId,
  }
}
