// Script de peuplement initial de la base de données (Seed Prisma)
// Commande d'exécution : npx prisma db seed
// Utilise la DIRECT_URL (session mode) pour éviter les timeouts du pooler

import { PrismaClient } from "@prisma/client"
import { hashPassword } from "../src/lib/auth"

// Utiliser la connexion directe pour le seed (plus stable pour les insertions en masse)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL ?? process.env.DATABASE_URL
    }
  }
})

async function main() {
  console.log("Début du peuplement de la base de données...")

  // 1. Nettoyer dans l'ordre inverse des clés étrangères
  await prisma.activityLog.deleteMany()
  await prisma.cardScan.deleteMany()
  await prisma.contactSave.deleteMany()
  await prisma.card.deleteMany()
  await prisma.cardHolder.deleteMany()
  await prisma.organization.deleteMany()
  await prisma.order.deleteMany()
  await prisma.client.deleteMany()
  await prisma.admin.deleteMany()

  // 2. Administrateur par défaut
  const admin = await prisma.admin.create({
    data: {
      email: "admin@baarako.com",
      nom: "Admin Baarako",
      passwordHash: hashPassword("BarakoCard@2026"),
      role: "SUPER_ADMIN"
    }
  })
  console.log("Administrateur créé :", admin.email)

  // 3. Organisation de démo
  const org = await prisma.organization.create({
    data: {
      id: "org-1",
      nom: "Baarako Jobcard",
      logoUrl: "/avatars/ousmane.png",
      secteur: "Recrutement & Technologies",
      description: "La plateforme de contact et de recrutement intelligente en Afrique.",
      adresse: "Bamako, Mali",
      siteWeb: "https://jobcard.africa",
      telephone: "+223 70 00 00 00",
      email: "contact@jobcard.africa"
    }
  })
  console.log("Organisation créée :", org.nom)

  // 4. Titulaires (insertion en masse)
  await prisma.cardHolder.createMany({
    data: [
      {
        id: "BJ-2024-000125",
        nom: "Ousmane Diarra",
        fonction: "Co-fondateur & CTO",
        bio: "Passionné par l'innovation technologique et l'impact social en Afrique de l'Ouest. Développeur Full-Stack avec plus de 5 ans d'expérience.",
        avatarUrl: "/avatars/ousmane.png",
        statut: "ACTIF",
        disponible: true,
        telephone: "+223 76 54 32 10",
        whatsapp: "+223 76 54 32 10",
        emailContact: "ousmane.diarra@baarako.com",
        adresse: "ACI 2000, Bamako, Mali",
        lienMaps: "https://maps.app.goo.gl/uX7G8S4Z9pL2vM5y7",
        linkedin: "https://linkedin.com/in/ousmane-diarra",
        facebook: "https://facebook.com/ousmane.diarra",
        instagram: "https://instagram.com/ousmane_diarra",
        twitter: "https://twitter.com/ousmane_diarra",
        siteWeb: "https://baarako.com",
        organizationId: "org-1"
      },
      {
        id: "BJ-2024-000126",
        nom: "Tahirou Berthé",
        fonction: "Chargé de Relations Clients",
        bio: "Expert en relations publiques et gestion de comptes clients. Toujours à l'écoute pour offrir le meilleur service possible aux partenaires Baarako.",
        avatarUrl: "/avatars/tahirou.png",
        statut: "ACTIF",
        disponible: false,
        telephone: "+223 66 77 88 99",
        whatsapp: "+223 66 77 88 99",
        emailContact: "tahirou.berthe@baarako.com",
        adresse: "Sébénikoro, Bamako, Mali",
        lienMaps: "https://maps.app.goo.gl/uX7G8S4Z9pL2vM5y7",
        linkedin: "https://linkedin.com/in/tahirou-berthe",
        facebook: "",
        instagram: "",
        twitter: "",
        siteWeb: "",
        organizationId: "org-1"
      },
      {
        id: "BJ-2024-000127",
        nom: "Namba Coulibaly",
        fonction: "Responsable Design UI/UX",
        bio: "Créative et minutieuse, je conçois des interfaces engageantes et adaptées aux utilisateurs africains pour le produit Baarako Card.",
        avatarUrl: "/avatars/namba.png",
        statut: "ACTIF",
        disponible: true,
        telephone: "+223 70 11 22 33",
        whatsapp: "+223 70 11 22 33",
        emailContact: "namba.coulibaly@baarako.com",
        adresse: "Badalabougou, Bamako, Mali",
        lienMaps: "https://maps.app.goo.gl/uX7G8S4Z9pL2vM5y7",
        linkedin: "https://linkedin.com/in/namba-coulibaly",
        facebook: "",
        instagram: "https://instagram.com/namba_design",
        twitter: "",
        siteWeb: "",
        organizationId: "org-1"
      }
    ]
  })
  console.log("Titulaires créés : Ousmane Diarra, Tahirou Berthé, Namba Coulibaly")

  // 5. Cartes associées aux titulaires
  await prisma.card.createMany({
    data: [
      { id: "card-1", type: "LES_DEUX", statut: "ACTIVE", slug: "ousmane-diarra",  holderId: "BJ-2024-000125" },
      { id: "card-2", type: "LES_DEUX", statut: "ACTIVE", slug: "tahirou-berthe",  holderId: "BJ-2024-000126" },
      { id: "card-3", type: "LES_DEUX", statut: "ACTIVE", slug: "namba-coulibaly", holderId: "BJ-2024-000127" }
    ]
  })
  console.log("Cartes créées : ousmane-diarra, tahirou-berthe, namba-coulibaly")

  // 6. Statistiques de scans (createMany — 1 seule requête SQL)
  const now = Date.now()
  const jour = 24 * 60 * 60 * 1000

  const scans = [
    // card-1 : 145 scans
    ...Array.from({ length: 97 }, (_, i) => ({ cardId: "card-1", methode: "QR_CODE" as const, appareil: i % 2 === 0 ? "iPhone" : "Android", createdAt: new Date(now - (i % 10) * jour) })),
    ...Array.from({ length: 48 }, (_, i) => ({ cardId: "card-1", methode: "NFC" as const,     appareil: i % 2 === 0 ? "iPhone" : "Android", createdAt: new Date(now - (i % 10) * jour) })),
    // card-2 : 82 scans
    ...Array.from({ length: 55 }, (_, i) => ({ cardId: "card-2", methode: "QR_CODE" as const, appareil: i % 2 === 0 ? "Samsung" : "iPhone", createdAt: new Date(now - (i % 7) * jour) })),
    ...Array.from({ length: 27 }, (_, i) => ({ cardId: "card-2", methode: "NFC" as const,     appareil: i % 2 === 0 ? "Samsung" : "iPhone", createdAt: new Date(now - (i % 7) * jour) })),
    // card-3 : 110 scans
    ...Array.from({ length: 74 }, (_, i) => ({ cardId: "card-3", methode: "QR_CODE" as const, appareil: i % 2 === 0 ? "Android" : "iPhone", createdAt: new Date(now - (i % 8) * jour) })),
    ...Array.from({ length: 36 }, (_, i) => ({ cardId: "card-3", methode: "NFC" as const,     appareil: i % 2 === 0 ? "Android" : "iPhone", createdAt: new Date(now - (i % 8) * jour) }))
  ]
  await prisma.cardScan.createMany({ data: scans })
  console.log(`Scans créés : ${scans.length} au total`)

  // 7. Statistiques de sauvegardes de contact (createMany)
  const saves = [
    ...Array.from({ length: 85 }, (_, i) => ({ cardId: "card-1", createdAt: new Date(now - (i % 8) * jour) })),
    ...Array.from({ length: 38 }, (_, i) => ({ cardId: "card-2", createdAt: new Date(now - (i % 6) * jour) })),
    ...Array.from({ length: 62 }, (_, i) => ({ cardId: "card-3", createdAt: new Date(now - (i % 7) * jour) }))
  ]
  await prisma.contactSave.createMany({ data: saves })
  console.log(`Sauvegardes créées : ${saves.length} au total`)

  // 8. Clients et commandes
  await prisma.client.createMany({
    data: [
      { id: "client-1", nom: "Sékou Keïta",        email: "sekou.keita@gmail.com",              telephone: "+223 75 00 11 22" },
      { id: "client-2", nom: "Ousmane Diarra",      email: "ousmane.diarra@baarako.com",         telephone: "+223 76 54 32 10" },
      { id: "client-3", nom: "Fatoumata Diallo",    email: "fatoumata.diallo@outlook.com",       telephone: "+223 60 44 55 66" }
    ]
  })

  await prisma.order.createMany({
    data: [
      { id: "ORD-2026-001", quantite: 5, typeOffre: "PACK_ENTREPRISE",  statutPaiement: "PAYE",       statutLivraison: "LIVREE",    clientId: "client-1" },
      { id: "ORD-2026-002", quantite: 1, typeOffre: "CARTE_NFC_QR",     statutPaiement: "PAYE",       statutLivraison: "LIVREE",    clientId: "client-2" },
      { id: "ORD-2026-003", quantite: 2, typeOffre: "CARTE_SIMPLE_QR",  statutPaiement: "EN_ATTENTE", statutLivraison: "EN_ATTENTE", clientId: "client-3" }
    ]
  })
  console.log("Commandes créées : 3 commandes clients")

  // 9. Journal d'activité initial
  await prisma.activityLog.create({
    data: {
      action: "INITIALISATION_SYSTEME",
      description: "Peuplement de la base de données avec les titulaires de démonstration.",
      adminId: admin.id
    }
  })

  console.log("Peuplement terminé avec succès ! 🎉")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
