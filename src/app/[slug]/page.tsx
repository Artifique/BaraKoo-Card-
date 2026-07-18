// Page de profil public (Server Component Next.js, rendu dynamique côté serveur)
// Désactiver le pré-rendu statique car les données viennent de la base de données PostgreSQL
export const dynamic = 'force-dynamic'

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import prisma, { mapperPrismaVersHolder } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Phone, 
  Mail, 
  MapPin, 
  Download, 
  Globe, 
  Linkedin, 
  Facebook, 
  Instagram, 
  Twitter, 
  MessageSquare,
  AlertCircle
} from "lucide-react"
import { headers } from "next/headers"
import { PublicDocumentsSection } from "@/components/PublicDocumentsSection"

interface ProfilePageProps {
  params: Promise<{ slug: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params

  // 1. Rechercher les informations de la carte liée au slug (Cascade tolérante pour les accents et encodages Unicode)
  let card = await prisma.card.findUnique({
    where: { slug }
  })

  if (!card) {
    try {
      const decodedSlug = decodeURIComponent(slug)
      // Essai avec le slug décodé
      card = await prisma.card.findUnique({
        where: { slug: decodedSlug }
      })
      
      // Essai avec normalisation NFC (Composé, ex: ï en un seul caractère)
      if (!card) {
        card = await prisma.card.findUnique({
          where: { slug: decodedSlug.normalize("NFC") }
        })
      }
      
      // Essai avec normalisation NFD (Décomposé, ex: i + tréma séparés)
      if (!card) {
        card = await prisma.card.findUnique({
          where: { slug: decodedSlug.normalize("NFD") }
        })
      }
    } catch (e) {
      console.error("Erreur lors de la résolution du slug :", e)
    }
  }
  
  // Si la carte n'existe pas, afficher le message d'indisponibilité
  if (!card) {
    return <InactiveProfileMessage reason="non_existent" />
  }

  // Si la carte est configurée comme inactive, bloquer l'accès
  if (card.statut !== "ACTIVE") {
    return <InactiveProfileMessage reason="inactive" />
  }

  // 2. Charger les informations détaillées du titulaire de la carte
  const holder = await prisma.cardHolder.findUnique({
    where: { id: card.holderId },
    include: { organisation: true, service: true }
  })

  // Si le profil n'existe pas ou s'il est suspendu, bloquer l'accès
  if (!holder || holder.statut !== "ACTIF") {
    return <InactiveProfileMessage reason="suspended" />
  }

  // 3. Enregistrer un scan de visite (QR Code par défaut pour le chargement Web)
  try {
    await prisma.cardScan.create({
      data: {
        cardId: card.id,
        methode: "QR_CODE",
        appareil: "Navigateur Web"
      }
    })
  } catch (erreur) {
    console.error("Erreur enregistrement scan :", erreur)
  }

  const org = holder.organisation
  const holderMapped = mapperPrismaVersHolder(holder)

  // Construction dynamique de l'URL du profil pour le QR code
  const headersList = await headers()
  const host = headersList.get("host") || "baarako.card"
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  const profileUrl = `${protocol}://${host}/${slug}`

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-start items-center px-4 py-8 md:py-16 selection:bg-brand-orange/30">
      <div className="w-full max-w-md flex flex-col space-y-6">
        
        {/* En-tête / Logo de l'organisation */}
        <div className="flex justify-between items-center w-full px-2">
          {org ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 relative rounded-full overflow-hidden border border-border/50 bg-white/10 flex items-center justify-center">
                {org.logoUrl ? (
                  <img 
                    src={org.logoUrl} 
                    alt={org.nom} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-white">{org.nom.substring(0, 2)}</span>
                )}
              </div>
              <span className="text-sm font-semibold text-foreground/95">{org.nom}</span>
            </div>
          ) : (
            <span className="text-sm font-bold tracking-wider text-brand-orange">BAARAKO JOBCARD</span>
          )}
          
          {/* Indicateur de langues */}
          <div className="text-xs text-muted-foreground/80 bg-secondary px-2.5 py-1 rounded-full border border-border/20">
            FR / BAM
          </div>
        </div>

