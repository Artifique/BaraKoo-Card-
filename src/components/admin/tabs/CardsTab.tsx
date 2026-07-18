// Onglet Gabarits & Cartes (Aperçu de la carte physique et désactivation en direct)
"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
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
import { CardHolder, Card as CardType, Organization } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface CardsTabProps {
  holders: CardHolder[]
  cards: CardType[]
  organizations: Organization[]
  onToggleCardStatus: (card: CardType) => Promise<void>
}

// --------------------------------------------------------------------------
// Encodeur TIFF 6.0 Baseline (Little-Endian, non compressé RVB) à partir d'un canvas
// --------------------------------------------------------------------------
function saveCanvasAsTIFF(canvas: HTMLCanvasElement, filename: string) {
  const width = canvas.width
  const height = canvas.height
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const imgData = ctx.getImageData(0, 0, width, height).data
  const imageSize = width * height * 3
  const numTags = 14
  const totalSize = 8 + 2 + numTags * 12 + 4 + 16 + 6 + imageSize

  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)
  let offset = 0

  view.setUint16(offset, 0x4949, true); offset += 2
  view.setUint16(offset, 42, true); offset += 2
  view.setUint32(offset, 8, true); offset += 4
  view.setUint16(offset, numTags, true); offset += 2

  const ifdStart = offset
  offset += numTags * 12 + 4

  const xResOffset = offset
  view.setUint32(offset, 300, true); view.setUint32(offset + 4, 1, true); offset += 8
  const yResOffset = offset
  view.setUint32(offset, 300, true); view.setUint32(offset + 4, 1, true); offset += 8
  const bpsOffset = offset
  view.setUint16(offset, 8, true); view.setUint16(offset + 2, 8, true); view.setUint16(offset + 4, 8, true); offset += 6
  const imageDataOffset = offset

  let tagOffset = ifdStart
  const writeTag = (tag: number, type: number, count: number, val: number) => {
    view.setUint16(tagOffset, tag, true)
    view.setUint16(tagOffset + 2, type, true)
    view.setUint32(tagOffset + 4, count, true)
    view.setUint32(tagOffset + 8, val, true)
    tagOffset += 12
  }
  writeTag(256, 4, 1, width)
  writeTag(257, 4, 1, height)
  writeTag(258, 3, 3, bpsOffset)
  writeTag(259, 3, 1, 1)
  writeTag(262, 3, 1, 2)
  writeTag(273, 4, 1, imageDataOffset)
  writeTag(277, 3, 1, 3)
  writeTag(278, 4, 1, height)
  writeTag(279, 4, 1, imageSize)
  writeTag(282, 5, 1, xResOffset)
  writeTag(283, 5, 1, yResOffset)
  writeTag(284, 3, 1, 1)
  writeTag(296, 3, 1, 2)
  writeTag(305, 2, 12, 0)
  view.setUint32(tagOffset, 0, true)

  let imgOffset = imageDataOffset
  for (let i = 0; i < imgData.length; i += 4) {
    view.setUint8(imgOffset, imgData[i])
    view.setUint8(imgOffset + 1, imgData[i + 1])
    view.setUint8(imgOffset + 2, imgData[i + 2])
    imgOffset += 3
  }

  const blob = new Blob([buffer], { type: "image/tiff" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}

export function CardsTab({ holders, cards, organizations, onToggleCardStatus }: CardsTabProps) {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  const [cardFace, setCardFace] = useState<"recto" | "verso">("recto")
  const [exporting, setExporting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Sélectionner la première carte par défaut
  useEffect(() => {
    if (cards.length > 0 && !selectedCard) {
      setSelectedCard(cards[0])
    }
  }, [cards, selectedCard])

  // Rechercher les données du titulaire lié à la carte sélectionnée
  const activeHolder = selectedCard ? holders.find(h => h.id === selectedCard.holderId) : null
  const activeHolderOrg = activeHolder && organizations
    ? organizations.find(org => org.id === activeHolder.organizationId)
    : null

  // --------------------------------------------------------------------------
  // Capture DOM via html-to-image → PDF pixel-perfect (capture exacte du rendu navigateur)
  // --------------------------------------------------------------------------
  const handleExportPDF = async (holder: CardHolder) => {
    if (!cardRef.current) return
    setExporting(true)
    try {
      const { toCanvas } = await import("html-to-image")
      const { jsPDF } = await import("jspdf")

      // Capturer le DOM à haute résolution (pixelRatio 4 = 4x plus net)
      const canvas = await toCanvas(cardRef.current, {
        pixelRatio: 4,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
          width: cardRef.current.offsetWidth + "px",
          height: cardRef.current.offsetHeight + "px"
        }
      })

      // Dimensions exactes carte CR80 en mm
      const W_MM = 85.6
      const H_MM = 54

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [W_MM, H_MM],
      })

      const imgData = canvas.toDataURL("image/png", 1.0)
      pdf.addImage(imgData, "PNG", 0, 0, W_MM, H_MM)
      pdf.save(`${holder.name.replace(/\s+/g, "_")}_${cardFace}.pdf`)
    } catch (e) {
      console.error(e)
      alert("Erreur lors de l'export PDF.")
    } finally {
      setExporting(false)
    }
  }

  // --------------------------------------------------------------------------
  // Capture DOM via html-to-image → TIFF haute résolution (300 DPI)
  // --------------------------------------------------------------------------
  const handleExportTIFF = async (holder: CardHolder) => {
    if (!cardRef.current) return
    setExporting(true)
    try {
      const { toCanvas } = await import("html-to-image")

      // Capturer le DOM à haute résolution
      const canvas = await toCanvas(cardRef.current, {
        pixelRatio: 4,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
          width: cardRef.current.offsetWidth + "px",
          height: cardRef.current.offsetHeight + "px"
        }
      })

      saveCanvasAsTIFF(canvas, `${holder.name.replace(/\s+/g, "_")}_${cardFace}.tiff`)
    } catch (e) {
      console.error(e)
      alert("Erreur lors de l'export TIFF.")
    } finally {
      setExporting(false)
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
                  RECTO DE LA CARTE
                  ══════════════════════════════════════════ */
              <div
                ref={cardRef}
                className="w-full rounded-[24px] shadow-2xl relative overflow-hidden text-white select-none border border-white/10 p-3.5 sm:p-5 flex flex-col justify-between"
                style={{
                  backgroundColor: "#041124",
                  aspectRatio: "1.586 / 1",
                }}
              >
                {/* Ruban Mali courbes (Orange et Vert) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 316" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M365,-20 C325,100 320,185 435,336" stroke="#f26f21" strokeWidth="12" fill="none"/>
                  <path d="M378,-20 C338,100 333,185 448,336" stroke="#00a859" strokeWidth="12" fill="none"/>
                </svg>

                {/* Ligne 1 : Logo/Sceau + Brand & Slogan (Gauche) | NFC & Signal (Droite) */}
                <div className="flex justify-between items-start z-10">
                  {/* Sceau doré de l'organisation ou THEMIS */}
                  <div className="flex items-start space-x-2.5 sm:space-x-3">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-amber-500/50 bg-[#081d38] flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                        {activeHolderOrg?.logoUrl ? (
                          <img src={activeHolderOrg.logoUrl} alt="Logo" className="w-full h-full object-cover" crossOrigin="anonymous" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-gradient-to-tr from-amber-600 to-yellow-400">
                            {/* Balance de justice */}
                            <svg className="w-5 h-5 text-[#041124]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17m0-17L4 9h16L12 3zM4 9c0 4 2 7 8 7s8-3 8-7H4z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="text-[6px] sm:text-[7px] text-gray-300 font-extrabold mt-1 uppercase tracking-wider text-center max-w-[65px] leading-none">
                        {activeHolderOrg?.name ? activeHolderOrg.name.substring(0, 22) : "Ministère de la justice"}
                      </span>
                    </div>

                    {/* Titre et Slogan */}
                    <div className="flex flex-col mt-0.5">
                      <div className="flex items-baseline">
                        <span className="text-xs sm:text-sm font-black tracking-tight text-white">Baarako</span>
                        <span className="text-xs sm:text-sm font-black tracking-tight text-[#F97316] ml-1">Jobcard</span>
                      </div>
                      <span className="text-[7px] sm:text-[8px] text-gray-400 font-medium tracking-tight">
                        Votre carrière entre de bonnes mains
                      </span>
                    </div>
                  </div>

                  {/* NFC section en haut à droite */}
                  <div className="flex flex-col items-end text-right mt-0.5">
                    <div className="flex items-center space-x-1 text-[#16A34A]">
                      <svg className="w-3.5 h-3.5 text-[#16A34A]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5a6.5 6.5 0 000-13M14.5 15a3 3 0 000-6M9.5 15a3 3 0 010-6M17 18.5a9.5 9.5 0 000-13" />
                      </svg>
                      <span className="text-[9px] sm:text-[10px] font-black tracking-widest">NFC</span>
                    </div>
                    <span className="text-[5.5px] sm:text-[7px] text-gray-400 font-medium">Approchez votre téléphone</span>
                  </div>
                </div>

                {/* Ligne 2 : Photo + Identité (Gauche) | QR Code + Scannez-moi (Droite) */}
                <div className="flex justify-between items-end z-10">
                  {/* Infos identité */}
                  <div className="flex flex-col space-y-1.5 sm:space-y-2">
                    <div className="flex items-center space-x-2.5 sm:space-x-3">
                      {/* Photo de profil */}
                      <div className="relative w-14 h-14 sm:w-18 sm:h-18 rounded-[12px] sm:rounded-[16px] overflow-hidden border-2 border-white/20 bg-secondary shadow-md shrink-0 bg-[#0B2040]">
                        <img
                          src={activeHolder.avatarUrl || "/avatars/ousmane.png"}
                          alt={activeHolder.name}
                          className="w-full h-full object-cover object-top"
                          crossOrigin="anonymous"
                        />
                      </div>
                      {/* Nom & Poste */}
                      <div className="flex flex-col">
                        <h2 className="text-xs sm:text-sm font-extrabold text-white leading-tight tracking-tight">
                          {activeHolder.name}
                        </h2>
                        <span className="text-[8px] sm:text-[9.5px] font-bold text-[#16A34A] mt-0.5 leading-none">
                          {activeHolder.title}
                        </span>
                        
                        {/* Badge de disponibilité style pill */}
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-0.5 rounded-[4px] text-[6px] sm:text-[7px] font-extrabold uppercase tracking-wider text-white ${activeHolder.availability === "available" ? "bg-[#16A34A]" : "bg-red-600"}`}>
                            {activeHolder.availability === "available" ? "DISPONIBLE" : "NON DISPONIBLE"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* ID de la carte */}
                    <span className="text-[7.5px] sm:text-[9px] font-mono text-[#16A34A] font-bold tracking-wider">
                      ID : {activeHolder.id}
                    </span>
                  </div>

                  {/* QR Code et Bouton d'appel à l'action */}
                  <div className="flex flex-col items-center space-y-1.5 shrink-0">
                    <div className="p-0.5 bg-white rounded-lg shadow-md w-14 h-14 flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${typeof window !== "undefined" ? window.location.origin : ""}/${selectedCard.slug}`)}`}
                        alt="QR Code"
                        className="w-full h-full object-contain"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <div className="bg-[#F97316] text-white text-[7px] sm:text-[8px] font-black px-2 py-0.5 rounded-full flex items-center space-x-1 uppercase tracking-wider shadow-md border border-[#F97316]/30">
                      <Smartphone className="w-2.5 h-2.5 text-white" />
                      <span>Scannez-moi</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ══════════════════════════════════════════
                  VERSO DE LA CARTE
                  ══════════════════════════════════════════ */
              <div
                ref={cardRef}
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
                    <div className="flex flex-col items-end leading-none gap-0.5">
                      <span className="text-[5px] text-white/50 font-bold uppercase tracking-widest">Powered by</span>
                      <div className="h-4 relative aspect-[3.5/1] flex items-center">
                        <img
                          src="/images/BarakoKeneyanoir.png"
                          alt="Logo Baarako Keneyaso"
                          className="h-full w-auto object-contain"
                        />
                      </div>
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
                onClick={() => handleExportPDF(activeHolder)}
                disabled={exporting}
                className="flex items-center justify-center gap-2 py-2.5 cursor-pointer text-xs"
              >
                <Printer className="w-4 h-4 text-brand-orange" />
                <span>{exporting ? "Export en cours..." : "Exporter en PDF"}</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExportTIFF(activeHolder)}
                disabled={exporting}
                className="flex items-center justify-center gap-2 py-2.5 cursor-pointer text-xs"
              >
                <Download className="w-4 h-4 text-brand-green" />
                <span>{exporting ? "Export en cours..." : "Exporter en TIFF"}</span>
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
