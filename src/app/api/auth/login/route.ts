// API de connexion de l'administrateur
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"
import { verifyPassword, encryptSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // 1. Validation basique
    if (!email || !password) {
      return NextResponse.json(
        { message: "Veuillez fournir un e-mail et un mot de passe." },
        { status: 400 }
      )
    }

    // 2. Recherche de l'administrateur
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!admin) {
      return NextResponse.json(
        { message: "Identifiants incorrects." },
        { status: 401 }
      )
    }

    // 3. Vérification du mot de passe
    const motDePasseCorrect = verifyPassword(password, admin.passwordHash)
    if (!motDePasseCorrect) {
      return NextResponse.json(
        { message: "Identifiants incorrects." },
        { status: 401 }
      )
    }

    // 4. Création des données de session
    const dateExpiration = new Date()
    dateExpiration.setDate(dateExpiration.getDate() + 1) // Expiration dans 24h

    const sessionPayload = {
      id: admin.id,
      email: admin.email,
      nom: admin.nom,
      role: admin.role,
      expires: dateExpiration.toISOString(),
    }

    // Chiffrement du payload
    const token = encryptSession(sessionPayload)

    // 5. Définition du cookie de session
    const cookieStore = await cookies()
    cookieStore.set("baarako_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: dateExpiration,
      path: "/",
    })

    // Ajouter un journal d'activité
    await prisma.activityLog.create({
      data: {
        action: "CONNEXION_ADMIN",
        description: `Connexion réussie de l'administrateur ${admin.nom} (${admin.email}).`,
        adminId: admin.id,
      },
    })

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        nom: admin.nom,
        email: admin.email,
        role: admin.role,
      },
    })
  } catch (erreur) {
    console.error("Erreur de connexion API :", erreur)
    return NextResponse.json(
      { message: "Une erreur interne est survenue lors de la connexion." },
      { status: 500 }
    )
  }
}