        {/* ─── CARTE VISUELLE PHYSIQUE FIDÈLE À L'IMAGE ─── */}
        <div className="relative w-full aspect-[1.58] rounded-[24px] bg-[#041124] border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-3.5 sm:p-5 text-white flex flex-col justify-between select-none">
          {/* Ruban Mali courbes (Orange et Vert) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 316" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M365,-20 C325,100 320,185 435,336" stroke="#f26f21" strokeWidth="12" fill="none"/>
            <path d="M378,-20 C338,100 333,185 448,336" stroke="#00a859" strokeWidth="12" fill="none"/>
          </svg>

          {/* Ligne 1 : Logo/Sceau + Brand & Slogan (Gauche) | NFC & Signal (Droite) */}
          <div className="flex justify-between items-start z-10">
            {/* Sceau doré de l'organisation ou THEMIS */}
            <div className="flex items-start space-x-2.5 sm:space-x-3">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-amber-500/50 bg-[#081d38] flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                  {org?.logoUrl ? (
                    <img src={org.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-gradient-to-tr from-amber-600 to-yellow-400">
                      {/* Icône de balance de justice stylisée */}
                      <svg className="w-5 h-5 text-[#041124]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17m0-17L4 9h16L12 3zM4 9c0 4 2 7 8 7s8-3 8-7H4z" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-[6px] sm:text-[7px] text-gray-300 font-extrabold mt-1 uppercase tracking-wider text-center max-w-[80px] leading-tight break-words">
                  {org?.nom || "Ministère de la justice"}
                </span>
              </div>

              {/* Titre et Slogan */}
              <div className="flex flex-col mt-0.5">
                <div className="flex items-baseline">
                  <span className="text-sm sm:text-base font-black tracking-tight text-white">Baarako</span>
                  <span className="text-sm sm:text-base font-black tracking-tight text-brand-orange ml-1">Jobcard</span>
                </div>
                <span className="text-[7px] sm:text-[8px] text-gray-400 font-medium tracking-tight">
                  Votre carrière entre de bonnes mains
                </span>
              </div>
            </div>

            {/* NFC section en haut à droite */}
            <div className="flex flex-col items-end text-right mt-0.5">
              <div className="flex items-center space-x-1 text-brand-green">
                {/* Icône NFC Waves */}
                <svg className="w-3.5 h-3.5 text-brand-green" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5a6.5 6.5 0 000-13M14.5 15a3 3 0 000-6M9.5 15a3 3 0 010-6M17 18.5a9.5 9.5 0 000-13" />
                </svg>
                <span className="text-[9px] sm:text-[10px] font-black tracking-widest">NFC</span>
              </div>
              <span className="text-[5.5px] sm:text-[7px] text-gray-400 font-medium">Approchez votre téléphone</span>
            </div>
          </div>

          {/* Ligne 2 : Photo + Identité (Gauche) | QR Code + Scannez-moi (Droite) */}
          <div className="flex justify-between items-end z-10">
            {/* Infos identité */}
            <div className="flex flex-col space-y-1.5 sm:space-y-2">
              <div className="flex items-center space-x-2.5 sm:space-x-3">
                {/* Photo de profil carrée à coins arrondis */}
                <div className="relative w-14 h-14 sm:w-18 sm:h-18 rounded-[12px] sm:rounded-[16px] overflow-hidden border-2 border-white/20 bg-secondary shadow-md shrink-0">
                  <img
                    src={holderMapped.avatarUrl}
                    alt={holderMapped.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                {/* Nom & Poste */}
                <div className="flex flex-col">
                  <h2 className="text-xs sm:text-base font-extrabold text-white leading-tight tracking-tight">
                    {holderMapped.name}
                  </h2>
                  <span className="text-[8px] sm:text-[10px] font-bold text-brand-green mt-0.5 leading-none">
                    {holderMapped.title}
                  </span>
                  
                  {/* Badge de disponibilité style pill */}
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded-[4px] text-[6px] sm:text-[7px] font-extrabold uppercase tracking-wider text-white ${holderMapped.availability === "available" ? "bg-brand-green" : "bg-destructive"}`}>
                      {holderMapped.availability === "available" ? "DISPONIBLE" : "NON DISPONIBLE"}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* ID de la carte */}
              <span className="text-[7px] sm:text-[9px] font-mono text-brand-green/90 font-bold tracking-wider">
                ID : {holderMapped.id}
              </span>
            </div>

            {/* QR Code et Bouton d'appel à l'action */}
            <div className="flex flex-col items-center space-y-1.5 shrink-0">
              <div className="p-0.5 sm:p-1 bg-white rounded-lg shadow-md w-14 h-14 sm:w-18 sm:h-18 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(profileUrl)}`}
                  alt="QR Code du Profil"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="bg-brand-orange text-white text-[7px] sm:text-[8px] font-black px-2 py-0.5 sm:py-1 rounded-full flex items-center space-x-1 uppercase tracking-wider shadow-md border border-brand-orange/30">
                {/* Smartphone Icon */}
                <svg className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="2" width="14" height="20" rx="2"/>
                  <path d="M12 18h.01" strokeLinecap="round"/>
                </svg>
                <span>Scannez-moi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton d'action principal orange - Enregistrer le contact */}
        <div className="w-full mt-2">
          <a 
            href={`/api/vcard/${holderMapped.id}`} 
            download
            className="w-full block"
          >
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full flex items-center justify-center gap-3 relative py-3.5 glow-orange active:scale-95 group cursor-pointer"
            >
              <Download className="w-5 h-5 animate-pulse group-hover:scale-110 transition-transform" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-sm font-bold uppercase tracking-wider">Enregistrer le contact</span>
                <span className="text-[10px] text-white/70 font-medium lowercase italic">Mara sogo</span>
              </div>
            </Button>
          </a>
        </div>

        {/* ─── 1. BIBLIOGRAPHIE (À LA PLACE DE À PROPOS) ─── */}
        {holderMapped.bio && (
          <Card className="border-border/40 shadow-xl overflow-hidden bg-card">
            <CardContent className="p-5">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold border-b border-border/25 pb-2 mb-3">
                Bibliographie
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed text-justify whitespace-pre-line">
                {holderMapped.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ─── 2. DESCRIPTION DE L'ORGANISATION ─── */}
        {org && (
          <Card className="border-border/40 shadow-xl overflow-hidden bg-card">
            <CardContent className="p-5 flex flex-col space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold border-b border-border/25 pb-2">
                Organisation
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 relative rounded-full overflow-hidden border border-border/40 bg-white/15 flex items-center justify-center">
                  {org.logoUrl ? (
                    <img 
                      src={org.logoUrl} 
                      alt={org.nom} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-white">{org.nom.substring(0, 2)}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground leading-none">{org.nom}</h2>
                  <span className="text-[10px] text-brand-green font-medium mt-0.5 inline-block">{org.secteur}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed text-justify">{org.description}</p>
              
              <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border/20 text-[11px] text-foreground/70">
                {org.siteWeb && (
                  <a href={org.siteWeb} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-brand-orange transition-colors">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Site web</span>
                  </a>
                )}
                {org.telephone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{org.telephone}</span>
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── 3. COORDONNÉES RAPIDES ─── */}
        <Card className="border-border/40 shadow-xl overflow-hidden bg-card">
          <CardContent className="p-5">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold border-b border-border/25 pb-2 mb-4">
              Coordonnées rapides
            </h3>
            <div className="grid grid-cols-4 gap-4 w-full">
              {/* Téléphone */}
              {holderMapped.phone && (
                <a 
                  href={`tel:${holderMapped.phone}`}
                  className="flex flex-col items-center gap-1.5 group"
                  title="Appeler"
                >
                  <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center group-hover:bg-brand-orange/15 border border-border/50 group-hover:border-brand-orange/40 transition-all duration-300">
                    <Phone className="w-5 h-5 text-foreground/90 group-hover:text-brand-orange group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-medium">Appeler</span>
                </a>
              )}

              {/* WhatsApp */}
              {holderMapped.whatsapp && (
                <a 
                  href={`https://wa.me/${holderMapped.whatsapp.replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 group"
                  title="WhatsApp"
                >
                  <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center group-hover:bg-brand-green/15 border border-border/50 group-hover:border-brand-green/40 transition-all duration-300">
                    <MessageSquare className="w-5 h-5 text-foreground/90 group-hover:text-brand-green group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-medium">WhatsApp</span>
                </a>
              )}

              {/* Email */}
              {holderMapped.email && (
                <a 
                  href={`mailto:${holderMapped.email}`}
                  className="flex flex-col items-center gap-1.5 group"
                  title="Email"
                >
                  <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center group-hover:bg-blue-500/15 border border-border/50 group-hover:border-blue-500/40 transition-all duration-300">
                    <Mail className="w-5 h-5 text-foreground/90 group-hover:text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-medium">Email</span>
                </a>
              )}

              {/* Localisation */}
              {holderMapped.googleMapsUrl && (
                <a 
                  href={holderMapped.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 group"
                  title="Adresse"
                >
                  <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center group-hover:bg-red-500/15 border border-border/50 group-hover:border-red-500/40 transition-all duration-300">
                    <MapPin className="w-5 h-5 text-foreground/90 group-hover:text-red-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-medium">Adresse</span>
                </a>
              )}
            </div>

            {/* Réseaux sociaux */}
            <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-border/20 w-full">
              {holderMapped.linkedin && (
                <a 
                  href={holderMapped.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full glass-panel flex items-center justify-center border border-border/40 hover:bg-blue-600/15 hover:border-blue-500/30 text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {holderMapped.facebook && (
                <a 
                  href={holderMapped.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full glass-panel flex items-center justify-center border border-border/40 hover:bg-blue-700/15 hover:border-blue-600/30 text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {holderMapped.instagram && (
                <a 
                  href={holderMapped.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full glass-panel flex items-center justify-center border border-border/40 hover:bg-pink-600/15 hover:border-pink-500/30 text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {holderMapped.twitter && (
                <a 
                  href={holderMapped.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full glass-panel flex items-center justify-center border border-border/40 hover:bg-slate-500/15 hover:border-slate-400/30 text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {holderMapped.website && (
                <a 
                  href={holderMapped.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full glass-panel flex items-center justify-center border border-border/40 hover:bg-brand-orange/15 hover:border-brand-orange/30 text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ─── 4. DOCUMENTS D'ACCOMPAGNEMENT (CV & LETTRE DE MOTIVATION) ─── */}
        <PublicDocumentsSection 
          holderId={holderMapped.id}
          holderName={holderMapped.name}
          cvUrl={holderMapped.cvUrl}
          lettreMotivationUrl={holderMapped.lettreMotivationUrl}
        />

        {/* Footer de marque */}
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <p className="text-[10px] text-muted-foreground/60 tracking-wider uppercase font-semibold">
            Propulsé par <span className="text-brand-orange font-bold">Baarako Card</span>
          </p>
          <p className="text-[9px] text-muted-foreground/45 mt-0.5">
            Carte de contact professionnelle intelligente
          </p>
        </div>

      </div>
    </main>
  )
}

// Composant d'affichage de l'état d'erreur ou d'indisponibilité du profil
function InactiveProfileMessage({ reason }: { reason: "non_existent" | "inactive" | "suspended" }) {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md text-center flex flex-col items-center space-y-6">
        <div className="w-16 h-16 rounded-full glass-panel border border-brand-red/30 flex items-center justify-center shadow-lg animate-bounce">
          <AlertCircle className="w-8 h-8 text-brand-red" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground font-sans">Profil non disponible</h1>
          <p className="text-xs font-mono text-brand-red/80 lowercase italic font-semibold">Profil ma sôrô</p>
          <p className="text-sm text-muted-foreground px-4 leading-relaxed">
            {reason === "non_existent" 
              ? "Cette carte ne correspond à aucun profil enregistré."
              : "Le titulaire a temporairement suspendu ou désactivé cette carte de contact."}
          </p>
        </div>
        
        <div className="pt-4 w-full">
          <Link href="/admin">
            <Button variant="secondary" size="default" className="text-xs cursor-pointer">
              Accéder au Dashboard d'administration
            </Button>
          </Link>
        </div>
        
        <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest pt-8">
          Baarako Card Security System
        </p>
      </div>
    </main>
  )
}
