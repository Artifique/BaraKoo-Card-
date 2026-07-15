// API Route : Gestion des commandes clients (Orders)
// Délègue toute la logique métier au OrderService
import { NextRequest, NextResponse } from "next/server"
import {
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder
} from "@/services"

export const dynamic = "force-dynamic"

// GET : Récupérer toutes les commandes avec les infos client
export async function GET() {
  try {
    const commandes = await getAllOrders()
    return NextResponse.json(commandes)
  } catch (erreur) {
    console.error("Erreur GET commandes :", erreur)
    return NextResponse.json({ error: "Impossible de récupérer les commandes" }, { status: 500 })
  }
}

// POST : Créer une nouvelle commande (avec le client associé)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.clientName) {
      return NextResponse.json({ error: "Le nom du client est obligatoire" }, { status: 400 })
    }
    if (!body.quantity || body.quantity < 1) {
      return NextResponse.json({ error: "La quantité doit être au moins de 1" }, { status: 400 })
    }
    if (!body.offerType) {
      return NextResponse.json({ error: "Le type d'offre est obligatoire" }, { status: 400 })
    }

    const nouvelle = await createOrder(body)
    return NextResponse.json(nouvelle, { status: 201 })
  } catch (erreur) {
    console.error("Erreur POST commandes :", erreur)
    return NextResponse.json({ error: "Erreur lors de la création de la commande" }, { status: 500 })
  }
}

// PUT : Mettre à jour une commande (statuts, quantité, notes...)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "L'identifiant de la commande est requis" }, { status: 400 })
    }

    const mise_a_jour = await updateOrder(id, updates)
    if (!mise_a_jour) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 })
    }

    return NextResponse.json(mise_a_jour)
  } catch (erreur) {
    console.error("Erreur PUT commandes :", erreur)
    return NextResponse.json({ error: "Erreur lors de la modification de la commande" }, { status: 500 })
  }
}

// DELETE : Supprimer une commande
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "L'identifiant est requis en paramètre de requête ?id=" }, { status: 400 })
    }

    const success = await deleteOrder(id)
    if (!success) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Commande supprimée avec succès." })
  } catch (erreur) {
    console.error("Erreur DELETE commandes :", erreur)
    return NextResponse.json({ error: "Erreur lors de la suppression de la commande" }, { status: 500 })
  }
}
