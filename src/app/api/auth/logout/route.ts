// API de déconnexion de l'administrateur
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Supprimer le cookie de session en le marquant comme expiré
    cookieStore.set("baarako_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    })

    return NextResponse.json({
      success: true,
      message: "Déconnexion réussie.",
    })
  } catch (erreur) {
    console.error("Erreur de déconnexion API :", erreur)
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la déconnexion." },
      { status: 500 }
    )
  }
}
