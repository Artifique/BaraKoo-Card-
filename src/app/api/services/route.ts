// API Route : Gestion des services au sein d'une organisation
import { NextRequest, NextResponse } from "next/server"
import {
  getServicesByOrganization,
  createService,
  updateService,
  deleteService
} from "@/services"

export const dynamic = "force-dynamic"

// GET : Récupérer tous les services d'une organisation donnée par organizationId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get("organizationId")

    if (!organizationId) {
      return NextResponse.json({ error: "L'identifiant de l'organisation est obligatoire (?organizationId=)" }, { status: 400 })
    }

    const services = await getServicesByOrganization(organizationId)
    return NextResponse.json(services)
  } catch (erreur) {
    console.error("Erreur GET services :", erreur)
    return NextResponse.json({ error: "Impossible de récupérer les services" }, { status: 500 })
  }
}

// POST : Créer un nouveau service pour une organisation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.nom) {
      return NextResponse.json({ error: "Le nom du service est obligatoire" }, { status: 400 })
    }
    if (!body.organizationId) {
      return NextResponse.json({ error: "L'identifiant de l'organisation est obligatoire" }, { status: 400 })
    }

    const nouveau = await createService(body)
    return NextResponse.json(nouveau, { status: 201 })
  } catch (erreur) {
    console.error("Erreur POST services :", erreur)
    return NextResponse.json({ error: "Erreur lors de la création du service" }, { status: 500 })
  }
}

// PUT : Mettre à jour un service existant
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "L'identifiant du service est requis" }, { status: 400 })
    }

    const mise_a_jour = await updateService(id, updates)
    if (!mise_a_jour) {
      return NextResponse.json({ error: "Service introuvable ou erreur" }, { status: 404 })
    }

    return NextResponse.json(mise_a_jour)
  } catch (erreur) {
    console.error("Erreur PUT services :", erreur)
    return NextResponse.json({ error: "Erreur lors de la modification du service" }, { status: 500 })
  }
}

// DELETE : Supprimer un service
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "L'identifiant est requis en paramètre de requête ?id=" }, { status: 400 })
    }

    const reussite = await deleteService(id)
    if (!reussite) {
      return NextResponse.json({ error: "Le service n'a pas pu être supprimé" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Service supprimé avec succès" })
  } catch (erreur) {
    console.error("Erreur DELETE services :", erreur)
    return NextResponse.json({ error: "Erreur lors de la suppression du service" }, { status: 500 })
  }
}
