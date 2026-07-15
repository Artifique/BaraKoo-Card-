// Page de connexion pour l'administration
"use client"

import React, { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useNotification } from "@/providers/NotificationProvider"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useNotification()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="min-h-screen bg-[#070b13] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* ─── Éléments graphiques décoratifs d'arrière-plan vibrants ─── */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-orange/20 blur-[140px] animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-green/15 blur-[140px] animate-pulse duration-[6000ms]" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[100px]" />

      {/* ─── Conteneur central (Glassmorphic Premium) ─── */}
      <div className="w-full max-w-md p-8 md:p-10 rounded-[32px] shadow-[0_0_50px_-12px_rgba(0,0,0,0.7)] border border-white/10 bg-white/[0.03] backdrop-blur-2xl relative z-10 animate-scale-up">
        
        {/* Logo Baarako */}
        <div className="flex flex-col items-center mb-9">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 flex items-center justify-center text-white font-black text-3xl shadow-[0_4px_20px_rgba(242,94,36,0.3)] mb-4">
            B
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            BAARAKO CARD
          </h1>
          <p className="text-[10px] text-brand-green font-bold tracking-[0.2em] mt-1.5 uppercase">
            Administration
          </p>
        </div>

        {/* Message d'erreur intégré */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start space-x-3 text-red-400 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-xs font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider block uppercase">
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@baarako.com"
                className="
                  w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-medium text-white bg-[#0e1422]/50
                  border-white/5 focus:border-brand-orange focus:bg-[#0e1422]/80 focus:ring-1 focus:ring-brand-orange/30 outline-none
                  transition-all duration-300 placeholder:text-gray-600
                "
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider block uppercase">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="
                  w-full pl-11 pr-12 py-3 rounded-2xl border text-sm font-medium text-white bg-[#0e1422]/50
                  border-white/5 focus:border-brand-orange focus:bg-[#0e1422]/80 focus:ring-1 focus:ring-brand-orange/30 outline-none
                  transition-all duration-300 placeholder:text-gray-600
                "
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full mt-2 py-3.5 px-4 rounded-2xl text-sm font-bold tracking-wider text-white bg-brand-orange
              hover:bg-brand-orange/95 shadow-[0_4px_25px_rgba(242,94,36,0.2)] flex items-center justify-center space-x-2
              transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98
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
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Pied de page du formulaire */}
        <div className="mt-8 pt-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-500">
            Accès sécurisé réservé aux administrateurs de Baarako Card.
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
