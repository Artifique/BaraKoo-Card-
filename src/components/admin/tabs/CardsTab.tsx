// Onglet Gabarits & Cartes (Aperçu de la carte physique et désactivation en direct)
"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { CreditCard, ArrowRight, Wifi, AlertTriangle, Smartphone } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { CardHolder, Card as CardType } from "@/lib/types"

interface CardsTabProps {
  holders: CardHolder[]
  cards: CardType[]
  onToggleCardStatus: (card: CardType) => Promise<void>
}

export function CardsTab({ holders, cards, onToggleCardStatus }: CardsTabProps) {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)

  // Sélectionner la première carte par défaut
  useEffect(() => {
    if (cards.length > 0 && !selectedCard) {
      setSelectedCard(cards[0])
    }
  }, [cards, selectedCard])

  // Rechercher les données du titulaire lié à la carte sélectionnée
  const activeHolder = selectedCard ? holders.find(h => h.id === selectedCard.holderId) : null

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
        <div className="text-sm font-semibold text-foreground pb-1 border-b border-border/30">
          Aperçu Graphique de la Carte Physique (NFC/QR)
        </div>

        {selectedCard && activeHolder ? (
          <div className="space-y-4">
            {/* Conteneur principal de la carte physique respectant le ratio standard d'une carte bancaire (CR80 : ~1.58) */}
            <div
              className="w-full rounded-3xl shadow-2xl relative overflow-hidden text-white select-none border border-white/10"
              style={{
                backgroundColor: "#0c2547",
                aspectRatio: "1.586 / 1",
              }}
            >
              {/* Vague décorative tricolore (Orange, Vert, Bleu) */}
              <div className="absolute right-[33%] inset-y-0 w-8 pointer-events-none z-10 overflow-hidden">
                <svg
                  viewBox="0 0 100 500"
                  className="h-full w-full"
                  preserveAspectRatio="none"
                >
                  {/* Ligne orange */}
                  <path
                    d="M 100 0 C 40 150, 0 300, 30 500 L 100 500 Z"
                    fill="#F97316"
                  />
                  {/* Ligne verte */}
                  <path
                    d="M 100 0 C 60 150, 25 300, 55 500 L 100 500 Z"
                    fill="#16A34A"
                  />
                  {/* Masquage de fond */}
                  <path
                    d="M 100 0 C 75 150, 48 300, 75 500 L 100 500 Z"
                    fill="#0c2547"
                  />
                </svg>
              </div>

              {/* Contenu global avec disposition Flexbox */}
              <div className="absolute inset-0 flex">
                
                {/* ── PARTIE GAUCHE (Logo, Info Titulaire, Photo) ── */}
                <div className="w-[66%] h-full flex flex-col justify-between p-4 z-20">
                  {/* Logo et slogan */}
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center relative">
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

                  {/* Détails du titulaire avec Photo */}
                  <div className="flex items-end space-x-3 mt-auto">
                    {/* Photo de profil */}
                    <div className="w-16 h-[84px] rounded-xl overflow-hidden border border-white/20 shadow-md shrink-0 bg-[#0B2040] relative">
                      <Image
                        src={activeHolder.avatarUrl || "/avatars/ousmane.png"}
                        alt={activeHolder.name}
                        fill
                        className="object-cover object-top"
                      />
                    </div>

                    {/* Informations textuelles */}
                    <div className="flex flex-col space-y-1 mb-1 min-w-0">
                      <h4 className="text-sm font-bold text-white tracking-wide truncate leading-none">
                        {activeHolder.name}
                      </h4>
                      <p className="text-[9.5px] text-[#16A34A] font-semibold leading-none">
                        {activeHolder.title}
                      </p>

                      {/* Badge DISPONIBLE / NON DISPONIBLE */}
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

                  {/* ID en bas à gauche */}
                  <div className="text-[8px] font-semibold text-[#16A34A] tracking-wider mt-1.5 leading-none">
                    ID : {activeHolder.id}
                  </div>
                </div>

                {/* ── PARTIE DROITE (NFC, QR Code, Bouton Scan) ── */}
                <div className="w-[34%] h-full flex flex-col justify-between items-center py-4 px-2 bg-[#0c2547]/80 border-l border-white/5 z-20">
                  {/* NFC Logo & Text */}
                  <div className="flex flex-col items-center text-center space-y-0.5">
                    <Wifi className="w-5 h-5 text-white/90 rotate-90" />
                    <span className="text-[9px] font-extrabold tracking-widest text-white">NFC</span>
                    <span className="text-[6.5px] text-white/70 leading-tight">
                      Approchez votre<br />téléphone
                    </span>
                  </div>

                  {/* QR Code */}
                  <div className="bg-white p-1 rounded-xl shadow-lg w-16 h-16 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${window.location.origin}/${selectedCard.slug}`)}`}
                      alt="QR Code"
                      className="w-full h-full block"
                    />
                  </div>

                  {/* Bouton Scannez-moi */}
                  <div className="bg-[#F97316] text-white rounded-lg px-2 py-1 flex items-center justify-center space-x-1 shadow-md w-full max-w-[85px]">
                    <Smartphone className="w-2.5 h-2.5 shrink-0" />
                    <span className="text-[7.5px] font-extrabold tracking-wide whitespace-nowrap">Scannez-moi</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Guide d'information */}
            <div className="p-3 bg-muted/40 border border-border/20 rounded-2xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F97316] shrink-0" />
              <p className="text-[10px] text-muted-foreground leading-snug">
                Ce gabarit représente visuellement la carte physique finale NFC/QR. Si vous désactivez la carte,
                toutes les requêtes de scan redirigeront vers une page d&apos;indisponibilité.
              </p>
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
