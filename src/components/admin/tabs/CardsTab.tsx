// Onglet Gabarits & Cartes (Aperçu de la carte physique et désactivation en direct)
"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { CreditCard, ArrowRight, Wifi, AlertTriangle } from "lucide-react"
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
            {/* Rendu Recto de la carte physique */}
            <div className="w-full aspect-[1.58/1] rounded-3xl bg-[#061830] border border-white/10 p-5 shadow-2xl relative flex flex-col justify-between overflow-hidden text-white">
              
              {/* Lignes décoratives stylisées */}
              <div className="absolute right-0 top-0 bottom-0 w-32 border-l border-brand-orange/40 rounded-l-full overflow-hidden flex items-center justify-center pointer-events-none">
                <div className="w-full h-[150%] border-l-2 border-brand-green/40 rounded-l-full" />
              </div>

              {/* Ligne haute : logo et antenne NFC */}
              <div className="flex items-start justify-between z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-orange flex items-center justify-center text-white font-extrabold text-sm shadow">
                    B
                  </div>
                  <div>
                    <span className="text-xs font-black text-white tracking-widest leading-none block">Baarako</span>
                    <span className="text-[10px] text-brand-orange font-bold leading-none">Jobcard</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end text-white/80">
                  <Wifi className="w-4 h-4 text-white/60 rotate-90" />
                  <span className="text-[7px] font-bold uppercase tracking-widest mt-1">NFC</span>
                </div>
              </div>

              {/* Ligne centrale/basse : Photo et QR code */}
              <div className="flex items-end space-x-3.5 z-10">
                {/* Photo de profil */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/20 shadow bg-brand-navy-light shrink-0">
                  <Image
                    src={activeHolder.avatarUrl || "/avatars/ousmane.png"}
                    alt={activeHolder.name}
                    fill
                    className="object-cover object-top"
                  />
                </div>

                {/* Coordonnées textuelles */}
                <div className="flex-1 min-w-0 pb-1">
                  <span className="text-[9px] font-mono text-brand-green/70 block leading-none mb-1">
                    {activeHolder.id}
                  </span>
                  <h4 className="text-xs font-bold text-white leading-tight truncate">
                    {activeHolder.name}
                  </h4>
                  <p className="text-[9px] text-brand-green font-medium mt-0.5 truncate">
                    {activeHolder.title}
                  </p>
                  
                  <Badge
                    variant={activeHolder.availability === "available" ? "success" : "destructive"}
                    className="text-[7px] px-1.5 py-0 mt-2"
                  >
                    {activeHolder.availability === "available" ? "DISPONIBLE" : "NON DISPONIBLE"}
                  </Badge>
                </div>

                {/* Bloc QR Code */}
                <div className="flex flex-col items-center space-y-1 self-center">
                  <div className="w-14 h-14 bg-white p-1 rounded-lg shadow-md flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${window.location.origin}/${selectedCard.slug}`}
                      alt="QR Code Carte"
                      className="w-full h-full"
                    />
                  </div>
                  <span className="text-[6px] text-white/60 font-bold uppercase tracking-wider">Scan</span>
                </div>
              </div>

              {/* Texte discret en bas */}
              <div className="absolute bottom-2 left-5 text-[6px] text-white/40 z-10 uppercase tracking-widest">
                Propriété exclusive de Baarako Card
              </div>
            </div>
            
            {/* Guide d'information */}
            <div className="p-3 bg-muted/40 border border-border/20 rounded-2xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-brand-orange shrink-0" />
              <p className="text-[10px] text-muted-foreground leading-snug">
                Ce gabarit représente visuellement la carte physique finale NFC/QR. Si vous désactivez la carte,
                toutes les requêtes de scan redirigeront vers une page d'indisponibilité.
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
