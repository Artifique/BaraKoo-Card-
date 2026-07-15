// Page de connexion pour l'administration
"use client"

import React, { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { useNotification } from "@/providers/NotificationProvider"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useNotification()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Page de redirection après connexion (défaut: /admin)
  const redirectPath = searchParams.get("from") || "/admin"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Une erreur est survenue lors de la connexion.")
      }

      showToast("Connexion réussie. Bienvenue !", "success")
      
      // Redirection vers le tableau de bord
      router.push(redirectPath)
      router.refresh()
    } catch (erreur: any) {
      setError(erreur.message)
      showToast(erreur.message || "Identifiants invalides.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* ─── Éléments graphiques décoratifs d'arrière-plan ─── */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-orange/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-green/10 blur-3xl" />

      {/* ─── Conteneur central (Glassmorphic) ─── */}
      <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl border glass-card relative z-10 animate-scale-up">
        
        {/* Logo Baarako */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-orange flex items-center justify-center text-white font-black text-2xl glow-orange mb-3">
            B
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-white">
            BAARAKO CARD
          </h1>
          <p className="text-xs text-brand-green font-semibold tracking-widest mt-1 uppercase">
            Administration
          </p>
        </div>

        {/* Message d'erreur intégré */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-brand-red-muted/30 border border-brand-red/30 flex items-start space-x-3 text-brand-red animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-xs font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground tracking-wide block uppercase">
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@baarako.com"
                className="
                  w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-medium text-white bg-transparent
                  border-border/40 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 outline-none
                  transition-all duration-300 placeholder:text-muted-foreground/50
                "
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground tracking-wide block uppercase">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="
                  w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-medium text-white bg-transparent
                  border-border/40 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 outline-none
                  transition-all duration-300 placeholder:text-muted-foreground/50
                "
              />
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full mt-2 py-3 px-4 rounded-2xl text-sm font-semibold tracking-wide text-white bg-brand-orange
              hover:bg-brand-orange/90 glow-orange flex items-center justify-center space-x-2
              transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
            "
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Pied de page du formulaire */}
        <div className="mt-8 pt-4 border-t border-border/20 text-center">
          <p className="text-[10px] text-muted-foreground">
            Accès réservé aux administrateurs de Baarako Card.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
