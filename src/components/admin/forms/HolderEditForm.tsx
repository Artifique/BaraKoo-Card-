// Formulaire d'édition d'une fiche titulaire existante
"use client"

import * as React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CardHolder } from "@/lib/types"

interface HolderEditFormProps {
  holder: CardHolder
  onClose: () => void
  onSubmit: (updatedHolder: CardHolder) => Promise<void>
}

export function HolderEditForm({ holder, onClose, onSubmit }: HolderEditFormProps) {
  const [formData, setFormData] = useState<CardHolder>({ ...holder })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.title) {
      alert("Veuillez remplir les champs obligatoires (Nom, Poste)")
      return
    }
    await onSubmit(formData)
  }

  return (
    <Card className="border-brand-orange/40 shadow-xl">
      <CardHeader className="flex flex-row justify-between items-center pb-4">
        <div>
          <CardTitle>Modifier le Profil de {holder.name}</CardTitle>
          <CardDescription>
            Les modifications s'appliquent immédiatement au scan de la carte.
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} type="button">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-semibold">Nom Complet</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-semibold">Poste / Fonction</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-semibold">Statut Fiche</label>
              <select
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as "active" | "suspended" }))}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-orange"
              >
                <option className="bg-[#081d38] text-white" value="active">Actif</option>
                <option className="bg-[#081d38] text-white" value="suspended">Suspendu (Brouillon)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-semibold">Biographie</label>
              <textarea
                value={formData.bio}
                onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-orange h-24 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-semibold">Téléphone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-orange"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-semibold">WhatsApp</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={e => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-semibold">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-semibold">Disponibilité</label>
                <select
                  value={formData.availability}
                  onChange={e => setFormData(prev => ({ ...prev, availability: e.target.value as "available" | "unavailable" }))}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-orange"
                >
                  <option className="bg-[#081d38] text-white" value="available">Disponible</option>
                  <option className="bg-[#081d38] text-white" value="unavailable">Non Disponible</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border/20">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-semibold">LinkedIn</label>
              <input
                type="text"
                placeholder="https://linkedin.com/in/..."
                value={formData.linkedin}
                onChange={e => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-orange"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-semibold">Site Web personnel</label>
              <input
                type="text"
                placeholder="https://..."
                value={formData.website}
                onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-orange"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-semibold">Google Maps Adresse</label>
              <input
                type="text"
                placeholder="Lien de géolocalisation..."
                value={formData.googleMapsUrl}
                onChange={e => setFormData(prev => ({ ...prev, googleMapsUrl: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-border/10">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
