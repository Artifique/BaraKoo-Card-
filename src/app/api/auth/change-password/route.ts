// API pour changer le mot de passe de l'administrateur connecté
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"
import { decryptSession, verifyPassword, hashPassword } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    // 1. Récupération de la session en cours
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("baarako_session")

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { message: "Vous devez être connecté pour effectuer cette action." },
        { status: 401 }
      )
    }

    const session = decryptSession(sessionCookie.value)
    if (!session) {
      return NextResponse.json(
        { message: "Session expirée ou invalide. Veuillez vous reconnecter." },
        { status: 401 }
      )
    }

    // 2. Extraction des données de modification
    const { oldPassword, newPassword, confirmPassword } = await request.json()

    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: "Tous les champs de mot de passe sont obligatoires." },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "Le nouveau mot de passe et sa confirmation ne correspondent pas." },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Le nouveau mot de passe doit comporter au moins 6 caractères." },
        { status: 400 }
      )
    }

    // 3. Récupération de l'admin complet
    const admin = await prisma.admin.findUnique({
      where: { id: session.id },
    })

    if (!admin) {
      return NextResponse.json(
        { message: "Administrateur introuvable." },
        { status: 404 }
      )
    }

    // 4. Vérification de l'ancien mot de passe
    const ancienCorrect = verifyPassword(oldPassword, admin.passwordHash)
    if (!ancienCorrect) {
      return NextResponse.json(
        { message: "Le mot de passe actuel saisi est incorrect." },
        { status: 400 }
      )
    }

    // 5. Mise à jour du mot de passe
    const nouveauHash = hashPassword(newPassword)
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash: nouveauHash,
      },
    })

    // 6. Journaliser l'activité
    await prisma.activityLog.create({
      data: {
        action: "MODIFICATION_MOT_DE_PASSE",
        description: `Modification réussie du mot de passe de l'administrateur ${admin.nom}.`,
        adminId: admin.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Votre mot de passe a été modifié avec succès.",
    })
  } catch (erreur) {
    console.error("Erreur modification mot de passe API :", erreur)
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la modification du mot de passe." },
      { status: 500 }
    )
  }
}
