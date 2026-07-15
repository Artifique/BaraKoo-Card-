// Formulaire de création d'une fiche titulaire
"use client"

import * as React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CardHolder } from "@/lib/types"

interface HolderCreateFormProps {
  onClose: () => void
  onSubmit: (newHolder: Partial<CardHolder>) => Promise<void>
  initialId: string
}

export function HolderCreateForm({ onClose, onSubmit, initialId }: HolderCreateFormProps) {
  const [formData, setFormData] = useState<Partial<CardHolder>>({
    id: initialId,
    name: "",
    title: "",
    bio: "",
    avatarUrl: "/avatars/ousmane.png", // Photo par défaut
    status: "active",
    availability: "available",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    googleMapsUrl: "",
    linkedin: "",
    facebook: "",
    instagram: "",
    twitter: "",
    website: "",
    organizationId: "org-1" // Valeur par défaut de l'organisation démo
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id || !formData.name || !formData.title) {
      alert("Veuillez remplir les champs obligatoires (ID, Nom, Poste)")
      return
    }
    await onSubmit(formData)
  }

  return (
    <Card className="border-brand-orange/40 shadow-xl">
      <CardHeader className="flex flex-row justify-between items-center pb-4">
        <div>
          <CardTitle>Créer une Fiche Titulaire</CardTitle>
          <CardDescription>
            Complétez les coordonnées du titulaire (aucune interface côté client requise).
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
              <label className="text-xs text-muted-foreground font-semibold">Identifiant Unique</label>
              <input
                type="text"
                required
                value={formData.id}
                onChange={e => setFormData(prev => ({ ...prev, id: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-orange"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-semibold">Nom Complet</label>
              <input
                type="text"
                required
                placeholder="Ousmane Diarra"
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
                placeholder="Gestionnaire de Projets"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-semibold">Biographie</label>
              <textarea
                placeholder="Brève biographie professionnelle..."
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
                  placeholder="+223 76 54 32 10"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-orange"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-semibold">WhatsApp</label>
                <input
                  type="text"
                  placeholder="+223 76 54 32 10"
                  value={formData.whatsapp}
                  onChange={e => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-semibold">Email</label>
                <input
                  type="email"
                  placeholder="name@baarako.com"
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
                placeholder="Lien profil LinkedIn..."
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
            <Button variant="success" size="sm" type="submit">
              Créer la fiche & Activer la carte
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
