// Formulaire de création d'une fiche titulaire
"use client"

import * as React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CardHolder, Organization } from "@/lib/types"

interface HolderCreateFormProps {
  onClose: () => void
  onSubmit: (newHolder: Partial<CardHolder>) => Promise<void>
  initialId: string
  organizations: Organization[]
}

export function HolderCreateForm({ onClose, onSubmit, initialId, organizations }: HolderCreateFormProps) {
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
    organizationId: organizations[0]?.id || "", // Lier à la première organisation par défaut
    serviceId: ""
  })

  const [uploading, setUploading] = useState(false)
  const [uploadingCv, setUploadingCv] = useState(false)
  const [uploadingLettre, setUploadingLettre] = useState(false)

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "cvUrl" | "lettreMotivationUrl", prefix: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (fieldName === "cvUrl") setUploadingCv(true)
    else setUploadingLettre(true)

    try {
      const data = new FormData()
      data.append("file", file)
      data.append("bucket", "bucket-images")
      data.append("prefix", prefix)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Erreur de téléversement")

      setFormData(prev => ({ ...prev, [fieldName]: result.url }))
    } catch (erreur: any) {
      alert("Erreur de téléversement : " + erreur.message)
    } finally {
      if (fieldName === "cvUrl") setUploadingCv(false)
      else setUploadingLettre(false)
    }
  }

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const data = new FormData()
      data.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Erreur de téléversement")

      setFormData(prev => ({ ...prev, avatarUrl: result.url }))
    } catch (erreur: any) {
      alert("Erreur de téléversement : " + erreur.message)
    } finally {
      setUploading(false)
    }
  }

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
          
          {/* Section d'upload de photo de profil */}
          <div className="flex items-center space-x-4 p-3 bg-secondary/35 border border-border/20 rounded-2xl">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-border/40 shrink-0 bg-secondary flex items-center justify-center">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Aperçu avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] text-muted-foreground">Photo</span>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                disabled={uploading}
                className="hidden"
                id="avatar-create-input"
              />
              <label
                htmlFor="avatar-create-input"
                className={`
                  inline-block px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-300
                  ${uploading 
                    ? "bg-secondary text-muted-foreground border-border/30" 
                    : "bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange border-brand-orange/20"
                  }
                `}
              >
                {uploading ? "Chargement..." : "Téléverser une photo de profil"}
              </label>
              <p className="text-[9px] text-muted-foreground mt-1">Format recommandé : Carré, PNG ou JPG</p>
            </div>
          </div>

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

              <div className="space-y-1.5 col-span-2">
                <label className="text-xs text-muted-foreground font-semibold">Organisation / Entreprise</label>
                <select
                  value={formData.organizationId || ""}
                  onChange={e => setFormData(prev => ({ ...prev, organizationId: e.target.value, serviceId: "" }))}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-orange"
                >
                  <option className="bg-[#081d38] text-white" value="">— Aucune —</option>
                  {organizations.map(org => (
                    <option key={org.id} className="bg-[#081d38] text-white" value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.organizationId && (
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs text-muted-foreground font-semibold">Service / Département</label>
                  <select
                    value={formData.serviceId || ""}
                    onChange={e => setFormData(prev => ({ ...prev, serviceId: e.target.value }))}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-orange"
                  >
                    <option className="bg-[#081d38] text-white" value="">— Aucun —</option>
                    {(organizations.find(o => o.id === formData.organizationId)?.services || []).map((srv: any) => (
                      <option key={srv.id} className="bg-[#081d38] text-white" value={srv.id}>
                        {srv.nom}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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

          {/* Section d'upload de documents (CV & Lettre de motivation) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/20">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-semibold block">Curriculum Vitae (CV)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => handleUploadDocument(e, "cvUrl", "cv")}
                  disabled={uploadingCv}
                  className="hidden"
                  id="cv-create-input"
                />
                <label
                  htmlFor="cv-create-input"
                  className={`
                    inline-block px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-300
                    ${uploadingCv 
                      ? "bg-secondary text-muted-foreground border-border/30" 
                      : "bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange border-brand-orange/20"
                    }
                  `}
                >
                  {uploadingCv ? "Téléchargement..." : formData.cvUrl ? "Remplacer le CV" : "Téléverser le CV"}
                </label>
                {formData.cvUrl && (
                  <span className="text-[10px] text-brand-green font-semibold truncate max-w-[150px]">
                    ✓ Chargé
                  </span>
                )}
              </div>
              <p className="text-[9px] text-muted-foreground">Formats acceptés : PDF, DOCX (Max 5Mo)</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-semibold block">Lettre de Motivation</label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => handleUploadDocument(e, "lettreMotivationUrl", "lettre")}
                  disabled={uploadingLettre}
                  className="hidden"
                  id="lettre-create-input"
                />
                <label
                  htmlFor="lettre-create-input"
                  className={`
                    inline-block px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-300
                    ${uploadingLettre 
                      ? "bg-secondary text-muted-foreground border-border/30" 
                      : "bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange border-brand-orange/20"
                    }
                  `}
                >
                  {uploadingLettre ? "Téléchargement..." : formData.lettreMotivationUrl ? "Remplacer la Lettre" : "Téléverser la Lettre"}
                </label>
                {formData.lettreMotivationUrl && (
                  <span className="text-[10px] text-brand-green font-semibold truncate max-w-[150px]">
                    ✓ Chargé
                  </span>
                )}
              </div>
              <p className="text-[9px] text-muted-foreground">Formats acceptés : PDF, DOCX (Max 5Mo)</p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-border/10">
            <Button variant="destructive" size="sm" type="button" onClick={onClose}>
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
