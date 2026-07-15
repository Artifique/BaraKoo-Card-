// API Route : Gestion des titulaires de cartes
// Délègue toute la logique métier au HolderService
import { NextRequest, NextResponse } from "next/server"
import { getAllHolders, createHolder, updateHolder } from "@/services"

// GET : Récupérer tous les titulaires
export async function GET() {
  try {
    const holders = await getAllHolders()
    return NextResponse.json(holders)
  } catch (erreur) {
    console.error("Erreur GET holders :", erreur)
    return NextResponse.json({ error: "Impossible de récupérer les profils" }, { status: 500 })
  }
}

// PUT : Mettre à jour un titulaire
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 })

    const updated = await updateHolder(id, updates)
    if (!updated) return NextResponse.json({ error: "Titulaire non trouvé" }, { status: 404 })

    return NextResponse.json(updated)
  } catch (erreur) {
    console.error("Erreur PUT holders :", erreur)
    return NextResponse.json({ error: "Erreur lors de la modification" }, { status: 500 })
  }
}

// POST : Créer un nouveau titulaire
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.name || !body.title) {
      return NextResponse.json({ error: "Nom et Poste requis" }, { status: 400 })
    }
    const created = await createHolder(body)
    return NextResponse.json(created, { status: 201 })
  } catch (erreur) {
    console.error("Erreur POST holders :", erreur)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
