// Formulaire de création d'une nouvelle commande client
"use client"

import React, { useState } from "react"
import { ShoppingBag, User, Mail, Phone, Package, FileText, Loader2, X } from "lucide-react"
import type { Organization } from "@/lib/types"

interface OrderCreateFormProps {
  /** Liste des organisations existantes pour le sélecteur */
  organizations: Organization[]
  /** Callback appelé après la création réussie */
  onSuccess: (order: any) => void
  /** Callback pour fermer le formulaire */
  onCancel: () => void
}

const TYPES_OFFRE = [
  { value: "simple_qr", label: "Carte Simple QR Code" },
  { value: "nfc_qr", label: "Carte NFC + QR Code" },
  { value: "enterprise", label: "Pack Entreprise (≥ 5 cartes)" },
] as const

export function OrderCreateForm({ organizations, onSuccess, onCancel }: OrderCreateFormProps) {
  const [loading, setLoading] = useState(false)
  const [orgSelectionnee, setOrgSelectionnee] = useState<Organization | null>(null)
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    quantity: 1,
    offerType: "nfc_qr" as "simple_qr" | "nfc_qr" | "enterprise",
    paymentStatus: "pending" as "pending" | "paid",
    notes: "",
  })

  const update = (champ: string, valeur: any) =>
    setForm(prev => ({ ...prev, [champ]: valeur }))

  // Pré-remplir les infos client depuis l'organisation sélectionnée
  const handleSelectOrg = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId)
    setOrgSelectionnee(org ?? null)
    if (org) {
      setForm(prev => ({
        ...prev,
        clientName: org.name,
        clientEmail: org.email || "",
        clientPhone: org.phone || "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientName.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/orders", {
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

      {/* En-tête */}
      <div className="flex items-center justify-between pb-2 border-b border-border/20">
        <div className="flex items-center gap-2 text-brand-orange">
          <ShoppingBag className="w-4 h-4" />
          <span className="text-sm font-bold">Nouvelle Commande</span>
        </div>
        <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sélecteur d'organisation (optionnel — pré-remplit le formulaire) */}
      <div>
        <label className={labelStyle}>Organisation commanditaire (optionnel)</label>
        <select
          onChange={e => handleSelectOrg(e.target.value)}
          className={`${champStyle} text-foreground`}
        >
          <option value="">— Sélectionner une organisation —</option>
          {organizations.map(org => (
            <option key={org.id} value={org.id}>{org.name} ({org.sector})</option>
          ))}
        </select>
        {orgSelectionnee && (
          <p className="text-[10px] text-brand-green mt-1 pl-1">
            ✓ Organisation sélectionnée — les informations client ont été pré-remplies.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nom du client */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Nom du client *</label>
          <div className="relative">
            <User className={iconStyle} />
            <input
              required
              placeholder="Nom de l'entreprise ou du particulier"
              value={form.clientName}
              onChange={e => update("clientName", e.target.value)}
              className={`${champStyle} pl-10`}
            />
          </div>
        </div>

        {/* Email client */}
        <div>
          <label className={labelStyle}>Email</label>
          <div className="relative">
            <Mail className={iconStyle} />
            <input
              type="email"
              placeholder="client@email.com"
              value={form.clientEmail}
              onChange={e => update("clientEmail", e.target.value)}
              className={`${champStyle} pl-10`}
            />
          </div>
        </div>

        {/* Téléphone client */}
        <div>
          <label className={labelStyle}>Téléphone</label>
          <div className="relative">
            <Phone className={iconStyle} />
            <input
              placeholder="+223 70 00 00 00"
              value={form.clientPhone}
              onChange={e => update("clientPhone", e.target.value)}
              className={`${champStyle} pl-10`}
            />
          </div>
        </div>

        {/* Type d'offre */}
        <div>
          <label className={labelStyle}>Type d'offre *</label>
          <div className="relative">
            <Package className={iconStyle} />
            <select
              required
              value={form.offerType}
              onChange={e => update("offerType", e.target.value)}
              className={`${champStyle} pl-10`}
            >
              {TYPES_OFFRE.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantité */}
        <div>
          <label className={labelStyle}>Quantité *</label>
          <input
            type="number"
            min={1}
            required
            value={form.quantity}
            onChange={e => update("quantity", parseInt(e.target.value))}
            className={champStyle}
          />
        </div>

        {/* Statut de paiement initial */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Statut du paiement initial</label>
          <div className="flex gap-3">
            {[
              { value: "pending", label: "En Attente" },
              { value: "paid", label: "Déjà Payé" },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("paymentStatus", opt.value)}
                className={`
                  flex-1 py-2.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer
                  ${form.paymentStatus === opt.value
                    ? "bg-brand-orange text-white border-brand-orange glow-orange"
                    : "border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Notes / Remarques internes</label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
            <textarea
              rows={3}
              placeholder="Détails supplémentaires sur la commande..."
              value={form.notes}
              onChange={e => update("notes", e.target.value)}
              className={`${champStyle} pl-10 resize-none`}
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
          disabled={loading || !form.clientName.trim()}
          className="
            px-5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-brand-orange
            hover:bg-brand-orange/90 glow-orange flex items-center gap-2
            transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
          "
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShoppingBag className="w-3.5 h-3.5" />}
          <span>{loading ? "Création..." : "Enregistrer la commande"}</span>
        </button>
      </div>
    </form>
  )
}
