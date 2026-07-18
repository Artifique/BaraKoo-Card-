"use client"

import React, { useState } from "react"
import { Download, Upload, CheckCircle2, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNotification } from "@/providers/NotificationProvider"

interface PublicDocumentsSectionProps {
  holderId: string
  holderName: string
  cvUrl?: string | null
  lettreMotivationUrl?: string | null
}

export function PublicDocumentsSection({ holderId, holderName, cvUrl, lettreMotivationUrl }: PublicDocumentsSectionProps) {
  const { showToast, showDialog } = useNotification()
  const [uploadingCv, setUploadingCv] = useState(false)
  const [uploadingLettre, setUploadingLettre] = useState(false)
  const [visitorCvUrl, setVisitorCvUrl] = useState<string | null>(null)
  const [visitorLettreUrl, setVisitorLettreUrl] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "cv" | "lettre") => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === "cv") setUploadingCv(true)
    else setUploadingLettre(true)

    try {
      const data = new FormData()
      data.append("file", file)
      data.append("bucket", "bucket-images")
      data.append("prefix", `visitor-${holderId}-${type}`)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Erreur de téléversement")

      if (type === "cv") {
        setVisitorCvUrl(result.url)
        showToast("Votre CV a été téléversé avec succès !", "success")
      } else {
        setVisitorLettreUrl(result.url)
        showToast("Votre Lettre de motivation a été téléversée avec succès !", "success")
      }
    } catch (err: any) {
      showDialog("Erreur", "Impossible d'envoyer le fichier : " + err.message, "error")
    } finally {
      if (type === "cv") setUploadingCv(false)
      else setUploadingLettre(false)
    }
  }

  return (
    <div className="space-y-6 w-full">
      {/* 1. Télécharger les documents du titulaire */}
      {(cvUrl || lettreMotivationUrl) && (
        <Card className="border-border/40 shadow-xl overflow-hidden bg-card">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold border-b border-border/25 pb-2">
              Documents de {holderName}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {cvUrl && (
                <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="w-full block">
                  <Button variant="secondary" className="w-full flex items-center justify-between py-3 text-xs font-bold border border-border/40 hover:bg-secondary/85 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4.5 h-4.5 text-brand-orange" />
                      <span>Télécharger le CV</span>
                    </span>
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </a>
              )}
              {lettreMotivationUrl && (
                <a href={lettreMotivationUrl} target="_blank" rel="noopener noreferrer" className="w-full block">
                  <Button variant="secondary" className="w-full flex items-center justify-between py-3 text-xs font-bold border border-border/40 hover:bg-secondary/85 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4.5 h-4.5 text-brand-orange" />
                      <span>Télécharger la Lettre de motivation</span>
                    </span>
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Upload de documents (visiteur/recruteur) */}
      <Card className="border-border/40 shadow-xl overflow-hidden bg-card">
        <CardContent className="p-5 space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold border-b border-border/25 pb-2">
            Soumettre vos documents (Optionnel)
          </h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Vous pouvez envoyer votre CV ou votre lettre de motivation directement à {holderName} via le stockage sécurisé.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bouton Upload CV */}
            <div className="flex flex-col space-y-1.5">
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => handleUpload(e, "cv")}
                disabled={uploadingCv}
                className="hidden"
                id="visitor-cv-upload"
              />
              <label
                htmlFor="visitor-cv-upload"
                className={`
                  w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold cursor-pointer transition-all duration-300
                  ${uploadingCv 
                    ? "bg-secondary text-muted-foreground border-border/30" 
                    : visitorCvUrl 
                      ? "bg-brand-green/10 text-brand-green border-brand-green/20"
                      : "bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange border-brand-orange/20"
                  }
                `}
              >
                {uploadingCv ? (
                  <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
                ) : visitorCvUrl ? (
                  <CheckCircle2 className="w-4 h-4 text-brand-green" />
                ) : (
                  <Upload className="w-4 h-4 text-brand-orange" />
                )}
                <span>{uploadingCv ? "Envoi..." : visitorCvUrl ? "CV Envoyé" : "Envoyer votre CV"}</span>
              </label>
            </div>

            {/* Bouton Upload Lettre */}
            <div className="flex flex-col space-y-1.5">
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => handleUpload(e, "lettre")}
                disabled={uploadingLettre}
                className="hidden"
                id="visitor-lettre-upload"
              />
              <label
                htmlFor="visitor-lettre-upload"
                className={`
                  w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold cursor-pointer transition-all duration-300
                  ${uploadingLettre 
                    ? "bg-secondary text-muted-foreground border-border/30" 
                    : visitorLettreUrl 
                      ? "bg-brand-green/10 text-brand-green border-brand-green/20"
                      : "bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange border-brand-orange/20"
                  }
                `}
              >
                {uploadingLettre ? (
                  <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
                ) : visitorLettreUrl ? (
                  <CheckCircle2 className="w-4 h-4 text-brand-green" />
                ) : (
                  <Upload className="w-4 h-4 text-brand-orange" />
                )}
                <span>{uploadingLettre ? "Envoi..." : visitorLettreUrl ? "Lettre Envoyée" : "Envoyer votre Lettre"}</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
