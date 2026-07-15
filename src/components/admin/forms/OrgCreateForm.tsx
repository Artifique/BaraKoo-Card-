// Formulaire de création d'une nouvelle organisation cliente
"use client"

import React, { useState } from "react"
import { Building2, Globe, Phone, Mail, MapPin, Loader2, X } from "lucide-react"

interface OrgCreateFormProps {
  /** Callback appelé après la création réussie */
  onSuccess: (org: any) => void
  /** Callback pour fermer le formulaire */
  onCancel: () => void
}

export function OrgCreateForm({ onSuccess, onCancel }: OrgCreateFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    sector: "",
    description: "",
    address: "",
    website: "",
    phone: "",
    email: "",
    logoUrl: "",
  })

  const update = (champ: string, valeur: string) =>
    setForm(prev => ({ ...prev, [champ]: valeur }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.sector.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création.")

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

      {/* Bouton fermer */}
      <div className="flex items-center justify-between pb-2 border-b border-border/20">
        <div className="flex items-center gap-2 text-brand-orange">
          <Building2 className="w-4 h-4" />
          <span className="text-sm font-bold">Nouvelle Organisation</span>
        </div>
        <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nom de l'entreprise */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Nom de l'organisation *</label>
          <div className="relative">
            <Building2 className={iconStyle} />
            <input
              required
              placeholder="Ex. : Société Kamit SARL"
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
            placeholder="Ex. : Finance & Banque"
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
            placeholder="Courte présentation de l'organisation..."
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
              placeholder="Ex. : ACI 2000, Bamako, Mali"
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
              placeholder="https://www.monentreprise.com"
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
              placeholder="+223 70 00 00 00"
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
              placeholder="contact@entreprise.com"
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
          disabled={loading || !form.name.trim() || !form.sector.trim()}
          className="
            px-5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-brand-orange
            hover:bg-brand-orange/90 glow-orange flex items-center gap-2
            transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
          "
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Building2 className="w-3.5 h-3.5" />}
          <span>{loading ? "Enregistrement..." : "Créer l'organisation"}</span>
        </button>
      </div>
    </form>
  )
}
