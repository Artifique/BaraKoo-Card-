// Onglet Paramètres : profil et modification du mot de passe admin
"use client"

import React, { useState, useEffect } from "react"
import { Shield, Key, Mail, User, Loader2, Save } from "lucide-react"
import { useNotification } from "@/providers/NotificationProvider"

interface AdminProfile {
  id: string
  nom: string
  email: string
  role: string
}

export function SettingsTab() {
  const { showDialog, showToast } = useNotification()
  const [admin, setAdmin] = useState<AdminProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // États du formulaire de mot de passe
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [updating, setUpdating] = useState(false)

  // Charger le profil connecté au montage
  useEffect(() => {
    async function chargerProfil() {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setAdmin(data.admin)
        }
      } catch (erreur) {
        console.error("Erreur chargement profil :", erreur)
      } finally {
        setLoadingProfile(false)
      }
    }
    chargerProfil()
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validations
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast("Veuillez remplir tous les champs du mot de passe.", "error")
      return
    }

    if (newPassword !== confirmPassword) {
      showToast("Le nouveau mot de passe et sa confirmation diffèrent.", "error")
      return
    }

    if (newPassword.length < 6) {
      showToast("Le nouveau mot de passe doit faire au moins 6 caractères.", "error")
      return
    }

    setUpdating(true)

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Impossible de modifier le mot de passe.")
      }

      // Vider le formulaire
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")

      // Afficher un dialogue de succès élégant
      showDialog(
        "Mot de passe mis à jour !",
        "Votre mot de passe d'administration a été modifié avec succès. Conservez-le précieusement pour votre prochaine connexion.",
        "success"
      )
    } catch (erreur: any) {
      showDialog(
        "Échec de la mise à jour",
        erreur.message || "Une erreur est survenue lors de la modification de votre mot de passe.",
        "error"
      )
    } finally {
      setUpdating(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-brand-orange animate-spin" />
        <span className="text-xs text-muted-foreground ml-2">Chargement des paramètres...</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* ─── Informations du Profil ─── */}
      <div className="lg:col-span-1 space-y-6">
        <div className="p-6 rounded-3xl border glass-card relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-brand-green/5 blur-xl" />
          
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-orange mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Profil Administrateur
          </h2>

          <div className="flex flex-col items-center py-4 border-b border-border/20 mb-4">
            <div className="w-16 h-16 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center text-brand-green font-black text-xl mb-3">
              {admin?.nom.slice(0, 2).toUpperCase() || "AD"}
            </div>
            <h3 className="text-base font-bold text-foreground">{admin?.nom || "Admin Baarako"}</h3>
            <span className="text-[10px] text-brand-green bg-brand-green-muted/20 px-2 py-0.5 rounded-full border border-brand-green/20 font-bold mt-1 tracking-wider uppercase">
              {admin?.role === "SUPER_ADMIN" ? "Super Administrateur" : "Agent"}
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-border/10">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Identifiant
              </span>
              <span className="font-mono text-foreground font-semibold truncate max-w-[150px]">{admin?.id}</span>
            </div>
            
            <div className="flex justify-between items-center py-1 border-b border-border/10">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Adresse e-mail
              </span>
              <span className="text-foreground font-semibold truncate max-w-[150px]" title={admin?.email}>{admin?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Formulaire de Modification du Mot de Passe ─── */}
      <div className="lg:col-span-2">
        <form onSubmit={handleChangePassword} className="p-6 rounded-3xl border glass-card space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-orange flex items-center gap-2">
            <Key className="w-4 h-4" />
            Sécurité & Mot de passe
          </h2>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Pour modifier votre mot de passe d'accès au back-office, veuillez saisir votre mot de passe actuel ainsi que le nouveau mot de passe souhaité.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ancien mot de passe */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Mot de passe actuel
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Saisissez votre mot de passe actuel"
                  className="
                    w-full pl-11 pr-4 py-2.5 rounded-2xl border text-xs font-medium text-white bg-transparent
                    border-border/40 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 outline-none
                    transition-all duration-300 placeholder:text-muted-foreground/30
                  "
                />
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 caractères"
                  className="
                    w-full pl-11 pr-4 py-2.5 rounded-2xl border text-xs font-medium text-white bg-transparent
                    border-border/40 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 outline-none
                    transition-all duration-300 placeholder:text-muted-foreground/30
                  "
                />
              </div>
            </div>

            {/* Confirmation du nouveau mot de passe */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ressaisissez le mot de passe"
                  className="
                    w-full pl-11 pr-4 py-2.5 rounded-2xl border text-xs font-medium text-white bg-transparent
                    border-border/40 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 outline-none
                    transition-all duration-300 placeholder:text-muted-foreground/30
                  "
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updating}
              className="
                px-5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide text-white bg-brand-orange
                hover:bg-brand-orange/90 glow-orange flex items-center space-x-2
                transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
              "
            >
              {updating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Modification en cours...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer le mot de passe</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}
