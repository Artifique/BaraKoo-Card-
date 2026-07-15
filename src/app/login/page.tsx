// Page de connexion pour l'administration
"use client"

import React, { useState, Suspense } from "react"
import Image from "next/image"
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
    <div className="min-h-screen bg-[#070c16] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* ─── Halos lumineux colorés d'arrière-plan interactifs et premium ─── */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-brand-orange/20 blur-[130px] animate-pulse duration-[10000ms] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-[#16A34A]/15 blur-[130px] animate-pulse duration-[8000ms] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
      
      {/* ─── Conteneur central (Glassmorphism Premium ultra-travaillé) ─── */}
      <div className="w-full max-w-md p-8 md:p-10 rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10 bg-white/[0.02] backdrop-blur-3xl relative z-10 animate-scale-up">
        
        {/* Enveloppe de reflets lumineux internes sur le conteneur */}
        <div className="absolute inset-0 rounded-[32px] pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        {/* Logo Baarako */}
        <div className="flex flex-col items-center mb-8 relative">
          {/* Halo doux derrière le logo */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-brand-orange to-[#16A34A] blur-lg opacity-40 shrink-0 pointer-events-none" />
          
          {/* Logo réel brut (Affiché tel quel) */}
          <div className="w-24 h-24 shrink-0 flex items-center justify-center relative mb-4 z-10">
            <Image
              src="/images/BarakoKeneya.jpeg"
              alt="Logo Baarako Card"
              fill
              className="object-contain"
              priority
            />
          </div>
          
          <h1 className="text-2xl font-black tracking-wider text-white select-none">
            Baarako <span className="text-[#F97316]">Card</span>
          </h1>
          <p className="text-[10px] text-[#16A34A] font-extrabold tracking-[0.25em] mt-1.5 uppercase select-none">
            Tableau de Bord Admin
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
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold text-gray-400 tracking-wider block uppercase select-none">
              Adresse e-mail
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500 group-focus-within:text-[#F97316] transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@baarako.com"
                className="
                  w-full pl-11 pr-4 py-3.5 rounded-2xl border text-sm font-semibold text-white bg-[#0a0f1d]/60
                  border-white/5 focus:border-[#F97316]/60 focus:bg-[#0a0f1d]/90 focus:ring-1 focus:ring-[#F97316]/30 outline-none
                  transition-all duration-300 placeholder:text-gray-600 shadow-inner
                "
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold text-gray-400 tracking-wider block uppercase select-none">
              Mot de passe
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500 group-focus-within:text-[#16A34A] transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="
                  w-full pl-11 pr-12 py-3.5 rounded-2xl border text-sm font-semibold text-white bg-[#0a0f1d]/60
                  border-white/5 focus:border-[#16A34A]/60 focus:bg-[#0a0f1d]/90 focus:ring-1 focus:ring-[#16A34A]/30 outline-none
                  transition-all duration-300 placeholder:text-gray-600 shadow-inner
                "
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5 text-[#16A34A]" /> : <Eye className="w-4.5 h-4.5 text-[#16A34A]" />}
              </button>
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full mt-3 py-3.5 px-4 rounded-2xl text-sm font-bold tracking-wider text-white 
              bg-[#F97316] hover:bg-[#EA580C] shadow-[0_8px_30px_rgb(249,115,22,0.3)] hover:shadow-[0_8px_35px_rgb(249,115,22,0.4)]
              flex items-center justify-center space-x-2
              transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98
            "
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connexion sécurisée...</span>
              </>
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Pied de page du formulaire */}
        <div className="mt-8 pt-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-500 font-medium">
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
