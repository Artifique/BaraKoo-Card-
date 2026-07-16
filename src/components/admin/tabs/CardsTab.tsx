// Onglet Gabarits & Cartes (Aperçu de la carte physique et désactivation en direct)
"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { 
  CreditCard, 
  ArrowRight, 
  Wifi, 
  AlertTriangle, 
  Smartphone, 
  User, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Users, 
  ShieldCheck, 
  Download, 
  Printer 
} from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { CardHolder, Card as CardType } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface CardsTabProps {
  holders: CardHolder[]
  cards: CardType[]
  onToggleCardStatus: (card: CardType) => Promise<void>
}

// --------------------------------------------------------------------------
// Encodeur TIFF 6.0 Baseline (Little-Endian, non compressé RVB)
// --------------------------------------------------------------------------
function saveCanvasAsTIFF(canvas: HTMLCanvasElement, filename: string) {
  const width = canvas.width
  const height = canvas.height
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  
  const imgData = ctx.getImageData(0, 0, width, height).data
  const pixelCount = width * height
  const imageSize = pixelCount * 3 // 3 octets par pixel (RVB)
  
  // Structure d'un TIFF Baseline avec 14 entrées d'annuaire (IFD)
  // Entête : 8 octets
  // IFD : 2 octets (count) + 14 tags * 12 octets + 4 octets (offset suivant = 0) = 174 octets
  // Valeurs XResolution & YResolution : 8 octets * 2 = 16 octets
  // Valeurs BitsPerSample : 6 octets (3 * 2 octets pour 8,8,8)
  // Données d'image : imageSize
  const numTags = 14
  const headerSize = 8
  const ifdSize = 2 + numTags * 12 + 4
  const extraValuesSize = 16 + 6
  const totalSize = headerSize + ifdSize + extraValuesSize + imageSize
  
  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)
  let offset = 0
  
  // 1. Entête TIFF ("II" = 0x4949 pour Little Endian)
  view.setUint16(offset, 0x4949, true); offset += 2
  view.setUint16(offset, 42, true); offset += 2 // Magic number
  view.setUint32(offset, 8, true); offset += 4 // Offset vers le 1er IFD
  
  // 2. Écrire le nombre de tags
  view.setUint16(offset, numTags, true); offset += 2
  
  const ifdStart = offset
  offset += numTags * 12 + 4 // Réserver l'espace pour l'IFD
  
  // Espaces pour les valeurs pointées par offsets
  const xResOffset = offset
  view.setUint32(offset, 300, true); view.setUint32(offset + 4, 1, true); offset += 8 // 300 DPI
  
  const yResOffset = offset
  view.setUint32(offset, 300, true); view.setUint32(offset + 4, 1, true); offset += 8 // 300 DPI
  
  const bitsPerSampleOffset = offset
  view.setUint16(offset, 8, true)
  view.setUint16(offset + 2, 8, true)
  view.setUint16(offset + 4, 8, true)
  offset += 6
  
  const imageDataOffset = offset
  
  // 3. Remplir les tags de l'IFD (12 octets chacun)
  let tagOffset = ifdStart
  const writeTag = (tag: number, type: number, count: number, val: number) => {
    view.setUint16(tagOffset, tag, true)
    view.setUint16(tagOffset + 2, type, true)
    view.setUint32(tagOffset + 4, count, true)
    view.setUint32(tagOffset + 8, val, true)
    tagOffset += 12
  }
  
  writeTag(256, 4, 1, width)                  // ImageWidth
  writeTag(257, 4, 1, height)                 // ImageLength
  writeTag(258, 3, 3, bitsPerSampleOffset)     // BitsPerSample (8,8,8)
  writeTag(259, 3, 1, 1)                      // Compression (1 = aucune)
  writeTag(262, 3, 1, 2)                      // PhotometricInterpretation (2 = RGB)
  writeTag(273, 4, 1, imageDataOffset)        // StripOffsets
  writeTag(277, 3, 1, 3)                      // SamplesPerPixel (3 = RGB)
  writeTag(278, 4, 1, height)                 // RowsPerStrip
  writeTag(279, 4, 1, imageSize)             // StripByteCounts
  writeTag(282, 5, 1, xResOffset)             // XResolution
  writeTag(283, 5, 1, yResOffset)             // YResolution
  writeTag(284, 3, 1, 1)                      // PlanarConfiguration (1 = Chunky)
  writeTag(296, 3, 1, 2)                      // ResolutionUnit (2 = inch)
  writeTag(305, 2, 12, 0)                     // Software tag vide
  
  view.setUint32(tagOffset, 0, true)          // Offset IFD suivant = 0 (fin)
  
  // 4. Copier les données de pixel (de RGBA vers RVB)
  let imgOffset = imageDataOffset
  for (let i = 0; i < imgData.length; i += 4) {
    view.setUint8(imgOffset, imgData[i])     // Rouge
    view.setUint8(imgOffset + 1, imgData[i + 1]) // Vert
    view.setUint8(imgOffset + 2, imgData[i + 2]) // Bleu
    imgOffset += 3
  }
  
  // 5. Lancement du téléchargement
  const blob = new Blob([buffer], { type: "image/tiff" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}

export function CardsTab({ holders, cards, onToggleCardStatus }: CardsTabProps) {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  const [cardFace, setCardFace] = useState<"recto" | "verso">("recto")

  // Sélectionner la première carte par défaut
  useEffect(() => {
    if (cards.length > 0 && !selectedCard) {
      setSelectedCard(cards[0])
    }
  }, [cards, selectedCard])

  // Rechercher les données du titulaire lié à la carte sélectionnée
  const activeHolder = selectedCard ? holders.find(h => h.id === selectedCard.holderId) : null

  // --------------------------------------------------------------------------
  // Export PDF d'impression vectoriel via Print-Window
  // --------------------------------------------------------------------------
  const handleExportPDF = (face: "recto" | "verso", holder: CardHolder, slug: string) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Veuillez autoriser les fenêtres contextuelles pour exporter en PDF.")
      return
    }

    const title = `${holder.name.replace(/\s+/g, "_")}_${face}`
    let cardHTML = ""

    if (face === "recto") {
      cardHTML = `
        <div style="
          width: 85.6mm;
          height: 54mm;
          background: linear-gradient(135deg, #0c2547 0%, #0d2444 60%, #0f2850 100%);
          position: relative;
          overflow: hidden;
          font-family: sans-serif;
          color: white;
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        ">
          <!-- Vague tricolore -->
          <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 38%; pointer-events: none; overflow: hidden;">
            <svg viewBox="0 0 160 280" style="position: absolute; inset: 0; width: 100%; height: 100%;" preserveAspectRatio="none">
              <path d="M80 0 C 30 60, 10 120, 20 160 C 30 200, 50 240, 80 280 L 160 280 L 160 0 Z" fill="#F97316" />
              <path d="M95 0 C 45 60, 25 120, 35 160 C 45 200, 65 240, 95 280 L 160 280 L 160 0 Z" fill="#16A34A" />
              <path d="M110 0 C 60 60, 40 120, 50 160 C 60 200, 80 240, 110 280 L 160 280 L 160 0 Z" fill="#0c2547" />
            </svg>
            <div style="position: relative; z-index: 10; height: 100%; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 10px 4px;">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 1px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transform: rotate(90deg); color: white;"><path d="M5 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1 7 0M12 5V21"/></svg>
                <span style="font-size: 8px; font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase;">NFC</span>
              </div>
              <div style="background: white; padding: 3px; border-radius: 6px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/${slug}`)}" style="width: 54px; height: 54px; display: block;" />
              </div>
              <div style="background: #F97316; border-radius: 6px; padding: 3px 6px; display: flex; align-items: center; gap: 2px;">
                <span style="font-size: 6.5px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; color: white;">Scannez-moi</span>
              </div>
            </div>
          </div>

          <!-- Partie Gauche -->
          <div style="position: absolute; inset: 0; width: 62%; display: flex; flex-direction: column; justify-content: space-between; padding: 12px 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <img src="/images/BarakoKeneyanoir.png" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
              <div style="display: flex; flex-direction: column; line-height: 1.1;">
                <div style="display: flex; gap: 2px;">
                  <span style="font-size: 12px; font-weight: 900;">Baarako</span>
                  <span style="font-size: 12px; font-weight: 900; color: #F97316;">Jobcard</span>
                </div>
                <span style="font-size: 6.5px; color: rgba(255,255,255,0.85);">Votre carrière entre de bonnes mains</span>
              </div>
            </div>

            <div style="display: flex; align-items: flex-end; gap: 8px; margin-top: auto; margin-bottom: 2px;">
              <div style="width: 50px; height: 66px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.2); background: #0b2040; position: relative;">
                <img src="${holder.avatarUrl || "/avatars/ousmane.png"}" style="width: 100%; height: 100%; object-fit: cover; object-position: top;" />
              </div>
              <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px;">
                <h4 style="font-size: 11px; font-weight: 800; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${holder.name}</h4>
                <p style="font-size: 8.5px; color: #16A34A; font-weight: bold; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${holder.title}</p>
                <div style="margin-top: 2px;">
                  <span style="font-size: 7px; font-weight: 900; text-transform: uppercase; background: ${holder.availability === "available" ? "#16A34A" : "#dc2626"}; padding: 1.5px 5px; border-radius: 3px; display: inline-block;">
                    ${holder.availability === "available" ? "Disponible" : "Non Dispo"}
                  </span>
                </div>
              </div>
            </div>
            
            <div style="font-size: 7.5px; font-weight: 900; color: #16A34A; letter-spacing: 0.5px; margin-top: 2px;">
              ID : ${holder.id}
            </div>
          </div>
        </div>
      `
    } else {
      cardHTML = `
        <div style="
          width: 85.6mm;
          height: 54mm;
          background-color: #0c2547;
          position: relative;
          overflow: hidden;
          font-family: sans-serif;
          color: white;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 12px 14px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        ">
          <div style="text-align: center; margin-top: 2px;">
            <h3 style="font-size: 10px; font-weight: bold; margin: 0; letter-spacing: 0.2px;">
              Un accès <span style="color: #16A34A;">instantané</span> à mon profil digital
            </h3>
          </div>

          <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin: auto 0;">
            <!-- CV & Profil -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; border: 1px solid #16A34A; display: flex; align-items: center; justify-content: center; background: rgba(22,163,74,0.05);">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span style="font-size: 5.5px; font-weight: bold; white-space: nowrap;">CV & Profil</span>
            </div>

            <!-- Diplômes -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; border: 1px solid #2563EB; display: flex; align-items: center; justify-content: center; background: rgba(37,99,235,0.05);">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.91a2 2 0 0 0 1.66 0z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
              </div>
              <span style="font-size: 5.5px; font-weight: bold; white-space: nowrap;">Diplômes</span>
            </div>

            <!-- Expériences -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; border: 1px solid #F97316; display: flex; align-items: center; justify-content: center; background: rgba(249,115,22,0.05);">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
              </div>
              <span style="font-size: 5.5px; font-weight: bold; white-space: nowrap;">Expériences</span>
            </div>

            <!-- Certifications -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; border: 1px solid #16A34A; display: flex; align-items: center; justify-content: center; background: rgba(22,163,74,0.05);">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="8" r="7"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>
              </div>
              <span style="font-size: 5.5px; font-weight: bold; white-space: nowrap;">Certifications</span>
            </div>

            <!-- Références -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; border: 1px solid #F97316; display: flex; align-items: center; justify-content: center; background: rgba(249,115,22,0.05);">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <span style="font-size: 5.5px; font-weight: bold; white-space: nowrap;">Références</span>
            </div>
          </div>

          <div style="width: 100%;">
            <div style="border-top: 1px solid rgba(255,255,255,0.15); margin: 4px 0;" />
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 4px; max-width: 65%;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: white; flex-shrink: 0;"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2c.57.14.76.65.76.97Z"/><path d="m9 12 2 2 4-4"/></svg>
                <span style="font-size: 5.5px; color: rgba(255,255,255,0.85); line-height: 1.2;">
                  Vos informations sont sécurisées et authentifiées avec la technologie blockchain.
                </span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; line-height: 1;">
                <span style="font-size: 5px; color: rgba(255,255,255,0.5); font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Powered by</span>
                <span style="font-size: 8px; font-weight: 900; color: white; margin-top: 1px;">
                  Baarako <span style="color: #F97316;">Keněyaso</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      `
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @page {
              size: 85.6mm 54mm;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 85.6mm;
              height: 54mm;
              overflow: hidden;
            }
            @media print {
              html, body {
                width: 85.6mm;
                height: 54mm;
              }
            }
          </style>
        </head>
        <body>
          ${cardHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 400);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // --------------------------------------------------------------------------
  // Export TIFF Haute Résolution (300 DPI pour l'impression) via Canvas
  // --------------------------------------------------------------------------
  const handleExportTIFF = async (face: "recto" | "verso", holder: CardHolder, slug: string) => {
    const canvas = document.createElement("canvas")
    canvas.width = 1012  // CR80 standard à 300 DPI (approx 85.6mm)
    canvas.height = 638 // CR80 standard à 300 DPI (approx 54mm)
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    // Fond bleu nuit d'origine
    ctx.fillStyle = "#0c2547"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new window.Image()
        img.crossOrigin = "anonymous"
        img.src = src
        img.onload = () => resolve(img)
        img.onerror = (e) => reject(e)
      })
    }

    try {
      if (face === "recto") {
        // --- RECTO ---
        // Vague orange
        ctx.fillStyle = "#F97316"
        ctx.beginPath()
        ctx.moveTo(canvas.width, 0)
        ctx.lineTo(canvas.width * 0.68, 0)
        ctx.bezierCurveTo(
          canvas.width * 0.62, canvas.height * 0.3,
          canvas.width * 0.52, canvas.height * 0.6,
          canvas.width * 0.74, canvas.height
        )
        ctx.lineTo(canvas.width, canvas.height)
        ctx.fill()

        // Vague verte
        ctx.fillStyle = "#16A34A"
        ctx.beginPath()
        ctx.moveTo(canvas.width, 0)
        ctx.lineTo(canvas.width * 0.72, 0)
        ctx.bezierCurveTo(
          canvas.width * 0.66, canvas.height * 0.3,
          canvas.width * 0.58, canvas.height * 0.6,
          canvas.width * 0.80, canvas.height
        )
        ctx.lineTo(canvas.width, canvas.height)
        ctx.fill()

        // Cache bleu
        ctx.fillStyle = "#0c2547"
        ctx.beginPath()
        ctx.moveTo(canvas.width, 0)
        ctx.lineTo(canvas.width * 0.76, 0)
        ctx.bezierCurveTo(
          canvas.width * 0.71, canvas.height * 0.3,
          canvas.width * 0.65, canvas.height * 0.6,
          canvas.width * 0.84, canvas.height
        )
        ctx.lineTo(canvas.width, canvas.height)
        ctx.fill()

        // Logo
        try {
          const logo = await loadImage("/images/BarakoKeneyanoir.png")
          ctx.save()
          ctx.beginPath()
          ctx.arc(80, 80, 32, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(logo, 48, 48, 64, 64)
          ctx.restore()
        } catch (e) {
          ctx.fillStyle = "#F97316"
          ctx.beginPath()
          ctx.arc(80, 80, 32, 0, Math.PI * 2)
          ctx.fill()
        }

        // Textes Logo
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 26px sans-serif"
        ctx.fillText("Baarako", 125, 78)
        ctx.fillStyle = "#F97316"
        ctx.fillText("Jobcard", 225, 78)
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.font = "bold 13px sans-serif"
        ctx.fillText("Votre carrière entre de bonnes mains", 125, 102)

        // Photo de profil
        try {
          const avatar = await loadImage(holder.avatarUrl || "/avatars/ousmane.png")
          const px = 50, py = 430, pw = 110, ph = 145, br = 12
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(px + br, py)
          ctx.lineTo(px + pw - br, py)
          ctx.quadraticCurveTo(px + pw, py, px + pw, py + br)
          ctx.lineTo(px + pw, py + ph - br)
          ctx.quadraticCurveTo(px + pw, py + ph, px + pw - br, py + ph)
          ctx.lineTo(px + br, py + ph)
          ctx.quadraticCurveTo(px, py + ph, px, py + ph - br)
          ctx.lineTo(px, py + br)
          ctx.quadraticCurveTo(px, py, px + br, py)
          ctx.closePath()
          ctx.clip()
          ctx.drawImage(avatar, px, py, pw, ph)
          ctx.restore()

          ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
          ctx.lineWidth = 2
          ctx.stroke()
        } catch (e) {}

        // Info titulaire
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 24px sans-serif"
        ctx.fillText(holder.name, 175, 465)

        ctx.fillStyle = "#16A34A"
        ctx.font = "bold 16px sans-serif"
        ctx.fillText(holder.title, 175, 495)

        // Badge
        ctx.fillStyle = holder.availability === "available" ? "#16A34A" : "#dc2626"
        const bx = 175, by = 515, bw = 95, bh = 22, brr = 4
        ctx.beginPath()
        ctx.moveTo(bx + brr, by)
        ctx.lineTo(bx + bw - brr, by)
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + brr)
        ctx.lineTo(bx + bw, by + bh - brr)
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - brr, by + bh)
        ctx.lineTo(bx + brr, by + bh)
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - brr)
        ctx.lineTo(bx, by + brr)
        ctx.quadraticCurveTo(bx, by, bx + brr, by)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(holder.availability === "available" ? "DISPONIBLE" : "NON DISPO", bx + bw/2, by + 15)
        ctx.textAlign = "left"

        ctx.fillStyle = "#16A34A"
        ctx.font = "bold 13px sans-serif"
        ctx.fillText(`ID : ${holder.id}`, 50, 600)

        // NFC
        const cx = canvas.width * 0.88, cy = 60
        ctx.strokeStyle = "rgba(255,255,255,0.9)"
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(cx, cy, 12, -Math.PI/4, Math.PI/4); ctx.stroke()
        ctx.beginPath()
        ctx.arc(cx, cy, 20, -Math.PI/4, Math.PI/4); ctx.stroke()
        ctx.beginPath()
        ctx.arc(cx, cy, 28, -Math.PI/4, Math.PI/4); ctx.stroke()

        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 16px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("NFC", cx, 115)
        ctx.fillStyle = "rgba(255,255,255,0.7)"
        ctx.font = "bold 11px sans-serif"
        ctx.fillText("Approchez votre", cx, 135)
        ctx.fillText("téléphone", cx, 150)

        // QR Code
        try {
          const qr = await loadImage(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}/${slug}`)}`)
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(cx - 83, 212, 166, 166)
          ctx.drawImage(qr, cx - 75, 220, 150, 150)
        } catch (e) {}

        // Bouton
        const btnX = cx - 70, btnY = 460, btnW = 140, btnH = 34, btnR = 8
        ctx.fillStyle = "#F97316"
        ctx.beginPath()
        ctx.moveTo(btnX + btnR, btnY)
        ctx.lineTo(btnX + btnW - btnR, btnY)
        ctx.quadraticCurveTo(btnX + btnW, btnY, btnX + btnW, btnY + btnR)
        ctx.lineTo(btnX + btnW, btnY + btnH - btnR)
        ctx.quadraticCurveTo(btnX + btnW, btnY + btnH, btnX + btnW - btnR, btnY + btnH)
        ctx.lineTo(btnX + btnR, btnY + btnH)
        ctx.quadraticCurveTo(btnX, btnY + btnH, btnX, btnY + btnH - btnR)
        ctx.lineTo(btnX, btnY + btnR)
        ctx.quadraticCurveTo(btnX, btnY, btnX + btnR, btnY)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 13px sans-serif"
        ctx.fillText("Scannez-moi", btnX + 30, btnY + 22)
        ctx.textAlign = "left"

      } else {
        // --- VERSO ---
        // Titre
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 24px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("Un accès ", canvas.width / 2 - 95, 80)
        ctx.fillStyle = "#16A34A"
        ctx.fillText("instantané", canvas.width / 2 + 10, 80)
        ctx.fillStyle = "#ffffff"
        ctx.fillText(" à mon profil digital", canvas.width / 2 + 155, 80)

        // 5 Bulles
        const gap = 175
        const startX = (canvas.width - (4 * gap)) / 2
        const cy = 290
        const radius = 40

        const bulles = [
          {
            label: "CV & Profil",
            color: "#16A34A",
            draw: (x: number, y: number) => {
              ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2
              ctx.beginPath(); ctx.arc(x, y - 5, 8, 0, Math.PI * 2); ctx.stroke()
              ctx.beginPath(); ctx.arc(x, y + 15, 14, Math.PI, 0); ctx.stroke()
            }
          },
          {
            label: "Diplômes",
            color: "#2563EB",
            draw: (x: number, y: number) => {
              ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2
              ctx.beginPath()
              ctx.moveTo(x, y - 10); ctx.lineTo(x + 16, y - 3); ctx.lineTo(x, y + 4); ctx.lineTo(x - 16, y - 3)
              ctx.closePath(); ctx.stroke()
              ctx.beginPath()
              ctx.moveTo(x - 8, y + 1); ctx.lineTo(x - 8, y + 8)
              ctx.bezierCurveTo(x - 8, y + 12, x + 8, y + 12, x + 8, y + 8)
              ctx.lineTo(x + 8, y + 1)
              ctx.stroke()
            }
          },
          {
            label: "Expériences",
            color: "#F97316",
            draw: (x: number, y: number) => {
              ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2
              ctx.beginPath(); ctx.rect(x - 14, y - 6, 28, 18); ctx.stroke()
              ctx.moveTo(x - 6, y - 6); ctx.lineTo(x - 6, y - 12); ctx.lineTo(x + 6, y - 12); ctx.lineTo(x + 6, y - 6); ctx.stroke()
            }
          },
          {
            label: "Certifications",
            color: "#16A34A",
            draw: (x: number, y: number) => {
              ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2
              ctx.beginPath(); ctx.arc(x, y - 5, 10, 0, Math.PI * 2); ctx.stroke()
              ctx.beginPath()
              ctx.moveTo(x - 4, y + 4); ctx.lineTo(x - 8, y + 18); ctx.lineTo(x, y + 14); ctx.lineTo(x + 8, y + 18); ctx.lineTo(x + 4, y + 4)
              ctx.stroke()
            }
          },
          {
            label: "Références",
            color: "#F97316",
            draw: (x: number, y: number) => {
              ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2
              ctx.beginPath(); ctx.arc(x - 4, y - 4, 6, 0, Math.PI * 2); ctx.stroke()
              ctx.beginPath(); ctx.arc(x - 4, y + 12, 10, Math.PI, 0); ctx.stroke()
              ctx.beginPath(); ctx.arc(x + 8, y - 8, 5, 0, Math.PI * 2); ctx.stroke()
            }
          }
        ]

        bulles.forEach((b, index) => {
          const bx = startX + index * gap
          ctx.strokeStyle = b.color
          ctx.lineWidth = 3
          ctx.fillStyle = "rgba(255,255,255,0.02)"
          ctx.beginPath(); ctx.arc(bx, cy, radius, 0, Math.PI*2); ctx.closePath(); ctx.fill(); ctx.stroke()
          b.draw(bx, cy)
          ctx.fillStyle = "#ffffff"
          ctx.font = "bold 13px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(b.label, bx, cy + radius + 22)
        })

        // Ligne
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(50, 520); ctx.lineTo(canvas.width - 50, 520); ctx.stroke()

        // Bas gauche (ShieldCheck)
        const sx = 75, sy = 565
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(sx, sy - 15); ctx.lineTo(sx + 12, sy - 15); ctx.lineTo(sx + 12, sy)
        ctx.quadraticCurveTo(sx + 12, sy + 12, sx, sy + 20)
        ctx.quadraticCurveTo(sx - 12, sy + 12, sx - 12, sy); ctx.lineTo(sx - 12, sy - 15)
        ctx.closePath(); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(sx - 5, sy); ctx.lineTo(sx - 1, sy + 4); ctx.lineTo(sx + 6, sy - 4); ctx.stroke()

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.font = "bold 12px sans-serif"
        ctx.textAlign = "left"
        ctx.fillText("Vos informations sont sécurisées et authentifiées", 100, 560)
        ctx.fillText("avec la technologie blockchain.", 100, 578)

        // Bas droite
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
        ctx.font = "bold 10px sans-serif"
        ctx.textAlign = "right"
        ctx.fillText("Powered by", canvas.width - 50, 555)
        ctx.fillStyle = "#ffffff"; ctx.font = "black 18px sans-serif"
        ctx.fillText("Baarako ", canvas.width - 150, 580)
        ctx.fillStyle = "#F97316"; ctx.fillText("Keněyaso", canvas.width - 50, 580)
      }

      saveCanvasAsTIFF(canvas, `${holder.name.replace(/\s+/g, "_")}_${face}.tiff`)
    } catch (e) {
      alert("Une erreur est survenue lors de l'exportation.")
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      
      {/* ─── Partie gauche : Liste des cartes ─── */}
      <div className="lg:col-span-3 space-y-4">
        <div className="text-sm font-semibold text-foreground pb-1 border-b border-border/30">
          Cartes physiques commandées / En circulation
        </div>
        
        <div className="space-y-3">
          {cards.map(card => {
            const cardHolder = holders.find(h => h.id === card.holderId)
            const isSelected = selectedCard?.id === card.id
            
            return (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex justify-between items-center ${
                  isSelected
                    ? "bg-card border-brand-orange/60 shadow-lg"
                    : "bg-muted/10 border-border/30 hover:border-border/60"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-border/50 text-foreground/80">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground block">
                      {cardHolder ? cardHolder.name : "Titulaire inconnu"}
                    </span>
                    <span className="text-xs text-brand-green/80 font-mono">
                      slug: {card.slug}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleCardStatus(card)
                    }}
                    className="focus:outline-none cursor-pointer"
                  >
                    <Badge
                      variant={card.status === "active" ? "success" : "destructive"}
                      className="px-2.5 py-0.5 text-[10px]"
                    >
                      {card.status === "active" ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </button>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Partie droite : Aperçu de la carte physique ─── */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center pb-1 border-b border-border/30">
          <span className="text-sm font-semibold text-foreground">
            Aperçu Graphique de la Carte Physique
          </span>
          {selectedCard && activeHolder && (
            <div className="flex bg-secondary/80 border border-border/30 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setCardFace("recto")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  cardFace === "recto" ? "bg-brand-orange text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Recto
              </button>
              <button
                onClick={() => setCardFace("verso")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  cardFace === "verso" ? "bg-brand-orange text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Verso
              </button>
            </div>
          )}
        </div>

        {selectedCard && activeHolder ? (
          <div className="space-y-4">
            
            {cardFace === "recto" ? (
              /* ══════════════════════════════════════════
                  RECTO DE LA CARTE — Design fidèle au modèle
                  ══════════════════════════════════════════ */
              <div
                className="w-full rounded-2xl shadow-2xl relative overflow-hidden text-white select-none border border-white/10"
                style={{
                  backgroundColor: "#0c2547",
                  aspectRatio: "1.586 / 1",
                }}
              >
                {/* ── Bande décorative courbe droite (orange + vert) ── */}
                <div className="absolute right-0 inset-y-0 w-[38%] pointer-events-none overflow-hidden">
                  <svg
                    viewBox="0 0 160 280"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M80 0 C 30 60, 10 120, 20 160 C 30 200, 50 240, 80 280 L 160 280 L 160 0 Z"
                      fill="#F97316"
                    />
                    <path
                      d="M95 0 C 45 60, 25 120, 35 160 C 45 200, 65 240, 95 280 L 160 280 L 160 0 Z"
                      fill="#16A34A"
                    />
                    <path
                      d="M110 0 C 60 60, 40 120, 50 160 C 60 200, 80 240, 110 280 L 160 280 L 160 0 Z"
                      fill="#0c2547"
                    />
                  </svg>

                  {/* Contenu zone droite : NFC + QR + Scannez-moi */}
                  <div className="relative z-10 h-full flex flex-col items-center justify-between py-3 px-2">
                    {/* NFC */}
                    <div className="flex flex-col items-center gap-0.5 mt-1">
                      <Wifi className="w-5 h-5 text-white rotate-90" strokeWidth={2.5} />
                      <span className="text-[9px] font-black tracking-[0.2em] text-white uppercase">NFC</span>
                      <span className="text-[7px] text-white/70 text-center leading-tight">Approchez votre<br />téléphone</span>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white p-1 rounded-lg shadow-xl w-14 h-14 flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${window.location.origin}/${selectedCard.slug}`)}`}
                        alt="QR Code"
                        className="w-full h-full block"
                      />
                    </div>

                    {/* Bouton Scannez-moi */}
                    <div className="flex items-center gap-1 bg-[#F97316] rounded-lg px-2 py-1 shadow-lg">
                      <Smartphone className="w-2.5 h-2.5 text-white" />
                      <span className="text-[7px] font-black text-white tracking-wide uppercase">Scannez-moi</span>
                    </div>
                  </div>
                </div>

                {/* ── Zone gauche / centrale ── */}
                <div className="absolute inset-0 w-[62%] flex flex-col justify-between p-4">
                  {/* Ligne haute : Logo */}
                  <div className="flex items-start gap-2">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center relative">
                      <Image
                        src="/images/BarakoKeneyanoir.png"
                        alt="Logo"
                        fill
                        className="object-cover scale-110"
                      />
                    </div>
                    <div className="flex flex-col leading-[1.1]">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-sm font-extrabold tracking-wide text-white">Baarako</span>
                        <span className="text-sm font-extrabold tracking-wide text-[#F97316]">Jobcard</span>
                      </div>
                      <span className="text-[7.5px] text-white/80 font-medium tracking-wide">
                        Votre carrière entre de bonnes mains
                      </span>
                    </div>
                  </div>

                  {/* Ligne basse : Photo + Infos */}
                  <div className="flex items-end gap-3 mt-auto">
                    {/* Photo de profil */}
                    <div className="relative w-[30%] aspect-[3/4] rounded-xl overflow-hidden border border-white/20 shadow-lg shrink-0 bg-[#0B2040]">
                      <Image
                        src={activeHolder.avatarUrl || "/avatars/ousmane.png"}
                        alt={activeHolder.name}
                        fill
                        className="object-cover object-top"
                      />
                    </div>

                    {/* Infos textuelles */}
                    <div className="flex-1 pb-1 min-w-0">
                      <h4 className="text-sm font-bold text-white leading-tight truncate">
                        {activeHolder.name}
                      </h4>
                      <p className="text-[9.5px] text-[#16A34A] font-semibold mt-0.5 truncate">
                        {activeHolder.title}
                      </p>

                      {/* Badge disponibilité */}
                      <div className="pt-1">
                        <span className={`inline-block text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          activeHolder.availability === "available"
                            ? "bg-[#16A34A] text-white"
                            : "bg-red-600 text-white"
                        }`}>
                          {activeHolder.availability === "available" ? "Disponible" : "Non Dispo"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ID */}
                  <div className="text-[8px] font-semibold text-[#16A34A] tracking-wider mt-1.5 leading-none">
                    ID : {activeHolder.id}
                  </div>
                </div>
              </div>
            ) : (
              /* ══════════════════════════════════════════
                  VERSO DE LA CARTE — Design fidèle au modèle
                  ══════════════════════════════════════════ */
              <div
                className="w-full rounded-2xl shadow-2xl relative overflow-hidden text-white select-none border border-white/10 flex flex-col justify-between p-4"
                style={{
                  backgroundColor: "#0c2547",
                  aspectRatio: "1.586 / 1",
                }}
              >
                {/* Titre du verso */}
                <div className="text-center mt-1">
                  <h3 className="text-xs font-bold tracking-wide">
                    Un accès <span className="text-[#16A34A]">instantané</span> à mon profil digital
                  </h3>
                </div>

                {/* Les 5 bulles de compétences/profil */}
                <div className="flex justify-center items-center gap-2.5 my-auto">
                  {/* CV & Profil */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-9 h-9 rounded-full border-2 border-[#16A34A] flex items-center justify-center bg-[#16A34A]/5">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[6.5px] font-bold text-white tracking-tight whitespace-nowrap">CV & Profil</span>
                  </div>

                  {/* Diplômes */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-9 h-9 rounded-full border-2 border-[#2563EB] flex items-center justify-center bg-[#2563EB]/5">
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[6.5px] font-bold text-white tracking-tight whitespace-nowrap">Diplômes</span>
                  </div>

                  {/* Expériences */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-9 h-9 rounded-full border-2 border-[#F97316] flex items-center justify-center bg-[#F97316]/5">
                      <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[6.5px] font-bold text-white tracking-tight whitespace-nowrap">Expériences</span>
                  </div>

                  {/* Certifications */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-9 h-9 rounded-full border-2 border-[#16A34A] flex items-center justify-center bg-[#16A34A]/5">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[6.5px] font-bold text-white tracking-tight whitespace-nowrap">Certifications</span>
                  </div>

                  {/* Références */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-9 h-9 rounded-full border-2 border-[#F97316] flex items-center justify-center bg-[#F97316]/5">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[6.5px] font-bold text-white tracking-tight whitespace-nowrap">Références</span>
                  </div>
                </div>

                {/* Ligne basse et crédits */}
                <div className="w-full">
                  <div className="border-t border-white/10 my-2.5" />
                  <div className="flex justify-between items-center">
                    {/* Blockchain note */}
                    <div className="flex items-center space-x-1 max-w-[65%]">
                      <ShieldCheck className="w-3.5 h-3.5 text-white shrink-0" />
                      <span className="text-[5.8px] text-white/85 leading-tight">
                        Vos informations sont sécurisées et authentifiées avec la technologie blockchain.
                      </span>
                    </div>

                    {/* Powered by */}
                    <div className="flex flex-col items-end leading-none">
                      <span className="text-[5px] text-white/50 font-bold uppercase tracking-widest">Powered by</span>
                      <span className="text-[8px] font-black text-white mt-0.5">
                        Baarako <span className="text-[#F97316]">Keněyaso</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Guide d'information */}
            <div className="p-3 bg-muted/40 border border-border/20 rounded-2xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F97316] shrink-0" />
              <p className="text-[10px] text-muted-foreground leading-snug">
                Ce gabarit représente visuellement la carte physique finale NFC/QR. Si vous désactivez la carte,
                toutes les requêtes de scan redirigeront vers une page d&apos;indisponibilité.
              </p>
            </div>

            {/* Boutons d'exportation d'impression */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExportPDF(cardFace, activeHolder, selectedCard.slug)}
                className="flex items-center justify-center gap-2 py-2.5 cursor-pointer text-xs"
              >
                <Printer className="w-4 h-4 text-brand-orange" />
                <span>Exporter en PDF</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExportTIFF(cardFace, activeHolder, selectedCard.slug)}
                className="flex items-center justify-center gap-2 py-2.5 cursor-pointer text-xs"
              >
                <Download className="w-4 h-4 text-brand-green" />
                <span>Exporter en TIFF</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-8">
            Sélectionnez une carte pour voir son aperçu.
          </div>
        )}
      </div>

    </div>
  )
}
