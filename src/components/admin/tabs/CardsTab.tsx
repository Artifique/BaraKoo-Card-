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

                  {/* Contenu zone droite : Logo Baarako + QR + Scannez-moi */}
                  <div className="relative z-10 h-full flex flex-col items-center justify-between py-3 px-2">
                    {/* Logo Baarako + Texte d'approche */}
                    <div className="flex flex-col items-center gap-0.5 mt-1 text-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-black/35 border border-white/10 shrink-0 flex items-center justify-center relative">
                        <Image
                          src="/images/BarakoKeneyanoir.png"
                          alt="Logo Baarako"
                          fill
                          className="object-cover scale-110"
                        />
                      </div>
                      <span className="text-[9px] font-black tracking-wide text-white mt-1">Baarako</span>
                      <span className="text-[6.5px] text-white/80 leading-tight">Approchez votre<br />téléphone</span>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white p-1 rounded-xl shadow-xl w-14 h-14 flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${typeof window !== "undefined" ? window.location.origin : ""}/${selectedCard.slug}`)}`}
                        alt="QR Code"
                        className="w-full h-full block"
                        crossOrigin="anonymous"
                      />
                    </div>

                    {/* Bouton Scannez-moi */}
                    <div className="flex items-center gap-1 bg-[#F97316] rounded-lg px-2.5 py-1 shadow-lg w-full max-w-[85px] justify-center">
                      <Smartphone className="w-2.5 h-2.5 text-white shrink-0" />
                      <span className="text-[7.5px] font-black text-white tracking-wide uppercase whitespace-nowrap">Scannez-moi</span>
                    </div>
                  </div>
                </div>

                {/* ── Zone gauche / centrale ── */}
                <div className="absolute inset-0 w-[62%] flex flex-col justify-between p-4">
                  {/* Ligne haute : Logo de l'organisation */}
                  {activeHolderOrg ? (
                    <div className="flex flex-col items-start leading-none gap-0.5 max-w-[90%]">
                      <div className="h-10 relative aspect-[2.8/1] flex items-center">
                        <img
                          src={activeHolderOrg.logoUrl}
                          alt={activeHolderOrg.name}
                          className="h-full w-auto object-contain"
                          crossOrigin="anonymous"
                        />
                      </div>
                      {activeHolderOrg.description && (
                        <span className="text-[6.5px] text-white/80 font-semibold tracking-wide">
                          {activeHolderOrg.description}
                        </span>
                      )}
                    </div>
                  ) : (
                    /* Logo Baarako Jobcard par défaut */
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
                  )}

                  {/* Ligne basse : Photo + Infos */}
                  <div className="flex items-end gap-3 mt-auto">
                    {/* Photo de profil */}
                    <div className="relative w-18 h-18 rounded-[20px] overflow-hidden border border-white/20 shadow-lg shrink-0 bg-[#0B2040]">
                      <Image
                        src={activeHolder.avatarUrl || "/avatars/ousmane.png"}
                        alt={activeHolder.name}
                        fill
                        className="object-cover object-top"
                      />
                    </div>

                    {/* Infos textuelles */}
                    <div className="flex-1 pb-1 min-w-0">
                      <h4 className="text-sm font-extrabold text-white leading-tight truncate">
                        {activeHolder.name}
                      </h4>
                      <p className="text-[9.5px] text-[#16A34A] font-bold mt-0.5 truncate leading-none">
                        {activeHolder.title}
                      </p>

                      {/* Badge disponibilité */}
                      <div className="pt-1.5">
                        <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg ${
                          activeHolder.availability === "available"
                            ? "bg-[#16A34A] text-white"
                            : "bg-red-600 text-white"
                        }`}>
                          {activeHolder.availability === "available" ? "Disponible" : "Non Dispo"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ID sous la photo de profil */}
                  <div className="text-[8.5px] font-bold text-[#16A34A] tracking-wider mt-2.5 leading-none">
                    ID : {activeHolder.id}
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
                      <div className="h-4 relative aspect-[3/1] flex items-center">
                        <img
                          src="/images/logo.png"
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
