// API Route : Génération et téléchargement de fichier .vcf (vCard)
import { NextRequest, NextResponse } from "next/server"
import prisma, { mapperPrismaVersHolder } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Rechercher d'abord par slug de carte
    let carte = await prisma.card.findUnique({
      where: { slug: id }
    })
    
    let titulaire = null

    if (carte) {
      titulaire = await prisma.cardHolder.findUnique({
        where: { id: carte.holderId },
        include: { organisation: true }
      })
    } else {
      // Sinon rechercher directement par l'identifiant du titulaire
      titulaire = await prisma.cardHolder.findUnique({
        where: { id },
        include: { organisation: true }
      })
      
      if (titulaire) {
        carte = await prisma.card.findFirst({
          where: { holderId: titulaire.id }
        })
      }
    }
    
    if (!titulaire) {
      return NextResponse.json({ error: "Contact non trouvé" }, { status: 404 })
    }

    // Si la carte est active, enregistrer la statistique de sauvegarde de contact
    if (carte && carte.statut === "ACTIVE") {
      await prisma.contactSave.create({
        data: {
          cardId: carte.id
        }
      })
    }

    const org = titulaire.organisation
    const holderMapped = mapperPrismaVersHolder(titulaire)

    // Générer les lignes du fichier vCard (version 3.0 compatible avec iOS et Android)
    const vCardLines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${holderMapped.name}`,
      `N:${holderMapped.name.split(" ").reverse().join(";")};;;`,
      `TITLE:${holderMapped.title}`,
      org ? `ORG:${org.nom}` : "",
      holderMapped.phone ? `TEL;TYPE=CELL,VOICE:${holderMapped.phone}` : "",
      holderMapped.whatsapp ? `TEL;TYPE=WORK,CELL:${holderMapped.whatsapp}` : "",
      holderMapped.email ? `EMAIL;TYPE=PREF,INTERNET:${holderMapped.email}` : "",
      holderMapped.website ? `URL;TYPE=WORK:${holderMapped.website}` : (org?.siteWeb ? `URL;TYPE=WORK:${org.siteWeb}` : ""),
      holderMapped.address ? `ADR;TYPE=WORK:;;${holderMapped.address.replace(/,/g, ";")};;;` : "",
      holderMapped.bio ? `NOTE:${holderMapped.bio.replace(/\n/g, " ")}` : "",
      "END:VCARD"
    ].filter(Boolean)

    const vCardString = vCardLines.join("\n")

    // Retourner le fichier vCard en tant qu'attachement à télécharger
    const response = new NextResponse(vCardString, {
      status: 200,
      headers: {
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${holderMapped.name.replace(/\s+/g, "_")}.vcf"`,
        "Cache-Control": "no-cache"
      }
    })

    return response
  } catch (erreur) {
    console.error("Erreur génération vCard :", erreur)
    return NextResponse.json({ error: "Erreur serveur lors de la génération du vCard" }, { status: 500 })
  }
}
