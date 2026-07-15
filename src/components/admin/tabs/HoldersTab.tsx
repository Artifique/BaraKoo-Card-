// Onglet de gestion des titulaires (Fiches profils et contacts associés)
"use client"

import * as React from "react"
import { useState } from "react"
import { Search, Plus, ToggleRight, ToggleLeft, Eye, Edit } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HolderCreateForm } from "../forms/HolderCreateForm"
import { HolderEditForm } from "../forms/HolderEditForm"
import { CardHolder, Card as CardType } from "@/lib/types"

interface HoldersTabProps {
  holders: CardHolder[]
  cards: CardType[]
  loading: boolean
  onToggleAvailability: (holder: CardHolder) => Promise<void>
  onCreateHolder: (newHolder: Partial<CardHolder>) => Promise<void>
  onEditHolder: (updatedHolder: CardHolder) => Promise<void>
}

export function HoldersTab({
  holders,
  cards,
  loading,
  onToggleAvailability,
  onCreateHolder,
  onEditHolder
}: HoldersTabProps) {
  const [editingHolder, setEditingHolder] = useState<CardHolder | null>(null)
  const [isAddingHolder, setIsAddingHolder] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Filtrer les titulaires par recherche
  const holdersFiltrés = holders.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateSubmit = async (newHolder: Partial<CardHolder>) => {
    await onCreateHolder(newHolder)
    setIsAddingHolder(false)
  }

  const handleEditSubmit = async (updatedHolder: CardHolder) => {
    await onEditHolder(updatedHolder)
    setEditingHolder(null)
  }

  return (
    <div className="space-y-6">
      {/* Barre d'actions en haut */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un profil..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border border-border/40 rounded-2xl pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-orange/50 transition-colors"
          />
        </div>
        
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setIsAddingHolder(true)
          }}
          className="flex items-center justify-center gap-2 py-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Titulaire</span>
        </Button>
      </div>

      {/* Formulaire de création */}
      {isAddingHolder && (
        <HolderCreateForm
          initialId={`BJ-2026-${String(Math.floor(Math.random() * 1000) + 200).padStart(6, "0")}`}
          onClose={() => setIsAddingHolder(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {/* Formulaire d'édition */}
      {editingHolder && (
        <HolderEditForm
          holder={editingHolder}
          onClose={() => setEditingHolder(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Table des Profils */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/30 text-muted-foreground text-xs uppercase font-bold">
                  <th className="py-3 px-4">Nom / Profil</th>
                  <th className="py-3 px-4">Identifiant</th>
                  <th className="py-3 px-4">Disponibilité</th>
                  <th className="py-3 px-4">Réseaux Liés</th>
                  <th className="py-3 px-4">Coordonnées</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holdersFiltrés.map(holder => {
                  const linksCount = [
                    holder.linkedin,
                    holder.facebook,
                    holder.instagram,
                    holder.twitter,
                    holder.website
                  ].filter(Boolean).length

                  const holderCard = cards.find(c => c.holderId === holder.id)
                  const pathSlug = holderCard?.slug || ""

                  return (
                    <tr key={holder.id} className="border-b border-border/20 hover:bg-muted/10 text-foreground">
                      <td className="py-3.5 px-4 flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden relative border border-border/30">
                          <Image
                            src={holder.avatarUrl || "/avatars/ousmane.png"}
                            alt={holder.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-semibold block leading-none">{holder.name}</span>
                          <span className="text-[11px] text-brand-green font-medium mt-1 inline-block">
                            {holder.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground">{holder.id}</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onToggleAvailability(holder)}
                          className="flex items-center gap-1.5 focus:outline-none cursor-pointer"
                        >
                          {holder.availability === "available" ? (
                            <>
                              <ToggleRight className="w-6 h-6 text-brand-green" />
                              <span className="text-xs text-brand-green font-semibold">Disponible</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-6 h-6 text-brand-red" />
                              <span className="text-xs text-brand-red font-semibold">Non Dispo</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary border border-border/35">
                          {linksCount} liens
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        <div className="leading-tight">{holder.phone}</div>
                        <div className="leading-tight mt-0.5">{holder.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {pathSlug && (
                            <Link href={`/${pathSlug}`} target="_blank">
                              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" title="Aperçu public">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => setEditingHolder(holder)}
                            className="w-8 h-8 rounded-lg"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4 text-brand-orange" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {holdersFiltrés.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-xs py-8 text-muted-foreground">
                      Aucun profil trouvé pour cette recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
