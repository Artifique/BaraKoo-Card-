// API Route : Gestion des organisations clientes (Entreprises)
// Délègue toute la logique métier au OrganizationService
import { NextRequest, NextResponse } from "next/server"
import {
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization
} from "@/services"

export const dynamic = "force-dynamic"

// GET : Récupérer toutes les organisations avec leurs membres
export async function GET() {
  try {
    const organisations = await getAllOrganizations()
    return NextResponse.json(organisations)
  } catch (erreur) {
    console.error("Erreur GET organisations :", erreur)
    return NextResponse.json({ error: "Impossible de récupérer les organisations" }, { status: 500 })
  }
}

// POST : Créer une nouvelle organisation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name) {
      return NextResponse.json({ error: "Le nom de l'organisation est obligatoire" }, { status: 400 })
    }
    if (!body.sector) {
      return NextResponse.json({ error: "Le secteur d'activité est obligatoire" }, { status: 400 })
    }

    const nouvelle = await createOrganization(body)
    return NextResponse.json(nouvelle, { status: 201 })
  } catch (erreur) {
    console.error("Erreur POST organisations :", erreur)
    return NextResponse.json({ error: "Erreur lors de la création de l'organisation" }, { status: 500 })
  }
}

// PUT : Mettre à jour une organisation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "L'identifiant de l'organisation est requis" }, { status: 400 })
    }

    const mise_a_jour = await updateOrganization(id, updates)
    if (!mise_a_jour) {
      return NextResponse.json({ error: "Organisation introuvable" }, { status: 404 })
    }

    return NextResponse.json(mise_a_jour)
  } catch (erreur) {
    console.error("Erreur PUT organisations :", erreur)
    return NextResponse.json({ error: "Erreur lors de la modification" }, { status: 500 })
  }
}

// DELETE : Supprimer une organisation (si aucun titulaire n'est encore rattaché)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "L'identifiant est requis en paramètre de requête ?id=" }, { status: 400 })
    }

    const resultat = await deleteOrganization(id)

    if (!resultat.success) {
      return NextResponse.json({ error: resultat.message }, { status: 409 })
    }

    return NextResponse.json({ success: true, message: resultat.message })
  } catch (erreur) {
    console.error("Erreur DELETE organisations :", erreur)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
