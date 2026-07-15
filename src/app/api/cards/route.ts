// API Route : Gestion des cartes physiques NFC / QR Code
// Délègue toute la logique métier au CardService
import { NextRequest, NextResponse } from "next/server"
import { getAllCardsWithStats, createCard, updateCard } from "@/services"

// GET : Récupérer toutes les cartes et leurs statistiques
export async function GET() {
  try {
    const data = await getAllCardsWithStats()
    return NextResponse.json(data)
  } catch (erreur) {
    console.error("Erreur GET cards :", erreur)
    return NextResponse.json({ error: "Impossible de récupérer les cartes" }, { status: 500 })
  }
}

// PUT : Modifier le statut ou la configuration d'une carte
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 })

    const updated = await updateCard(id, updates)
    if (!updated) return NextResponse.json({ error: "Carte non trouvée" }, { status: 404 })

    return NextResponse.json(updated)
  } catch (erreur) {
    console.error("Erreur PUT cards :", erreur)
    return NextResponse.json({ error: "Erreur lors de la modification" }, { status: 500 })
  }
}

// POST : Créer une nouvelle carte physique
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.slug || !body.holderId) {
      return NextResponse.json({ error: "Slug et HolderId requis" }, { status: 400 })
    }
    const created = await createCard(body)
    return NextResponse.json(created, { status: 201 })
  } catch (erreur) {
    console.error("Erreur POST cards :", erreur)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
