// API Route : Upload de fichiers dans Supabase Storage (bucket-images)
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // service_role pour bypasser le RLS Storage

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Configuration Supabase manquante dans .env" }, { status: 500 })
    }

    // Créer un nom de fichier unique sécurisé
    const extension = file.name.split(".").pop() || "png"
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileName = `logo-${Date.now()}-${randomId}.${extension}`

    // Lire les données du fichier sous forme de buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Appeler l'API de stockage Supabase directement
    const uploadUrl = `${supabaseUrl}/storage/v1/object/bucket-images/${fileName}`

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "apikey": supabaseKey,
        "Content-Type": file.type || "image/png"
      },
      body: buffer
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erreur d'upload Supabase Storage :", errorText)
      return NextResponse.json({ error: "Erreur lors de l'envoi vers le stockage Supabase" }, { status: response.status })
    }

    // Construire l'URL publique de l'image stockée
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/bucket-images/${fileName}`

    return NextResponse.json({ url: publicUrl })
  } catch (erreur) {
    console.error("Erreur lors de l'upload :", erreur)
    return NextResponse.json({ error: "Erreur interne du serveur lors de l'upload" }, { status: 500 })
  }
}
