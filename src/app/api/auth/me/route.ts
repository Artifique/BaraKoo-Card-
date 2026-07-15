// API pour récupérer la session administrateur en cours
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { decryptSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("baarako_session")

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { authenticated: false, message: "Non authentifié." },
        { status: 401 }
      )
    }

    const session = decryptSession(sessionCookie.value)

    if (!session) {
      return NextResponse.json(
        { authenticated: false, message: "Session expirée ou invalide." },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        id: session.id,
        nom: session.nom,
        email: session.email,
        role: session.role,
      },
    })
  } catch (erreur) {
    console.error("Erreur récupération session API :", erreur)
    return NextResponse.json(
      { authenticated: false, message: "Erreur serveur." },
      { status: 500 }
    )
  }
}
