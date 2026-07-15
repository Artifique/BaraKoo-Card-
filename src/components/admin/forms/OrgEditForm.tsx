// Formulaire d'édition d'une organisation existante
"use client"

import React, { useState } from "react"
import { Building2, Globe, Phone, Mail, MapPin, Loader2, X } from "lucide-react"
import type { Organization } from "@/lib/types"

interface OrgEditFormProps {
  /** Organisation à modifier */
  organisation: Organization
  /** Callback appelé après la mise à jour réussie */
  onSuccess: (updated: Organization) => void
  /** Callback pour fermer le formulaire */
  onCancel: () => void
}

export function OrgEditForm({ organisation, onSuccess, onCancel }: OrgEditFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: organisation.name,
    sector: organisation.sector,
    description: organisation.description,
    address: organisation.address,
    website: organisation.website,
    phone: organisation.phone,
    email: organisation.email,
    logoUrl: organisation.logoUrl,
  })

  const update = (champ: string, valeur: string) =>
    setForm(prev => ({ ...prev, [champ]: valeur }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.sector.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/organizations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: organisation.id, ...form }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur lors de la mise à jour.")

      onSuccess(data)
    } catch (erreur: any) {
      throw erreur
    } finally {
      setLoading(false)
    }
  }

  const champStyle = `
    w-full px-4 py-2.5 rounded-2xl border text-sm font-medium text-foreground bg-transparent
    border-border/40 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 outline-none
    transition-all duration-300 placeholder:text-muted-foreground/40
  `
  const labelStyle = "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5"
  const iconStyle = "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* En-tête */}
      <div className="flex items-center justify-between pb-2 border-b border-border/20">
        <div className="flex items-center gap-2 text-brand-orange">
          <Building2 className="w-4 h-4" />
          <span className="text-sm font-bold">Modifier l'organisation</span>
        </div>
        <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nom */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Nom de l'organisation *</label>
          <div className="relative">
            <Building2 className={iconStyle} />
            <input
              required
              value={form.name}
              onChange={e => update("name", e.target.value)}
              className={`${champStyle} pl-10`}
            />
          </div>
        </div>

        {/* Secteur */}
        <div>
          <label className={labelStyle}>Secteur d'activité *</label>
          <input
            required
            value={form.sector}
            onChange={e => update("sector", e.target.value)}
            className={champStyle}
          />
        </div>

        {/* Logo URL */}
        <div>
          <label className={labelStyle}>URL du Logo</label>
          <input
            type="url"
            placeholder="https://..."
            value={form.logoUrl}
            onChange={e => update("logoUrl", e.target.value)}
            className={champStyle}
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={e => update("description", e.target.value)}
            className={`${champStyle} resize-none`}
          />
        </div>

        {/* Adresse */}
        <div>
          <label className={labelStyle}>Adresse</label>
          <div className="relative">
            <MapPin className={iconStyle} />
            <input
              value={form.address}
              onChange={e => update("address", e.target.value)}
              className={`${champStyle} pl-10`}
            />
          </div>
        </div>

        {/* Site web */}
        <div>
          <label className={labelStyle}>Site Web</label>
          <div className="relative">
            <Globe className={iconStyle} />
            <input
              type="url"
              placeholder="https://..."
              value={form.website}
              onChange={e => update("website", e.target.value)}
              className={`${champStyle} pl-10`}
            />
          </div>
        </div>

        {/* Téléphone */}
        <div>
          <label className={labelStyle}>Téléphone</label>
          <div className="relative">
            <Phone className={iconStyle} />
            <input
              value={form.phone}
              onChange={e => update("phone", e.target.value)}
              className={`${champStyle} pl-10`}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className={labelStyle}>Email de contact</label>
          <div className="relative">
            <Mail className={iconStyle} />
            <input
              type="email"
              value={form.email}
              onChange={e => update("email", e.target.value)}
              className={`${champStyle} pl-10`}
            />
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-2xl text-xs font-semibold border border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all cursor-pointer"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="
            px-5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-brand-orange
            hover:bg-brand-orange/90 glow-orange flex items-center gap-2
            transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
          "
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Building2 className="w-3.5 h-3.5" />}
          <span>{loading ? "Mise à jour..." : "Enregistrer les modifications"}</span>
        </button>
      </div>
    </form>
  )
}
