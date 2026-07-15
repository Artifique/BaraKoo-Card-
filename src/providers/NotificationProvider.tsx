// Fournisseur de contexte pour afficher des dialogues et toasts de succès ou d'erreur
"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { CheckCircle2, XCircle, Info, X } from "lucide-react"

// Types de notifications
export type NotificationType = "success" | "error" | "info"

interface DialogState {
  isOpen: boolean
  title: string
  message: string
  type: NotificationType
  onConfirm?: () => void
}

interface ToastState {
  isOpen: boolean
  message: string
  type: NotificationType
}

interface NotificationContextProps {
  /** Affiche un dialogue modal central de succès/erreur */
  showDialog: (title: string, message: string, type: NotificationType, onConfirm?: () => void) => void
  /** Affiche un toast temporaire en bas à droite */
  showToast: (message: string, type: NotificationType) => void
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  })

  const [toast, setToast] = useState<ToastState>({
    isOpen: false,
    message: "",
    type: "success",
  })

  // Fermer automatiquement le toast après 4 secondes
  useEffect(() => {
    if (toast.isOpen) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, isOpen: false }))
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toast.isOpen])

  const showDialog = (title: string, message: string, type: NotificationType, onConfirm?: () => void) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
    })
  }

  const showToast = (message: string, type: NotificationType) => {
    setToast({
      isOpen: true,
      message,
      type,
    })
  }

  const handleCloseDialog = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }))
    if (dialog.onConfirm) {
      dialog.onConfirm()
    }
  }

  return (
    <NotificationContext.Provider value={{ showDialog, showToast }}>
      {children}

      {/* ─── MODALE DE DIALOGUE PRINCIPALE ─── */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Arrière-plan flouté */}
          <div 
            className="absolute inset-0 bg-brand-navy/60 backdrop-blur-md transition-all duration-300"
            onClick={handleCloseDialog}
          />
          
          {/* Conteneur de la boîte de dialogue */}
          <div className="
            relative w-full max-w-md p-6 rounded-3xl shadow-2xl border
            glass-card text-center overflow-hidden transform scale-95 animate-scale-up
          ">
            {/* Dégradé lumineux d'arrière-plan */}
            <div className={`
              absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20
              ${dialog.type === "success" ? "bg-brand-green" : dialog.type === "error" ? "bg-destructive" : "bg-brand-orange"}
            `} />

            {/* Bouton fermer en haut à droite */}
            <button 
              onClick={handleCloseDialog}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-muted/40 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icône principale */}
            <div className="flex justify-center mb-5">
              {dialog.type === "success" && (
                <div className="p-3 rounded-full bg-brand-green-muted/20 border border-brand-green/20 text-brand-green animate-bounce">
                  <CheckCircle2 className="w-12 h-12 glow-green rounded-full" />
                </div>
              )}
              {dialog.type === "error" && (
                <div className="p-3 rounded-full bg-brand-red-muted/20 border border-brand-red/20 text-brand-red animate-pulse">
                  <XCircle className="w-12 h-12 text-brand-red" />
                </div>
              )}
              {dialog.type === "info" && (
                <div className="p-3 rounded-full bg-brand-orange/20 border border-brand-orange/20 text-brand-orange">
                  <Info className="w-12 h-12 glow-orange rounded-full" />
                </div>
              )}
            </div>

            {/* Titre et Message */}
            <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">
              {dialog.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed px-2 mb-6">
              {dialog.message}
            </p>

            {/* Bouton d'action */}
            <button
              onClick={handleCloseDialog}
              className={`
                w-full py-3 px-4 rounded-2xl text-sm font-semibold tracking-wide text-white transition-all duration-300 cursor-pointer
                ${dialog.type === "success" 
                  ? "bg-brand-green hover:bg-brand-green/90 glow-green" 
                  : dialog.type === "error" 
                    ? "bg-brand-red hover:bg-brand-red/90" 
                    : "bg-brand-orange hover:bg-brand-orange/90 glow-orange"}
              `}
            >
              D'accord
            </button>
          </div>
        </div>
      )}

      {/* ─── TOAST TEMPORAIRE ─── */}
      {toast.isOpen && (
        <div className="
          fixed bottom-5 right-5 z-50 flex items-center space-x-3 p-4 rounded-2xl shadow-xl border
          glass-card max-w-sm animate-slide-in-right overflow-hidden
        ">
          {/* Indicateur de couleur gauche */}
          <div className={`
            absolute left-0 top-0 bottom-0 w-1.5
            ${toast.type === "success" ? "bg-brand-green" : toast.type === "error" ? "bg-brand-red" : "bg-brand-orange"}
          `} />

          {/* Icône du toast */}
          {toast.type === "success" && (
            <CheckCircle2 className="w-5 h-5 text-brand-green shrink-0 ml-1" />
          )}
          {toast.type === "error" && (
            <XCircle className="w-5 h-5 text-brand-red shrink-0 ml-1" />
          )}
          {toast.type === "info" && (
            <Info className="w-5 h-5 text-brand-orange shrink-0 ml-1" />
          )}

          {/* Message du toast */}
          <p className="text-xs font-medium text-foreground pr-4 leading-tight">
            {toast.message}
          </p>

          {/* Bouton fermer le toast */}
          <button 
            onClick={() => setToast((prev) => ({ ...prev, isOpen: false }))}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/30 p-1 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification doit être utilisé au sein d'un NotificationProvider")
  }
  return context
}
